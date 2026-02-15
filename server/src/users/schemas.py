# server/src/users/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum

# --- Shared Models ---
class UserRole(str, Enum):
    FREELANCER = "freelancer"
    CLIENT = "client"
    BOTH = "both"

# --- Freelancer Profile Schemas ---
class FreelancerProfileBase(BaseModel):
    full_name: str
    title: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    skills: List[str] = [] # e.g. ["React", "Python"]

class FreelancerProfileCreate(FreelancerProfileBase):
    pass

class FreelancerProfileResponse(FreelancerProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

# --- Client Profile Schemas ---
class ClientProfileBase(BaseModel):
    company_name: str
    industry: Optional[str] = None
    company_description: Optional[str] = None

class ClientProfileCreate(ClientProfileBase):
    pass

class ClientProfileResponse(ClientProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

# --- User Schemas (Authentication) ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: UserRole

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    # We purposefully EXCLUDE 'password' here for security
    
    freelancer_profile: Optional[FreelancerProfileResponse] = None
    client_profile: Optional[ClientProfileResponse] = None

    class Config:
        from_attributes = True
