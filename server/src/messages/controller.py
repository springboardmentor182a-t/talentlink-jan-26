from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.messages.models import MessageSend, MessageResponse, ConversationPartner
from src.messages.service import MessageService

router = APIRouter()


@router.post("/send", response_model=MessageResponse, status_code=201)
async def send_message(
    data: MessageSend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message to another user"""
    return MessageService.send_message(db, current_user.id, data) # type: ignore[arg-type]


@router.get("/conversations", response_model=List[ConversationPartner])
async def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all conversations for current user with last message preview"""
    return MessageService.get_conversations_list(db, current_user.id)  # type: ignore[arg-type]

@router.get("/conversations/{user_id}", response_model=List[MessageResponse])
async def get_conversation(
    user_id: int,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get message history between current user and another user"""
    return MessageService.get_conversation(db, current_user.id, user_id, skip, limit)  # type: ignore[arg-type]



@router.get("/unread-count")
async def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get total unread messages count"""
    count = MessageService.get_unread_count(db, current_user.id)  # type: ignore[arg-type]
    return {"unread_count": count}


@router.get("/users", response_model=List[dict])
async def get_messageable_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all users available to message"""
    users = MessageService.get_messageable_users(db, current_user.id)  # type: ignore[arg-type]
    return [
        {"id": u.id, "username": u.username, "role": u.role}
        for u in users
    ]
