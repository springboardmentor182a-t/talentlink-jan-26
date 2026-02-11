from pydantic import BaseModel
from typing import Optional

class ClientProfileBase(BaseModel):
    company_name: str
    # Making these Optional allows them to be empty or null
    company_bio: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website_url: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_title: Optional[str] = None

class ClientProfileCreate(ClientProfileBase):
    pass

class ClientProfileResponse(ClientProfileBase):
    id: int
    user_id: int
    rating: Optional[float] = 0.0
    total_projects: Optional[int] = 0

    class Config:
        from_attributes = True