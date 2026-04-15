from pydantic import BaseModel
from typing import Optional


class ClientProfileBase(BaseModel):
    company_name:        str
    industry:            Optional[str]  = None
    company_description: Optional[str]  = None
    company_bio:         Optional[str]  = None
    # Location
    location_city:       Optional[str]  = None
    location_state:      Optional[str]  = None
    location_country:    Optional[str]  = None
    location:            Optional[str]  = None
    # Web / social
    website_url:         Optional[str]  = None
    linkedin_profile:    Optional[str]  = None
    # Contact
    contact_phone:       Optional[str]  = None
    contact_title:       Optional[str]  = None
    # Privacy
    is_public:           Optional[bool] = True


class ClientProfileCreate(ClientProfileBase):
    pass


class ClientProfileResponse(ClientProfileBase):
    id:      int
    user_id: int

    class Config:
        from_attributes = True