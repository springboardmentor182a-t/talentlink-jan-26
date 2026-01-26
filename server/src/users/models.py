# server/src/users/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Text, DECIMAL, JSON, DateTime
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
    role = Column(String, default=UserRole.FREELANCER) # Storing enum as string for simplicity
    
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
    
    # Using JSON to store lists like ["React", "Python"] compatible with SQLite & Postgres
    skills = Column(JSON, default=list) 
    portfolio_items = Column(JSON, default=list)
    
    rating = Column(DECIMAL(3, 2), default=0.0)
    total_projects = Column(Integer, default=0)
    
    # Back link to User
    user = relationship("User", back_populates="freelancer_profile")

# 4. The Client Profile Table
class ClientProfile(Base):
    __tablename__ = "profiles_client"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    company_name = Column(String)
    industry = Column(String)
    company_description = Column(Text)
    
    rating = Column(DECIMAL(3, 2), default=0.0)
    projects_posted = Column(Integer, default=0)
    
    # Back link to User
    user = relationship("User", back_populates="client_profile")