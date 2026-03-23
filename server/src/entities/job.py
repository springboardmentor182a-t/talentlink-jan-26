from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database.core import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    budget = Column(Integer, nullable=False)
    skills = Column(Text, nullable=True)  # Comma-separated skills
    duration = Column(String, nullable=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="OPEN")  # OPEN, CLOSED
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to User (client)
    client = relationship("User", backref="posted_jobs")
