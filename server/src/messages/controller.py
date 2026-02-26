from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.messages.models import MessageSend, MessageResponse, ConversationPartner
from src.messages.service import MessageService


# Explicit response model for user search — was List[dict] which bypasses
# Pydantic validation and could leak sensitive fields. This model is the
# contract: only id, username, role can ever be returned.
class UserSearchResult(BaseModel):
    id: int
    username: str
    role: str


router = APIRouter()


@router.post("/send", response_model=MessageResponse, status_code=201)
async def send_message(
    data: MessageSend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message to another user."""
    # current_user passed directly — service no longer re-fetches the sender.
    return await MessageService.send_message(db, current_user.id, data, current_user)  # type: ignore[arg-type]


@router.get("/conversations", response_model=List[ConversationPartner])
async def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all conversations for the current user with last-message preview."""
    return MessageService.get_conversations_list(db, current_user.id)  # type: ignore[arg-type]


@router.get("/conversations/{user_id}", response_model=List[MessageResponse])
async def get_conversation(
    user_id: int,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return paginated message history between the current user and another user.

    Does NOT mark messages as read — call PATCH ./{user_id}/read separately
    after the client confirms the messages were rendered on screen.
    """
    return MessageService.get_conversation(db, current_user.id, user_id, skip, limit)  # type: ignore[arg-type]


@router.patch("/conversations/{user_id}/read", status_code=204)
async def mark_read(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Explicitly mark all messages from user_id as read."""
    MessageService.mark_conversation_read(db, current_user.id, user_id)  # type: ignore[arg-type]


@router.get("/unread-count")
async def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Total unread messages count across all conversations."""
    count = MessageService.get_unread_count(db, current_user.id)  # type: ignore[arg-type]
    return {"unread_count": count}


@router.get("/users", response_model=List[UserSearchResult])
async def get_messageable_users(
    q: str = Query(..., min_length=2, description="Search query — minimum 2 characters"),
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search for users to start a conversation with.

    Requires at least 2 characters to prevent full user enumeration.
    Returns id, username and role only — no sensitive fields.
    """
    users = MessageService.get_messageable_users(db, current_user.id, q, limit, offset)  # type: ignore[arg-type]
    return [{"id": u.id, "username": u.username, "role": u.role} for u in users]
