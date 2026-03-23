from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    sender_id:   int
    receiver_id: int
    content:     str

class MessageResponse(BaseModel):
    id:          int
    sender_id:   int
    receiver_id: int
    content:     str
    is_read:     bool
    created_at:  Optional[datetime] = None

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    other_user_id:   int
    other_name:      Optional[str] = None
    last_message:    Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count:    int = 0