from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from src.projects.models import Conversation, ChatMessage, Proposal, User


def _full_name(user: User) -> str:
    return f"{user.first_name} {user.last_name}".strip()


def _serialize_user(user: User):
    return {
        "id": user.id,
        "full_name": _full_name(user) or user.email,
        "role": user.role,
    }


def _serialize_proposal(proposal: Optional[Proposal]):
    if not proposal:
        return None
    return {
        "id": proposal.id,
        "title": proposal.title,
        "status": proposal.status,
    }


def _serialize_message(message: ChatMessage):
    return {
        "id": message.id,
        "content": message.content,
        "created_at": message.created_at.isoformat(),
        "sender_id": message.sender_id,
        "sender_name": _full_name(message.sender) or message.sender.email,
    }


def _serialize_conversation(conversation: Conversation, current_user: User):
    other_user = (
        conversation.freelancer
        if current_user.id == conversation.client_id
        else conversation.client
    )
    last_message = conversation.messages[-1] if conversation.messages else None
    return {
        "id": conversation.id,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
        "other_user": _serialize_user(other_user),
        "proposal": _serialize_proposal(conversation.proposal),
        "last_message": _serialize_message(last_message) if last_message else None,
        "message_count": len(conversation.messages),
    }


def _get_accessible_conversation(db: Session, conversation_id: int, user: User):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user.id not in {conversation.client_id, conversation.freelancer_id}:
        raise HTTPException(status_code=403, detail="You cannot access this conversation")
    return conversation


def list_conversations(db: Session, current_user: User):
    conversations = (
        db.query(Conversation)
        .filter(
            (Conversation.client_id == current_user.id)
            | (Conversation.freelancer_id == current_user.id)
        )
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .all()
    )
    return {
        "current_user": _serialize_user(current_user),
        "conversations": [
            _serialize_conversation(conversation, current_user)
            for conversation in conversations
        ],
    }


def start_conversation(
    db: Session,
    current_user: User,
    proposal_id: Optional[int] = None,
    other_user_id: Optional[int] = None,
):
    if proposal_id is None and other_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide a proposal_id or other_user_id to start a conversation",
        )

    proposal = None
    if proposal_id is not None:
        proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        if current_user.id not in {proposal.client_id, proposal.freelancer_id}:
            raise HTTPException(status_code=403, detail="You cannot message for this proposal")
        client_id = proposal.client_id
        freelancer_id = proposal.freelancer_id
    else:
        other_user = db.query(User).filter(User.id == other_user_id).first()
        if not other_user:
            raise HTTPException(status_code=404, detail="User not found")
        if other_user.id == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot start a conversation with yourself")
        if current_user.role == other_user.role:
            raise HTTPException(
                status_code=400,
                detail="Conversations are only supported between clients and freelancers",
            )
        client_id = current_user.id if current_user.role == "Client" else other_user.id
        freelancer_id = current_user.id if current_user.role == "Freelancer" else other_user.id

    query = db.query(Conversation).filter(
        Conversation.client_id == client_id,
        Conversation.freelancer_id == freelancer_id,
    )
    if proposal:
        query = query.filter(Conversation.proposal_id == proposal.id)
    else:
        query = query.filter(Conversation.proposal_id.is_(None))

    conversation = query.first()
    if not conversation:
        conversation = Conversation(
            client_id=client_id,
            freelancer_id=freelancer_id,
            proposal_id=proposal.id if proposal else None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    return get_conversation_detail(db, conversation.id, current_user)


def get_conversation_detail(db: Session, conversation_id: int, current_user: User):
    conversation = _get_accessible_conversation(db, conversation_id, current_user)
    other_user = (
        conversation.freelancer
        if current_user.id == conversation.client_id
        else conversation.client
    )
    return {
        "id": conversation.id,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
        "current_user": _serialize_user(current_user),
        "other_user": _serialize_user(other_user),
        "proposal": _serialize_proposal(conversation.proposal),
        "messages": [_serialize_message(message) for message in conversation.messages],
    }


def send_message(db: Session, conversation_id: int, content: str, current_user: User):
    conversation = _get_accessible_conversation(db, conversation_id, current_user)
    trimmed = content.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    message = ChatMessage(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        content=trimmed,
        created_at=datetime.utcnow(),
    )
    conversation.updated_at = datetime.utcnow()
    db.add(message)
    db.commit()
    db.refresh(message)
    return _serialize_message(message)
