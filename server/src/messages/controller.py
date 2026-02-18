from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from src.database.core import get_db
from . import models

router = APIRouter()

# pydantic schemas remain largely the same
class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True  # allow returning SQLAlchemy models directly


@router.post("/", response_model=MessageResponse)
def send_message(message: MessageCreate, db: Session = Depends(get_db)):
    """Persist a new message to the database."""
    db_msg = models.Message(**message.dict())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


@router.get("/{user_id}", response_model=List[MessageResponse])
def get_messages(
    user_id: int,
    other_user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all messages for a user, optionally filtered by conversation with another specific user.
    """
    query = db.query(models.Message)

    if other_user_id:
        return query.filter(
            ((models.Message.sender_id == user_id) & (models.Message.receiver_id == other_user_id))
            | ((models.Message.sender_id == other_user_id) & (models.Message.receiver_id == user_id))
        ).all()

    return query.filter(
        (models.Message.sender_id == user_id) | (models.Message.receiver_id == user_id)
    ).all()
