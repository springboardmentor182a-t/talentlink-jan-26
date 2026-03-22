from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from src.database.core import Base
from datetime import datetime

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = {"extend_existing": True}

    id           = Column(Integer,  primary_key=True, index=True)
    reviewer_id  = Column(Integer,  ForeignKey("users.id"), nullable=False)
    reviewee_id  = Column(Integer,  ForeignKey("users.id"), nullable=False)
    project_name = Column(String(300), nullable=True)   # store name not FK
    rating       = Column(Integer,  nullable=False)      # 1–5
    comment      = Column(Text,     nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)