from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session

from src.database.core import get_db
from . import models
from pydantic import BaseModel

router = APIRouter()

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool

    class Config:
        orm_mode = True


@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """Return all users in the database."""
    return db.query(models.User).all()
