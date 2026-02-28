from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# 1. Base Schema (Shared properties)
class ProposalBase(BaseModel):
    cover_letter: str
    bid_amount: float
    estimated_days: int

# 2. Create Schema (What the frontend sends)
class ProposalCreate(ProposalBase):
    project_id: int  # This matches the ID of the job/project

# 3. Response Schema (What the frontend sees)
class ProposalResponse(ProposalBase):
    id: int
    project_id: int
    freelancer_id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True