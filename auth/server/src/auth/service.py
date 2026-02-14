from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException, status
import os
import secrets
from dotenv import load_dotenv
from .models import User
from .schemas import UserRegister, UserLogin, ForgotPasswordRequest, ResetPasswordRequest

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
RESET_TOKEN_EXPIRE_HOURS = 24  # Password reset token valid for 24 hours

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: dict) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure random token for password reset"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        """Register a new user"""
        # Check if user exists
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )
        
        # Create new user
        hashed_password = AuthService.hash_password(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> dict:
        """Authenticate a user and return token"""
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user or not AuthService.verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        access_token = AuthService.create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    
    # NEW: Forgot Password Methods
    
    @staticmethod
    def request_password_reset(db: Session, request_data: ForgotPasswordRequest) -> dict:
        """Generate password reset token for user"""
        user = db.query(User).filter(User.email == request_data.email).first()
        
        if not user:
            # Don't reveal if email exists or not (security best practice)
            return {
                "message": "If that email exists, a password reset link has been sent.",
                "reset_token": None
            }
        
        # Generate reset token
        reset_token = AuthService.generate_reset_token()
        reset_token_expires = datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)
        
        # Save token to database
        user.reset_token = reset_token
        user.reset_token_expires = reset_token_expires
        db.commit()
        
        # In production, send email here
        # For now, return token for testing
        return {
            "message": "If that email exists, a password reset link has been sent.",
            "reset_token": reset_token  # Remove this in production!
        }
    
    @staticmethod
    def reset_password(db: Session, reset_data: ResetPasswordRequest) -> dict:
        """Reset user password using token"""
        # Find user with valid reset token
        user = db.query(User).filter(
            User.reset_token == reset_data.token,
            User.reset_token_expires > datetime.utcnow()
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Update password
        user.hashed_password = AuthService.hash_password(reset_data.new_password)
        
        # Clear reset token
        user.reset_token = None
        user.reset_token_expires = None
        
        db.commit()
        
        return {
            "message": "Password has been reset successfully. You can now login with your new password."
        }
