from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.messages.models import MessageCreate, MessageResponse, ConversationSnippet
from src.messages.service import get_messages_between_users, create_message, get_conversations
from src.auth.service import get_current_user
from src.entities.user import User

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/conversations", response_model=List[ConversationSnippet])
def read_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_conversations(db, current_user.id)

@router.get("/{other_user_id}", response_model=List[MessageResponse])
def read_messages(other_user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_messages_between_users(db, current_user.id, other_user_id)

@router.post("/", response_model=MessageResponse)
def send_message(message: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_message(db, message, current_user.id)
