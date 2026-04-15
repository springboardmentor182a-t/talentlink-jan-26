from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
        from_attributes = True

class ConversationMessage(BaseModel):
    id: int
    sender: str  # 'me' or 'client'
    text: str
    time: str

class ConversationResponse(BaseModel):
    id: int  # The ID of the other user in the conversation
    name: str # Name of the other user
    project: str # Blank for now
    lastMessage: str
    initial: str
    timestamp: str
    unread: bool
    messages: List[ConversationMessage]
