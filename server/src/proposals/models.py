from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
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

    from sqlalchemy import Column, Integer, String, JSON

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String) # Matches your React dummy data
    budget = Column(String)
    type = Column(String)
    match = Column(String)
    tags = Column(JSON) # JSON allows us to store the array of strings like ['React', 'Node.js']

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String, primary_key=True, index=True) # Using String because your IDs are 'CT-2024-001'
    title = Column(String)
    client = Column(String)
    budget = Column(String)
    status = Column(String)
    color = Column(String)