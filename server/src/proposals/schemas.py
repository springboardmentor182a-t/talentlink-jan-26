from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ProposalBase(BaseModel):
    project_id: int
    cover_letter: str
    bid_amount: float

class ProposalCreate(ProposalBase):
    pass

class ProposalResponse(ProposalBase):
    id: int
    freelancer_id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)