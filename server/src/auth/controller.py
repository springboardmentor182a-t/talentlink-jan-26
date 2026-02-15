from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.models import (
    UserRegister, UserLogin, UserResponse, RegisterResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
)
from src.auth.service import AuthService

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    return AuthService.register_user(db, user_data)


@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    result = AuthService.authenticate_user(db, login_data)
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": result["user"],
    }


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset token.
    In production: sends token via email. For dev: token returned in response.
    """
    return AuthService.request_password_reset(db, request_data)


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(reset_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid reset token"""
    return AuthService.reset_password(db, reset_data)
