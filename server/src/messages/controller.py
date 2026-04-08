from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.auth.dependencies import get_current_user
from src.database.core import get_db
from src.messages.schemas import (
    ConversationDetailResponse,
    ConversationListResponse,
    ConversationStartRequest,
    MessageCreateRequest,
    MessageResponse,
)
from src.messages import service
from src.projects.models import User

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/conversations", response_model=ConversationListResponse)
def list_messages_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_conversations(db, current_user)


@router.post("/conversations/start", response_model=ConversationDetailResponse)
def start_message_conversation(
    payload: ConversationStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.start_conversation(
        db,
        current_user,
        proposal_id=payload.proposal_id,
        other_user_id=payload.other_user_id,
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_message_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_conversation_detail(db, conversation_id, current_user)


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
def create_message(
    conversation_id: int,
    payload: MessageCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.send_message(db, conversation_id, payload.content, current_user)
