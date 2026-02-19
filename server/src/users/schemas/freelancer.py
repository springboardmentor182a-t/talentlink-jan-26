# server/src/users/schemas/freelancer.py
from pydantic import BaseModel
from typing import List, Optional


class FreelancerProfileBase(BaseModel):
    full_name: str
    title: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    skills: List[str] = []


class FreelancerProfileCreate(FreelancerProfileBase):
    pass


class FreelancerProfileResponse(FreelancerProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
