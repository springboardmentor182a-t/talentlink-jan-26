from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Text, DECIMAL, JSON, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database.core import Base

# 1. Define the Roles 
class UserRole(str, enum.Enum):
    FREELANCER = "freelancer"
    CLIENT = "client"
    BOTH = "both"

# 2. The Main User Table (Authentication)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.FREELANCER) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (Link to profiles)
    freelancer_profile = relationship("FreelancerProfile", back_populates="user", uselist=False)
    client_profile = relationship("ClientProfile", back_populates="user", uselist=False)

# 3. The Freelancer Profile Table
class FreelancerProfile(Base):
    __tablename__ = "profiles_freelancer"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    full_name = Column(String, index=True)
    title = Column(String) # e.g. "Full Stack Developer"
    bio = Column(Text)
    hourly_rate = Column(DECIMAL(10, 2))
    
    # Skills & Portfolio
    skills = Column(JSON, default=list) 
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
    user = relationship("User", back_populates="freelancer_profile")
    proposals = relationship("Proposal", back_populates="freelancer")

# 4. The Client Profile Table
class ClientProfile(Base):
    __tablename__ = "profiles_client"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
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

# 5. The Proposal Table
class Proposal(Base):
    __tablename__ = "proposals"
    id = Column(Integer, primary_key=True, index=True)
    
    # LINK TO TEAMMATE'S PROJECT
    project_id = Column(Integer, index=True) 

    # LINK TO YOUR FREELANCER
    freelancer_id = Column(Integer, ForeignKey("profiles_freelancer.id"))
    
    cover_letter = Column(String)
    bid_amount = Column(Float)
    estimated_days = Column(Integer)
    status = Column(String, default="pending") # pending, accepted, rejected
    created_at = Column(String)

    # Relationship to Freelancer
    freelancer = relationship("FreelancerProfile", back_populates="proposals")