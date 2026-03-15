from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from src.database.core import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cover_letter = Column(Text, nullable=False)
    bid_amount = Column(Integer, nullable=False)
    status = Column(String, default="PENDING")  # PENDING, ACCEPTED, REJECTED

    job = relationship("Job", backref="proposals")
    freelancer = relationship("User", backref="proposals")
