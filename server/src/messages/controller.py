from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from src.database.core import get_db
from .model import Message
from .schema import MessageCreate, MessageResponse, ConversationResponse
from src.entities.user import User
from typing import Dict, List
import json

router = APIRouter(tags=["Messages"])


# ── WebSocket Connection Manager ─────────────────────────────
class ConnectionManager:
    def __init__(self):
        # room_key -> list of websockets
        # room_key = "min_id_max_id" e.g. "3_7"
        self.active_connections: Dict[str, List[WebSocket]] = {}

    def get_room_key(self, user_id: int, other_id: int) -> str:
        return f"{min(user_id, other_id)}_{max(user_id, other_id)}"

    async def connect(self, websocket: WebSocket, user_id: int, other_id: int):
        await websocket.accept()
        key = self.get_room_key(user_id, other_id)
        if key not in self.active_connections:
            self.active_connections[key] = []
        self.active_connections[key].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int, other_id: int):
        key = self.get_room_key(user_id, other_id)
        if key in self.active_connections:
            self.active_connections[key].remove(websocket)
            if not self.active_connections[key]:
                del self.active_connections[key]

    async def send_to_room(self, user_id: int, other_id: int, message: dict):
        key = self.get_room_key(user_id, other_id)
        if key in self.active_connections:
            for connection in self.active_connections[key]:
                await connection.send_text(json.dumps(message))


manager = ConnectionManager()


# ── WebSocket endpoint ────────────────────────────────────────
@router.websocket("/ws/{user_id}/{other_user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    other_user_id: int,
    db: Session = Depends(get_db),
):
    await manager.connect(websocket, user_id, other_user_id)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            # Save message to DB
            msg = Message(
                sender_id=user_id,
                receiver_id=other_user_id,
                content=payload["content"],
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)

            # Broadcast to both users in the room
            await manager.send_to_room(user_id, other_user_id, {
                "id":          msg.id,
                "sender_id":   msg.sender_id,
                "receiver_id": msg.receiver_id,
                "content":     msg.content,
                "is_read":     msg.is_read,
                "created_at":  msg.created_at.isoformat(),
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, other_user_id)


# ── REST endpoints (unchanged) ────────────────────────────────

@router.post("/", response_model=MessageResponse)
def send_message(data: MessageCreate, db: Session = Depends(get_db)):
    msg = Message(**data.dict())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


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