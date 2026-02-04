from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from ..database.core import Base 

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    # We change these to simple Integers for now so the server stops crashing
    project_id = Column(Integer, index=True) 
    freelancer_id = Column(Integer, index=True)
    
    cover_letter = Column(String)
    bid_amount = Column(Float)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)