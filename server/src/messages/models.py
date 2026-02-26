from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional


def _utc(dt: datetime | None) -> datetime | None:
    """Attach UTC tzinfo to a naive datetime from the DB so Pydantic serialises it with Z."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


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

    def model_post_init(self, __context):
        # TODO (tech debt): using object.__setattr__ to mutate after init works
        # around Pydantic v2's immutability but is a code smell. The cleaner fix
        # is a @field_validator('timestamp', mode='before') that attaches tzinfo
        # before the field is set, removing the need to mutate post-init.
        # Example:
        #   @field_validator('timestamp', mode='before')
        #   @classmethod
        #   def ensure_utc(cls, v):
        #       if isinstance(v, datetime) and v.tzinfo is None:
        #           return v.replace(tzinfo=timezone.utc)
        #       return v
        object.__setattr__(self, 'timestamp', _utc(self.timestamp))


class ConversationPartner(BaseModel):
    user_id: int
    username: str
    role: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    is_online: bool = False   # ← populated from ConnectionManager in service.py

    class Config:
        from_attributes = True

    def model_post_init(self, __context):
        # TODO (tech debt): same pattern as MessageResponse.model_post_init above.
        # Replace with @field_validator('last_message_time', mode='before').
        object.__setattr__(self, 'last_message_time', _utc(self.last_message_time))
