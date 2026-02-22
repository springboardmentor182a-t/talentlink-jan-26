from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# This defines what the Frontend sends to the Backend
class ProjectCreate(BaseModel):
    title: str
    description: str
    budget: float
    deadline: datetime