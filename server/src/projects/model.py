from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from src.database.core import Base


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = {"extend_existing": True}

    id          = Column(Integer, primary_key=True)
    client_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    skills      = Column(String(500))
    budget      = Column(Float, nullable=False)
    deadline    = Column(String(50))
    status      = Column(String(20), default="open")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())