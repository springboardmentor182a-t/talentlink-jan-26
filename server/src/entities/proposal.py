from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database.core import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cover_letter = Column(Text, nullable=False)
    bid_amount = Column(Integer, nullable=False)
    delivery_time = Column(String, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", backref="proposals")
    freelancer = relationship("User", backref="proposals")
