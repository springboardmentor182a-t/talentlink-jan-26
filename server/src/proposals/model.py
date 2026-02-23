from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from sqlalchemy.sql import func
from src.database.core import Base

class Proposal(Base):
    tablename = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    freelancer_id = Column(Integer, nullable=False)

    cover_letter = Column(Text)
    proposed_budget = Column(Numeric)
    delivery_time = Column(String)

    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
