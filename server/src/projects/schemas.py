from pydantic import BaseModel
from typing import Optional

class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    budget_min: Optional[int]
    budget_max: Optional[int]
    duration: Optional[str]
    skills: Optional[str]
    client_id: int

    class Config:
        orm_mode = True