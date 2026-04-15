# server/src/users/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Text, DECIMAL, JSON, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.proposals.models import Proposal  # noqa: F401

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

    # --- NEW FIELDS (From Figma) ---
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    years_experience = Column(String, nullable=True) # e.g. "5-10 years"
    availability = Column(String, nullable=True)     # e.g. "Full-time"
    
    # Social Links
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    portfolio_website = Column(String, nullable=True) 
    twitter = Column(String, nullable=True)
    
    # Back link to User
    user      = relationship("User", back_populates="freelancer_profile")
    proposals = relationship("Proposal", back_populates="freelancer", cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ClientProfile(Base):
    __tablename__ = "profiles_client"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    company_name = Column(String)
    industry = Column(String)
    company_description = Column(Text)
    
    # --- ADDED THIS LINE TO FIX YOUR ERROR ---
    company_bio = Column(Text)
    
    rating = Column(DECIMAL(3, 2), default=0.0)
    projects_posted = Column(Integer, default=0)

    # --- NEW FIELDS (From Figma) ---
    website_url = Column(String, nullable=True)
    location_city = Column(String, nullable=True)
    location_state = Column(String, nullable=True)
    location_country = Column(String, nullable=True)
    linkedin_profile = Column(String, nullable=True)
    location = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    contact_title = Column(String, nullable=True)
    
    # Privacy Settings
    is_public = Column(Boolean, default=True)
    
    # Back link to User
    user = relationship("User", back_populates="client_profile")


# --- NEW SKILL TABLE ADDED HERE ---
class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)