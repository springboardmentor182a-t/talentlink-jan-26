from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class MessageSend(BaseModel):
    receiver_id: int
    content: str = Field(..., min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    timestamp: datetime

    class Config:
        from_attributes = True


class ConversationPartner(BaseModel):
    user_id: int
    username: str
    role: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0

    class Config:
        from_attributes = True
