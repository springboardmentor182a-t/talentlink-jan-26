from pydantic import BaseModel
from datetime import datetime
from typing import List

class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True

class ConversationSnippet(BaseModel):
    other_user_id: int
    other_user_name: str
    last_message: str
    timestamp: datetime
