from pydantic import BaseModel
from typing import Optional, List

# --- Existing Profile Schemas ---

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

# --- Dashboard Schemas ---

class DashboardStats(BaseModel):
    active_projects: int
    pending_proposals: int
    total_spent: float
    completed_projects: int

class ActiveProjectDTO(BaseModel):
    id: int
    title: str
    posted_time: str
    proposals_count: int
    budget: str
    duration: str
    status: str

class ActivityDTO(BaseModel):
    id: int
    type: str 
    text: str
    time: str

class ClientDashboardResponse(BaseModel):
    stats: DashboardStats
    active_projects: List[ActiveProjectDTO]
    recent_activity: List[ActivityDTO]