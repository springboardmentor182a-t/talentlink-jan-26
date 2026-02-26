import hashlib
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
import secrets
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src.entities.user import User
from src.auth.models import (
    UserRegister,
    UserLogin,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
RESET_TOKEN_EXPIRE_HOURS = 24

# ── Startup safety guard ──────────────────────────────────────────────────────
# Fail loudly on startup if SECRET_KEY was never set. A default or empty key
# means every token ever issued can be forged by anyone who reads this file.
_WEAK_KEYS = {"", "your-secret-key-change-in-production", "secret", "changeme"}
if SECRET_KEY in _WEAK_KEYS:
    raise RuntimeError(
        "SECRET_KEY is not set or is using the insecure default. "
        "Set a strong random value in your .env file:\n"
        "  python -c \"import secrets; print(secrets.token_hex(32))\""
    )


def _hash_token(raw_token: str) -> str:
    """SHA-256 hash a token before storing it in the database.

    Reset tokens are credentials. If the database is ever breached, hashed
    tokens cannot be used directly — the attacker would need the raw value
    that was only ever sent to the user's email.

    NOTE: constant-time comparison is not applied here. The 32-byte URL-safe
    random token makes timing-based guessing computationally infeasible, and
    the database round-trip dominates any timing variance anyway.
    """
    return hashlib.sha256(raw_token.encode()).hexdigest()


def _send_reset_email(to_address: str, raw_token: str) -> None:
    """Send a password reset link to the user's email address.

    Reads SMTP configuration from environment variables:

        SMTP_HOST       — e.g. smtp.sendgrid.net, email-smtp.us-east-1.amazonaws.com
        SMTP_PORT       — 587 (STARTTLS, recommended) or 465 (SSL). Defaults to 587.
        SMTP_USER       — SMTP username or API key identifier
        SMTP_PASSWORD   — SMTP password or API key secret
        SMTP_FROM       — verified sender address, e.g. noreply@talentlink.com
        FRONTEND_URL    — base URL of the React app, e.g. https://app.talentlink.com

    Compatible with any standard SMTP relay: SendGrid, AWS SES, Mailgun, Resend,
    Postmark, or a self-hosted mail server. For SendGrid use port 587 with
    'apikey' as SMTP_USER and your API key as SMTP_PASSWORD.

    The reset link embedded in the email is:
        {FRONTEND_URL}/reset-password/{raw_token}

    On SMTP failure the error is logged server-side. The caller (request_password_reset)
    intentionally returns the same success message regardless — this prevents an
    attacker from detecting email delivery failures to enumerate valid addresses.
    """
    smtp_host     = os.getenv("SMTP_HOST", "")
    smtp_port     = int(os.getenv("SMTP_PORT", "587"))
    smtp_user     = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_from     = os.getenv("SMTP_FROM", "")
    frontend_url  = os.getenv("FRONTEND_URL", "").rstrip("/")

    missing = [
        name for name, val in {
            "SMTP_HOST":     smtp_host,
            "SMTP_USER":     smtp_user,
            "SMTP_PASSWORD": smtp_password,
            "SMTP_FROM":     smtp_from,
            "FRONTEND_URL":  frontend_url,
        }.items()
        if not val
    ]
    if missing:
        raise RuntimeError(
            f"Password reset email cannot be sent — missing env vars: {', '.join(missing)}. "
            "Add them to your .env file. See README for configuration."
        )

    reset_link = f"{frontend_url}/reset-password/{raw_token}"

    # Plain-text and HTML parts — email clients render whichever they prefer.
    text_body = (
        f"You requested a password reset for your TalentLink account.\n\n"
        f"Click the link below to set a new password. "
        f"This link expires in {RESET_TOKEN_EXPIRE_HOURS} hours.\n\n"
        f"{reset_link}\n\n"
        f"If you did not request this, you can safely ignore this email. "
        f"Your password will not change."
    )
    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:auto">
      <h2 style="color:#1F4E79">Reset your TalentLink password</h2>
      <p>You requested a password reset. Click the button below to choose a new password.</p>
      <p>
        <a href="{reset_link}"
           style="display:inline-block;padding:12px 24px;background:#1F4E79;
                  color:#fff;text-decoration:none;border-radius:4px;font-weight:bold">
          Reset Password
        </a>
      </p>
      <p style="color:#666;font-size:13px">
        This link expires in {RESET_TOKEN_EXPIRE_HOURS} hours.<br>
        If you did not request a password reset, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #eee">
      <p style="color:#999;font-size:12px">TalentLink &mdash; Freelancer Platform</p>
    </body></html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your TalentLink password"
    msg["From"]    = smtp_from
    msg["To"]      = to_address
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        if smtp_port == 465:
            # Port 465: implicit SSL — wrap the connection from the start.
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, to_address, msg.as_string())
        else:
            # Port 587 (default): plain connection upgraded via STARTTLS.
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, to_address, msg.as_string())
    except smtplib.SMTPException as exc:
        # Log the error but do not re-raise. The caller returns the same
        # success message regardless so an attacker cannot detect delivery
        # failures to confirm which email addresses are registered.
        logger.error("SMTP error sending reset email to %s: %s", to_address, exc)


class AuthService:

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def generate_reset_token() -> str:
        return secrets.token_urlsafe(32)

    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> dict:
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()

        if existing_user:
            # NOTE (intentional): the error deliberately doesn't distinguish
            # between a duplicate email and a duplicate username. Splitting into
            # two queries would give a more specific frontend error, but the
            # current message also mildly resists username enumeration.
            # Change to two separate queries + specific messages if UX requires it.
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered",
            )

        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=AuthService.hash_password(user_data.password),
            role=user_data.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        access_token = AuthService.create_access_token(
            data={"sub": db_user.email, "user_id": db_user.id}
        )

        return {
            "user": db_user,
            "access_token": access_token,
            "token_type": "bearer",
        }

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> dict:
        user = db.query(User).filter(User.email == login_data.email).first()

        if not user or not user.hashed_password:
            # Covers two cases:
            #   1. User not found — generic message to prevent email enumeration.
            #   2. OAuth-only account — hashed_password is NULL, password login
            #      is not valid for this account. Same message intentionally so
            #      an attacker cannot distinguish the two cases.
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not AuthService.verify_password(
            login_data.password, user.hashed_password  # type: ignore[arg-type]
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user.last_login = datetime.utcnow()  # type: ignore[assignment]
        db.commit()

        access_token = AuthService.create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }

    @staticmethod
    def request_password_reset(db: Session, request_data: ForgotPasswordRequest) -> dict:
        user = db.query(User).filter(User.email == request_data.email).first()

        # Always return the same message to prevent email enumeration.
        if not user:
            return {"message": "If that email exists, a password reset link has been sent."}

        raw_token = AuthService.generate_reset_token()

        # Store the HASH — never the raw token. The raw token is only sent to
        # the user's email. If the DB leaks, the hashed value alone cannot be
        # used to reset anyone's password.
        user.reset_token = _hash_token(raw_token)  # type: ignore[assignment]
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)  # type: ignore[assignment]
        db.commit()

        if os.getenv("APP_ENV") == "development":
            # Development only: return the raw token in the response so the
            # flow can be tested without a real SMTP server.
            # This key is intentionally excluded from ForgotPasswordResponse
            # so it is stripped at the HTTP boundary in all environments.
            return {
                "message": "If that email exists, a password reset link has been sent.",
                "reset_token": raw_token,
            }

        # Production / staging: deliver the token via email.
        # _send_reset_email raises RuntimeError if SMTP env vars are missing,
        # and catches smtplib.SMTPException internally for delivery failures.
        # We catch RuntimeError here too so a misconfigured server never leaks
        # a 500 — the caller always receives the same success message regardless,
        # preventing email enumeration via error-response differentiation.
        try:
            _send_reset_email(user.email, raw_token)  # type: ignore[arg-type]
        except RuntimeError as exc:
            logger.error(
                "Password reset email misconfiguration — SMTP env vars missing or invalid: %s", exc
            )

        return {"message": "If that email exists, a password reset link has been sent."}

    @staticmethod
    def reset_password(db: Session, reset_data: ResetPasswordRequest) -> dict:
        # Hash the incoming token and look up the hash — the raw token is never
        # stored, so we can only compare hashes.
        token_hash = _hash_token(reset_data.token)

        user = db.query(User).filter(
            User.reset_token == token_hash,
            User.reset_token_expires > datetime.utcnow(),
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )

        user.hashed_password = AuthService.hash_password(reset_data.new_password)  # type: ignore[assignment]
        user.reset_token = None  # type: ignore[assignment]
        user.reset_token_expires = None  # type: ignore[assignment]
        db.commit()

        return {"message": "Password has been reset successfully. You can now login with your new password."}
    