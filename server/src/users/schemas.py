# server/src/users/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    FREELANCER = "freelancer"
    CLIENT = "client"
    BOTH = "both"

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.FREELANCER

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Freelancer Profile Schemas ---
class FreelancerProfileCreate(BaseModel):
    full_name: str
    title: str
    bio: str
    hourly_rate: float
    skills: List[str] = []
    
    # New Fields (Optional because they might not fill them all at once)
    phone: Optional[str] = None
    location: Optional[str] = None
    years_experience: Optional[str] = None
    availability: Optional[str] = None
    
    # Social Links
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio_website: Optional[str] = None
    twitter: Optional[str] = None

class FreelancerProfileResponse(FreelancerProfileCreate):
    id: int
    user_id: int
    rating: float
    total_projects: int

    class Config:
        from_attributes = True

# --- Client Profile Schemas ---
class ClientProfileCreate(BaseModel):
    company_name: str
    industry: str
    company_description: str
    
    # New Fields
    website: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    linkedin_profile: Optional[str] = None
    is_public: bool = True

class ClientProfileResponse(ClientProfileCreate):
    id: int
    user_id: int
    rating: float
    projects_posted: int

    class Config:
        from_attributes = True