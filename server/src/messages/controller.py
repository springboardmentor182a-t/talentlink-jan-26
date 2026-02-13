from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Mock database for messages
# Structure: {id: int, sender_id: int, receiver_id: int, content: str, timestamp: datetime}
MESSAGES_DB = []

class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime

@router.post("/", response_model=MessageResponse)
def send_message(message: MessageCreate):
    new_message = {
        "id": len(MESSAGES_DB) + 1,
        "sender_id": message.sender_id,
        "receiver_id": message.receiver_id,
        "content": message.content,
        "timestamp": datetime.now()
    }
    MESSAGES_DB.append(new_message)
    return new_message

@router.get("/{user_id}", response_model=List[MessageResponse])
def get_messages(user_id: int, other_user_id: Optional[int] = None):
    """
    Get all messages for a user, optionally filtered by conversation with another specific user.
    """
    if other_user_id:
        return [
            msg for msg in MESSAGES_DB 
            if (msg["sender_id"] == user_id and msg["receiver_id"] == other_user_id) or 
               (msg["sender_id"] == other_user_id and msg["receiver_id"] == user_id)
        ]
    
    # Return all messages involving this user
    return [
        msg for msg in MESSAGES_DB 
        if msg["sender_id"] == user_id or msg["receiver_id"] == user_id
    ]
