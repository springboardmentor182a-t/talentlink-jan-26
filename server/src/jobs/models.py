from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    description: str
    budget: int

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    client_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
