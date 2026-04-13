from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from src.database.core import Base
from datetime import datetime

class Proposal(Base):
    __tablename__ = "proposals"
    __table_args__ = {"extend_existing": True}

    id             = Column(Integer, primary_key=True, index=True)
    project_id     = Column(Integer, ForeignKey("projects.id"))
    freelancer_id  = Column(Integer, nullable=False)
    cover_letter   = Column(Text)
    proposed_budget = Column(Numeric)
    delivery_time  = Column(String(100))
    status         = Column(String, default="pending")
    created_at     = Column(DateTime, default=datetime.utcnow)