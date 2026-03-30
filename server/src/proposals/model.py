from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from sqlalchemy.sql import func
from src.database.core import Base

class Proposal(Base):
    __tablename__ = "proposals"  # ✅ double underscores on both sides

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    freelancer_id = Column(Integer, nullable=False)

    cover_letter = Column(Text)
    proposed_budget = Column(Numeric)
    delivery_time = Column(String(100))

    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

