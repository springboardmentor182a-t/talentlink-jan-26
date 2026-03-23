from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectCreate(BaseModel):
    client_id:   int
    title:       str
    description: str
    skills:      Optional[str] = ""
    budget:      float
    deadline:    str


class ProjectResponse(BaseModel):
    id:          int
    client_id:   int
    title:       str
    description: str
    skills:      Optional[str]
    budget:      float
    deadline:    Optional[str]
    status:      str
    created_at:  datetime

    class Config:
        from_attributes = True