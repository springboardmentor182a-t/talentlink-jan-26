# server/src/users/schemas/client.py
from pydantic import BaseModel
from typing import Optional


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
