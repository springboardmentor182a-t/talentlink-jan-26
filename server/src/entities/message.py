from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database.core import Base


class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content     = Column(String, nullable=False)
    is_read     = Column(Boolean, default=False, server_default="false", nullable=False)
    timestamp   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    sender   = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

    __table_args__ = (
        # Composite index covering both conversation-fetch patterns:
        #   WHERE sender_id = X AND receiver_id = Y
        #   WHERE sender_id = Y AND receiver_id = X
        # Without this, every get_conversation call is a full table scan.
        Index("ix_messages_sender_receiver", "sender_id", "receiver_id"),
        # Separate index on receiver_id + is_read for the unread-count query.
        Index("ix_messages_receiver_unread", "receiver_id", "is_read"),
    )
