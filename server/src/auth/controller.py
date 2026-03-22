from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import os
import httpx
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.database.core import get_db
from src.auth.models import RegisterRequest, LoginRequest
from src.auth.service import register_user, authenticate_user, create_token, hash_password
from src.entities.user import User

router = APIRouter(tags=["Authentication"])

reset_tokens = {}


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, data.name, data.email, data.password, data.role)
    if not user:
        raise HTTPException(status_code=400, detail="User already exists")
    return {"message": "Registration successful"}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "token": token,
        "role": user.role,
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }


@router.post("/google")
async def google_login(payload: dict, db: Session = Depends(get_db)):
    access_token = payload.get("token")
    role = payload.get("role", "client")
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        user_info = res.json()
    email = user_info.get("email")
    name  = user_info.get("name", email)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = register_user(db, name, email, "google_oauth", role)
    token = create_token({"sub": user.email, "role": user.role})
    return {
        "token": token,
        "role": user.role,
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": os.getenv("GITHUB_CLIENT_ID"),
                "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
                "code": code
            },
            headers={"Accept": "application/json"}
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="Invalid GitHub code")
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_res.json()
        if not user_info.get("email"):
            email_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            emails = email_res.json()
            primary = next((e["email"] for e in emails if e["primary"]), None)
            user_info["email"] = primary or f"{user_info['login']}@github.com"

    email = user_info.get("email")
    name  = user_info.get("name") or user_info.get("login")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = register_user(db, name, email, "github_oauth", "client")
    token = create_token({"sub": user.email, "role": user.role})
    return RedirectResponse(
        url=f"http://localhost:3000/oauth/callback?token={token}&role={user.role}&id={user.id}&name={user.name}&email={user.email}"
    )


@router.post("/forgot-password")
async def forgot_password(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If this email exists, a reset link has been sent."}

    token = secrets.token_urlsafe(32)
    reset_tokens[token] = email
    reset_link = f"http://localhost:3000/reset-password?token={token}"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "TalentLink - Password Reset Request"
        msg["From"]    = os.getenv("EMAIL_ADDRESS")
        msg["To"]      = email

        html = f"""
        <html>
        <body style="font-family:'Segoe UI',sans-serif; background:#f0f2f5; padding:40px;">
          <div style="max-width:480px; margin:0 auto; background:white; padding:40px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="text-align:center; margin-bottom:32px;">
              <h1 style="color:#2563eb; font-size:28px; margin:0;">💼 TalentLink</h1>
            </div>
            <h2 style="color:#111827; font-size:22px;">Reset Your Password</h2>
            <p style="color:#6b7280; line-height:1.7;">
              Hi {user.name},<br><br>
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <div style="text-align:center; margin:32px 0;">
              <a href="{reset_link}"
                style="background:linear-gradient(135deg,#2563eb,#3b82f6); color:white; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">
                Reset Password →
              </a>
            </div>
            <p style="color:#9ca3af; font-size:13px;">
              This link expires in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">
            <p style="color:#9ca3af; font-size:12px; text-align:center;">© 2026 TalentLink. All rights reserved.</p>
          </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(os.getenv("EMAIL_ADDRESS"), os.getenv("EMAIL_PASSWORD"))
            server.sendmail(os.getenv("EMAIL_ADDRESS"), email, msg.as_string())

    except Exception as e:
        print(f"Email error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(payload: dict, db: Session = Depends(get_db)):
    token    = payload.get("token")
    password = payload.get("password")

    if not token or not password:
        raise HTTPException(status_code=400, detail="Token and password are required")

    email = reset_tokens.get(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(password)
    db.commit()
    del reset_tokens[token]

    return {"message": "Password reset successful"}