from pydantic import BaseModel
from typing import List, Optional

class FreelancerProfileBase(BaseModel):
    full_name: str
    title: str
    bio: Optional[str] = None
    hourly_rate: Optional[float] = 0.0
    # Allow skills to be optional or an empty list
    skills: Optional[List[str]] = []
    phone: Optional[str] = None
    location: Optional[str] = None
    years_experience: Optional[str] = None
    availability: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio_website: Optional[str] = None
    twitter: Optional[str] = None

class FreelancerProfileCreate(FreelancerProfileBase):
    pass

class FreelancerProfileResponse(FreelancerProfileBase):
    id: int
    user_id: int
    rating: Optional[float] = 0.0
    total_projects: Optional[int] = 0

    class Config:
        from_attributes = True