from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

class MilestoneSchema(BaseModel):
    id: int
    title: str
    amount: str
    status: str

    class Config:
        from_attributes = True

class ContractSummary(BaseModel):
    id: int
    title: str
    freelancer_name: str
    status: str
    contract_value: str
    start_date: str
    end_date: Optional[str]
    milestones_total: int
    milestones: List[MilestoneSchema]

    class Config:
        from_attributes = True

class ContractStats(BaseModel):
    active_contracts: int
    completed_contracts: int
    total_investment: str

class ProposalSchema(BaseModel):
    id: int
    project_id: int
    freelancer_name: str
    amount: str
    cover_letter: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AcceptProposalRequest(BaseModel):
    milestones_total: Optional[int] = 1
