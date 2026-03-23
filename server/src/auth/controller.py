from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.models import (
    UserRegister, UserLogin, UserResponse, RegisterResponse,
    LoginResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
)
from src.auth.service import AuthService
from src.auth import oauth

router = APIRouter()


# ── Password auth ─────────────────────────────────────────────────────────────

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    return AuthService.register_user(db, user_data)


@router.post("/login", response_model=LoginResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    result = AuthService.authenticate_user(db, login_data)
    return {
        "access_token": result["access_token"],
        "token_type":   "bearer",
        "user":         result["user"],
    }


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a password reset token."""
    return AuthService.request_password_reset(db, request_data)


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(reset_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid reset token"""
    return AuthService.reset_password(db, reset_data)


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
def google_login(role: str = Query(default="freelancer")):
    """Redirect the browser to Google's OAuth consent screen.

    role is passed as a query param from the frontend button click
    (e.g. /api/auth/google?role=client) and encoded into the state
    parameter so it survives the round trip through Google's servers.
    """
    url = oauth.google_auth_url(role)
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(
    code:  str = Query(...),
    state: str = Query(default="freelancer:"),
    db:    Session = Depends(get_db),
):
    """Handle Google's redirect back after user grants permission.

    Exchanges the auth code for user info, finds or creates the User,
    issues a JWT, then redirects the browser to the frontend callback
    page with the token in the URL fragment (never in query string —
    fragments are not sent to the server or stored in browser history).
    """
    result = await oauth.google_callback(code, state, db)
    frontend_url = oauth.FRONTEND_URL
    token = result["access_token"]
    role  = result["user"]["role"]
    username = result["user"]["username"]
    user_id  = result["user"]["id"]
    # Redirect to frontend callback page with token + user info in fragment
    return RedirectResponse(
        f"{frontend_url}/auth/callback#token={token}&role={role}"
        f"&username={username}&user_id={user_id}"
    )


# ── GitHub OAuth ──────────────────────────────────────────────────────────────

@router.get("/github")
def github_login(role: str = Query(default="freelancer")):
    """Redirect the browser to GitHub's OAuth consent screen."""
    url = oauth.github_auth_url(role)
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(
    code:  str = Query(...),
    state: str = Query(default="freelancer:"),
    db:    Session = Depends(get_db),
):
    """Handle GitHub's redirect back after user grants permission."""
    result = await oauth.github_callback(code, state, db)
    frontend_url = oauth.FRONTEND_URL
    token = result["access_token"]
    role  = result["user"]["role"]
    username = result["user"]["username"]
    user_id  = result["user"]["id"]
    return RedirectResponse(
        f"{frontend_url}/auth/callback#token={token}&role={role}"
        f"&username={username}&user_id={user_id}"
    )