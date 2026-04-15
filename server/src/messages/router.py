from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.auth.service import get_current_user
from src.entities.user import User
from .models import ConversationResponse, MessageCreate, MessageResponse
from .service import MessageService

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MessageService.get_conversations_for_user(db, current_user.id)

@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"count": MessageService.get_unread_count(db, current_user.id)}

@router.post("", response_model=MessageResponse)
def send_message(data: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    # Check if receiver exists
    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    return MessageService.send_message(db, current_user.id, data)

@router.post("/read/{other_user_id}")
def mark_as_read(other_user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MessageService.mark_as_read(db, current_user.id, other_user_id)
