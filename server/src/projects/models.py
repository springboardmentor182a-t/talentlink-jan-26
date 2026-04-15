from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database.core import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    budget_min = Column(Integer, nullable=True)
    budget_max = Column(Integer, nullable=True)
    duration = Column(String(100), nullable=True)
    skills = Column(String(255), nullable=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(50), default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship — lets service layer do project.client.username without extra queries
    client    = relationship("User", backref="posted_projects")
    proposals = relationship("Proposal", back_populates="project", cascade="all, delete-orphan")