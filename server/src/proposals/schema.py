from pydantic import BaseModel
from typing import Optional

class ProposalCreate(BaseModel):
    project_id: int
    freelancer_id: int
    cover_letter: Optional[str]
    proposed_budget: Optional[float]
    delivery_time: Optional[str]

class ProposalResponse(ProposalCreate):
    id: int
    status: str

    class Config:
        from_attributes = True
