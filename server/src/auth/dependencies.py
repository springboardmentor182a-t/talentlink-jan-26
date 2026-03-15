from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import os
from pathlib import Path
from dotenv import load_dotenv

from src.database.core import get_db
from src.entities.user import User

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

SECRET_KEY: str = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in .env — refusing to start")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

bearer_scheme = HTTPBearer()

# NOTE: This dependency handles HTTP Bearer token auth for REST endpoints only.
# WebSocket endpoints MUST NOT use this dependency directly — the JWT would end
# up in the URL query string, which gets logged by every proxy and load balancer.
# All WebSocket routes must use the one-time ticket system defined in main.py
# (POST /api/messages/ws-ticket → redeem in /ws/{user_id}?ticket=...).
# See _issue_ticket / _redeem_ticket in main.py.


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")  # type: ignore[assignment]
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
