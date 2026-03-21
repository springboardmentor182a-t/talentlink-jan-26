# server/src/auth/oauth.py
"""
OAuth 2.0 backend flow — Google and GitHub.

Flow:
  1. Frontend redirects user to GET /api/auth/google?role=freelancer
  2. Backend redirects to provider's authorization URL (with state=role encoded)
  3. Provider redirects back to GET /api/auth/google/callback?code=...&state=...
  4. Backend exchanges code for access token, fetches user profile
  5. Backend finds or creates User, issues JWT, redirects to frontend with token

Why backend flow (not frontend):
  - Client secret never leaves the server
  - Token exchange happens server-side — no secret in JS bundle
  - Works the same on localhost and production (just register the callback URL)

Localhost setup:
  Google:  https://console.cloud.google.com → APIs & Services → Credentials
           Authorized redirect URI: http://localhost:3000/api/auth/google/callback
  GitHub:  https://github.com/settings/developers → OAuth Apps
           Authorization callback URL: http://localhost:3000/api/auth/github/callback

  Both platforms let you add a production URL later without removing localhost.

Required env vars:
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GITHUB_CLIENT_ID
  GITHUB_CLIENT_SECRET
  FRONTEND_URL   (already required for SMTP — e.g. http://localhost:3000)
"""

import os
import re
import secrets
import logging
from datetime import datetime
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.entities.user import User
from src.auth.service import AuthService

logger = logging.getLogger(__name__)

# ── Provider config ───────────────────────────────────────────────────────────

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

GOOGLE_AUTH_URL    = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL   = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

GITHUB_AUTH_URL    = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL   = "https://github.com/login/oauth/access_token"
GITHUB_USERINFO_URL = "https://api.github.com/user"
GITHUB_EMAIL_URL   = "https://api.github.com/user/emails"


def _google_callback_url() -> str:
    return f"{FRONTEND_URL}/api/auth/google/callback"


def _github_callback_url() -> str:
    return f"{FRONTEND_URL}/api/auth/github/callback"


def _encode_state(role: str) -> str:
    """Encode role + random nonce into the OAuth state parameter.

    Format: <role>:<random_hex>
    The random nonce prevents CSRF — each authorization attempt gets a unique state.
    We don't validate it server-side (no session store) but the role is extracted
    from it on callback to know what role to assign new users.
    """
    nonce = secrets.token_hex(16)
    return f"{role}:{nonce}"


def _decode_state_role(state: str) -> str:
    """Extract role from state parameter. Defaults to 'freelancer' if malformed."""
    if not state or ":" not in state:
        return "freelancer"
    role = state.split(":")[0]
    return role if role in ("freelancer", "client") else "freelancer"


def _make_username_from_name(name: str, db: Session) -> str:
    """Turn a display name into a unique username.

    Strips non-alphanumeric chars, lowercases, appends a counter if taken.
    e.g. "Jordan Rivera" → "jordanrivera" or "jordanrivera2"
    """
    base = re.sub(r"[^a-z0-9]", "", name.lower()) or "user"
    username = base
    counter = 2
    while db.query(User).filter(User.username == username).first():
        username = f"{base}{counter}"
        counter += 1
    return username


# ── Google ────────────────────────────────────────────────────────────────────

def google_auth_url(role: str) -> str:
    """Build the Google authorization URL to redirect the user to."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured — add GOOGLE_CLIENT_ID to .env",
        )
    params = {
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  _google_callback_url(),
        "response_type": "code",
        "scope":         "openid email profile",
        "state":         _encode_state(role),
        "access_type":   "online",
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


async def google_callback(code: str, state: str, db: Session) -> dict:
    """Exchange Google auth code for user info, find-or-create User, return JWT."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )

    role = _decode_state_role(state)

    async with httpx.AsyncClient() as client:
        # Step 1: exchange code for access token
        token_resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code":          code,
            "client_id":     GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri":  _google_callback_url(),
            "grant_type":    "authorization_code",
        })

        if token_resp.status_code != 200:
            logger.error("Google token exchange failed: %s", token_resp.text)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange Google authorization code",
            )

        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        # Step 2: fetch user profile
        user_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Google user profile",
            )

        profile = user_resp.json()

    google_id = profile.get("id")
    email     = profile.get("email")
    name      = profile.get("name") or email.split("@")[0]

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide an email address",
        )

    return _find_or_create_oauth_user(
        db=db,
        provider="google",
        provider_id=google_id,
        email=email,
        name=name,
        role=role,
    )


# ── GitHub ────────────────────────────────────────────────────────────────────

def github_auth_url(role: str) -> str:
    """Build the GitHub authorization URL to redirect the user to."""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured — add GITHUB_CLIENT_ID to .env",
        )
    params = {
        "client_id":    GITHUB_CLIENT_ID,
        "redirect_uri": _github_callback_url(),
        "scope":        "user:email",
        "state":        _encode_state(role),
    }
    return f"{GITHUB_AUTH_URL}?{urlencode(params)}"


async def github_callback(code: str, state: str, db: Session) -> dict:
    """Exchange GitHub auth code for user info, find-or-create User, return JWT."""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured",
        )

    role = _decode_state_role(state)

    async with httpx.AsyncClient() as client:
        # Step 1: exchange code for access token
        token_resp = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id":     GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code":          code,
                "redirect_uri":  _github_callback_url(),
            },
            headers={"Accept": "application/json"},
        )

        if token_resp.status_code != 200:
            logger.error("GitHub token exchange failed: %s", token_resp.text)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange GitHub authorization code",
            )

        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub did not return an access token — code may be expired or already used",
            )

        # Step 2: fetch user profile
        user_resp = await client.get(
            GITHUB_USERINFO_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept":        "application/vnd.github+json",
            },
        )

        if user_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch GitHub user profile",
            )

        profile = user_resp.json()
        github_id = str(profile.get("id"))
        name      = profile.get("name") or profile.get("login") or "user"
        email     = profile.get("email")

        # GitHub may hide email — fetch from /user/emails if needed
        if not email:
            emails_resp = await client.get(
                GITHUB_EMAIL_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept":        "application/vnd.github+json",
                },
            )
            if emails_resp.status_code == 200:
                emails = emails_resp.json()
                # Prefer primary + verified email
                primary = next(
                    (e["email"] for e in emails if e.get("primary") and e.get("verified")),
                    None,
                )
                email = primary or next((e["email"] for e in emails), None)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account did not provide a verified email address. "
                   "Please make your email public in GitHub settings and try again.",
        )

    return _find_or_create_oauth_user(
        db=db,
        provider="github",
        provider_id=github_id,
        email=email,
        name=name,
        role=role,
    )


# ── Shared find-or-create ─────────────────────────────────────────────────────

def _find_or_create_oauth_user(
    db: Session,
    provider: str,
    provider_id: str,
    email: str,
    name: str,
    role: str,
) -> dict:
    """Find existing user by OAuth provider+id or email, or create a new one.

    Lookup order:
      1. Match on (oauth_provider, oauth_id) — returning user, same provider
      2. Match on email — existing password account linking to OAuth
      3. Create new user

    For case 2 (email match): we link the OAuth provider to the existing account.
    This means if someone registered with email/password using their Google email,
    they can log in with Google OAuth and it will use the same account.
    """
    # 1. Exact provider match
    user = db.query(User).filter(
        User.oauth_provider == provider,
        User.oauth_id == provider_id,
    ).first()

    if user:
        # Returning OAuth user — just update last_login
        user.last_login = datetime.utcnow()
        db.commit()
        return _issue_token(user)

    # 2. Email match — link OAuth to existing account
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.oauth_provider = provider
        user.oauth_id       = provider_id
        user.last_login     = datetime.utcnow()
        db.commit()
        return _issue_token(user)

    # 3. New user — create account
    username = _make_username_from_name(name, db)
    user = User(
        email          = email,
        username       = username,
        hashed_password = None,   # OAuth-only — no password
        role           = role,
        oauth_provider = provider,
        oauth_id       = provider_id,
        last_login     = datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_token(user)


def _issue_token(user: User) -> dict:
    """Issue a JWT and return the standard auth response dict."""
    access_token = AuthService.create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    return {
        "access_token": access_token,
        "token_type":   "bearer",
        "user": {
            "id":       user.id,
            "email":    user.email,
            "username": user.username,
            "role":     user.role,
        },
    }