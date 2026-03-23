from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProposalBase(BaseModel):
    job_id: int
    cover_letter: str
    bid_amount: int
    delivery_time: Optional[str] = None

class ProposalCreate(ProposalBase):
    pass

class ProposalResponse(ProposalBase):
    id: int
    freelancer_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
