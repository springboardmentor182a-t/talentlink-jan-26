# server/src/projects/models.py
from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.core import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    
    # Required Fields
    title = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    budget = Column(DECIMAL(10, 2), nullable=False)
    
    # Foreign Keys
    client_id = Column(Integer, ForeignKey("profiles_client.id"), nullable=False)
    
    # Optional / Auto
    status = Column(String(50), default="open")  # open, in_progress, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("ClientProfile", backref="posted_projects")
