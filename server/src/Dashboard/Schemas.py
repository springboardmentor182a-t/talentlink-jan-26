from pydantic import BaseModel
from typing import List

class DashboardStats(BaseModel):
    active_projects: int
    pending_proposals: int
    total_earnings: str
    profile_views: int

class RecommendedProject(BaseModel):
    id: int
    title: str
    client: str
    budget_range: str
    match_percentage: int

class ActiveContract(BaseModel):
    id: int
    title: str
    due_days: int
    progress: int

class DashboardResponse(BaseModel):
    stats: DashboardStats
    recommended_projects: List[RecommendedProject]
    active_contracts: List[ActiveContract]