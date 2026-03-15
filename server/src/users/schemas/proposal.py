from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# 1. Base Schema (Shared properties)
class ProposalBase(BaseModel):
    cover_letter: str = Field(..., min_length=20, max_length=2000, description="Cover letter describing why you are a fit")
    bid_amount: float = Field(..., gt=0, description="Bid amount must be greater than zero")
    estimated_days: int = Field(..., gt=0, le=365, description="Estimated days must be between 1 and 365")

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