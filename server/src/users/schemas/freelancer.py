from pydantic import BaseModel
from typing import List, Optional


class FreelancerProfileBase(BaseModel):
    full_name:         str
    title:             Optional[str]  = None
    bio:               Optional[str]  = None
    hourly_rate:       Optional[float] = None
    skills:            List[str]      = []
    # Extended fields
    phone:             Optional[str]  = None
    location:          Optional[str]  = None
    years_experience:  Optional[str]  = None
    availability:      Optional[str]  = None
    linkedin:          Optional[str]  = None
    github:            Optional[str]  = None
    portfolio_website: Optional[str]  = None
    twitter:           Optional[str]  = None


class FreelancerProfileCreate(FreelancerProfileBase):
    pass


class FreelancerProfileResponse(FreelancerProfileBase):
    id:      int
    user_id: int

    class Config:
        from_attributes = True