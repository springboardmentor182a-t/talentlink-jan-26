# server/src/users/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DECIMAL, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.database.core import Base


class FreelancerProfile(Base):
    __tablename__ = "profiles_freelancer"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    full_name = Column(String, index=True)
    title = Column(String)                      # e.g. "Full Stack Developer"
    bio = Column(Text)
    hourly_rate = Column(DECIMAL(10, 2))
    skills = Column(JSON, default=list)         # ["React", "Python", ...]
    portfolio_items = Column(JSON, default=list)

    rating = Column(DECIMAL(3, 2), default=0.0)
    total_projects = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ClientProfile(Base):
    __tablename__ = "profiles_client"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    company_name = Column(String)
    industry = Column(String)
    company_description = Column(Text)

    rating = Column(DECIMAL(3, 2), default=0.0)
    projects_posted = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
