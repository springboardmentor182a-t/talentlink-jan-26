from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean
from src.database.core import Base
from datetime import datetime

class Message(Base):
    __tablename__ = "messages"
    __table_args__ = {"extend_existing": True}

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content     = Column(Text, nullable=False)
    is_read     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)