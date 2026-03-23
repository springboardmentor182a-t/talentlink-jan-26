from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from src.database.core import get_db
from .model import Message
from .schema import MessageCreate, MessageResponse, ConversationResponse
from src.entities.user import User

router = APIRouter(tags=["Messages"])


@router.post("/", response_model=MessageResponse)
def send_message(data: MessageCreate, db: Session = Depends(get_db)):
    msg = Message(**data.dict())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ⚠️ MUST be before /{user_id}/{other_user_id} — otherwise FastAPI
# tries to parse "conversations" as an integer and returns 422
@router.get("/conversations/{user_id}", response_model=list[ConversationResponse])
def get_conversations(user_id: int, db: Session = Depends(get_db)):
    """Get all unique conversations for a user with latest message and unread count."""
    sent     = db.query(Message.receiver_id.label("other_id")).filter(Message.sender_id == user_id)
    received = db.query(Message.sender_id.label("other_id")).filter(Message.receiver_id == user_id)
    other_ids = {row.other_id for row in sent.union(received).all()}

    result = []
    for other_id in other_ids:
        other_user = db.query(User).filter(User.id == other_id).first()

        last_msg = (
            db.query(Message)
            .filter(
                or_(
                    and_(Message.sender_id == user_id,  Message.receiver_id == other_id),
                    and_(Message.sender_id == other_id, Message.receiver_id == user_id),
                )
            )
            .order_by(Message.created_at.desc())
            .first()
        )

        unread = (
            db.query(func.count(Message.id))
            .filter(
                Message.sender_id   == other_id,
                Message.receiver_id == user_id,
                Message.is_read     == False,
            )
            .scalar()
        )

        result.append(ConversationResponse(
            other_user_id   = other_id,
            other_name      = other_user.name if other_user else f"User #{other_id}",
            last_message    = (last_msg.content[:60] + ("..." if len(last_msg.content) > 60 else "")) if last_msg else None,
            last_message_at = last_msg.created_at if last_msg else None,
            unread_count    = unread or 0,
        ))

    result.sort(key=lambda x: x.last_message_at or 0, reverse=True)
    return result


@router.get("/{user_id}/{other_user_id}", response_model=list[MessageResponse])
def get_conversation(user_id: int, other_user_id: int, db: Session = Depends(get_db)):
    """Get all messages between two users and mark received ones as read."""
    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == user_id,       Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == user_id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    for m in messages:
        if m.receiver_id == user_id and not m.is_read:
            m.is_read = True
    db.commit()
    return messages