from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    title: str = Field(..., min_length=10, max_length=100)
    description: str = Field(..., min_length=50, max_length=5000)
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    skills: Optional[str] = None
    duration: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=10, max_length=100)
    description: Optional[str] = Field(None, min_length=50, max_length=5000)
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    client_id: int
    client_display_name: Optional[str] = None   # username or company name of the poster
    status: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    total_count: int
    skip: int
    limit: int