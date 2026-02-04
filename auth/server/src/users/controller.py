from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.auth.schemas import UserResponse
from .service import UserService
from typing import List

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user(db: Session = Depends(get_db)):
    """Get current user profile"""
    # Simplified for demo
    from src.auth.models import User
    user = db.query(User).first()
    if user:
        return user
    return {"id": 1, "email": "user@example.com", "username": "user"}

@router.get("/", response_model=List[UserResponse])
async def get_all_users(db: Session = Depends(get_db)):
    """Get all users"""
    return UserService.get_all_users(db)
