from pydantic import BaseModel
from typing import List, Optional, Any

class ProfileUpdate(BaseModel):
    professionalTitle: Optional[str] = None
    hourlyRate: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    portfolio: Optional[List[Any]] = None

class ProfileResponse(BaseModel):
    fullName: str
    email: str
    professionalTitle: str
    hourlyRate: str
    location: str
    experience: str
    bio: str
    skills: List[str]
    portfolio: List[Any]

    class Config:
        from_attributes = True
