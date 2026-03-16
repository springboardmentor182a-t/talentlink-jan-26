from pydantic import BaseModel
from typing import Optional

class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    duration: Optional[str] = None
    skills: Optional[str] = None
    client_id: int

    class Config:
        orm_mode = True
        from_attributes = True