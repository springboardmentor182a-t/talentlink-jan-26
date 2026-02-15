from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException, status
import os
import secrets
from dotenv import load_dotenv

from src.entities.user import User
from src.auth.models import (
    UserRegister,
    UserLogin,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
RESET_TOKEN_EXPIRE_HOURS = 24


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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
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
            "token_type": "bearer"
        }
    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> dict:
        user = db.query(User).filter(User.email == login_data.email).first()

        # Fix: Type ignore for SQLAlchemy Column -> str conversion
        if not user or not AuthService.verify_password(login_data.password, user.hashed_password):  # type: ignore[arg-type]
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Fix: Type ignore for datetime -> Column[datetime] assignment
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

        # Always return same message to prevent email enumeration
        if not user:
            return {
                "message": "If that email exists, a password reset link has been sent.",
                "reset_token": None,
            }

        reset_token = AuthService.generate_reset_token()
        # Fix: Type ignore for SQLAlchemy Column assignments
        user.reset_token = reset_token  # type: ignore[assignment]
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)  # type: ignore[assignment]
        db.commit()

        return {
            "message": "If that email exists, a password reset link has been sent.",
            "reset_token": reset_token,  # Remove from response in production - send via email instead
        }

    @staticmethod
    def reset_password(db: Session, reset_data: ResetPasswordRequest) -> dict:
        user = db.query(User).filter(
            User.reset_token == reset_data.token,
            User.reset_token_expires > datetime.utcnow()
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        # Fix: Type ignore for SQLAlchemy Column assignments
        user.hashed_password = AuthService.hash_password(reset_data.new_password)  # type: ignore[assignment]
        user.reset_token = None  # type: ignore[assignment]
        user.reset_token_expires = None  # type: ignore[assignment]
        db.commit()

        return {"message": "Password has been reset successfully. You can now login with your new password."}
