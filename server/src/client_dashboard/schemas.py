from pydantic import BaseModel
from typing import List, Optional

class DashboardStats(BaseModel):
    active_projects: int
    pending_proposals: int
    active_contracts: int
    completed_projects: int

class ProjectSummary(BaseModel):
    id: int
    title: str
    category: str
    budget: str
    status: str  # e.g., "open", "in progress", "completed"

class ChartDataPoint(BaseModel):
    name: str
    value: int

class ChartData(BaseModel):
    data: List[ChartDataPoint]

class UnreadMessages(BaseModel):
    count: int
