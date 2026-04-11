from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from src.database.core import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"extend_existing": True}

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String(200), nullable=False)
    message    = Column(String(500), nullable=False)
    type       = Column(String(50), nullable=False)  # proposal, message, contract, milestone
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)