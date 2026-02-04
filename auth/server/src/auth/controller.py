from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.database.connection import get_db
from .schemas import (
    UserRegister, UserLogin, Token, UserResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from .service import AuthService

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    user = AuthService.register_user(db, user_data)
    return user

@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return token"""
    result = AuthService.authenticate_user(db, login_data)
    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"],
        "user": result["user"]
    }

# NEW: Forgot Password Endpoints

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset token.
    In production, this sends an email with reset link.
    For testing, returns the token in response.
    """
    result = AuthService.request_password_reset(db, request_data)
    return result

@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    reset_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password using valid reset token"""
    result = AuthService.reset_password(db, reset_data)
    return result
