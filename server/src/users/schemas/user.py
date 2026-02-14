# server/src/users/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

from src.users.schemas.freelancer import FreelancerProfileResponse
from src.users.schemas.client import ClientProfileResponse


class UserRole(str, Enum):
    FREELANCER = "freelancer"
    CLIENT = "client"
    BOTH = "both"


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    role: UserRole


class UserResponse(UserBase):
    id: int
    username: str
    role: UserRole
    created_at: datetime
    freelancer_profile: Optional[FreelancerProfileResponse] = None
    client_profile: Optional[ClientProfileResponse] = None

    class Config:
        from_attributes = True
