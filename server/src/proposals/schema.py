from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProposalCreate(BaseModel):
    project_id: int
    freelancer_id: int
    cover_letter: Optional[str] = None
    proposed_budget: Optional[float] = None
    delivery_time: Optional[str] = None

class ProposalResponse(ProposalCreate):
    id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
