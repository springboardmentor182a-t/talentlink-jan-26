from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from src.database.core import get_db
from .model import Notification
from .schema import NotificationResponse
from typing import Dict, List
import json

router = APIRouter(tags=["Notifications"])

# ── WebSocket Connection Manager ─────────────────────────────
class NotificationManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"✅ Notification WS connected for user {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"❌ Notification WS disconnected for user {user_id}")

    async def send_notification(self, user_id: int, notification: dict):
        if user_id in self.active_connections:
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_text(json.dumps(notification))
                except:
                    pass


# Global manager instance
notification_manager = NotificationManager()


# ── Helper to create and send notification ───────────────────
async def create_and_send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: str
):
    """Create notification in DB and send via WebSocket if user is online."""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Send real-time via WebSocket
    await notification_manager.send_notification(user_id, {
        "id":         notification.id,
        "user_id":    notification.user_id,
        "title":      notification.title,
        "message":    notification.message,
        "type":       notification.type,
        "is_read":    notification.is_read,
        "created_at": notification.created_at.isoformat(),
    })

    return notification


# ── WebSocket endpoint ────────────────────────────────────────
@router.websocket("/ws/{user_id}")
async def notification_websocket(websocket: WebSocket, user_id: int):
    await notification_manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket, user_id)


# ── REST endpoints ────────────────────────────────────────────

@router.get("/{user_id}", response_model=list[NotificationResponse])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    """Get all notifications for a user (latest first)."""
    return db.query(Notification)\
             .filter(Notification.user_id == user_id)\
             .order_by(Notification.created_at.desc())\
             .limit(50)\
             .all()


@router.get("/{user_id}/unread-count")
def get_unread_count(user_id: int, db: Session = Depends(get_db)):
    """Get unread notification count."""
    count = db.query(Notification)\
              .filter(Notification.user_id == user_id, Notification.is_read == False)\
              .count()
    return {"count": count}


@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark a single notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
    return {"message": "Marked as read"}


@router.patch("/{user_id}/read-all")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    """Mark all notifications as read."""
    db.query(Notification)\
      .filter(Notification.user_id == user_id, Notification.is_read == False)\
      .update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


# ✅ NEW — mark all message-type notifications as read for a user
# Called when the user opens the Messages page
@router.patch("/{user_id}/read-messages")
def mark_message_notifications_read(user_id: int, db: Session = Depends(get_db)):
    """Mark all message notifications as read for a user."""
    db.query(Notification)\
      .filter(
          Notification.user_id == user_id,
          Notification.type    == "message",
          Notification.is_read == False
      )\
      .update({"is_read": True})
    db.commit()
    return {"message": "Message notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    """Delete a notification."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        db.delete(notification)
        db.commit()
    return {"message": "Deleted"}