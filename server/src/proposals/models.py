from pydantic import BaseModel
from typing import Optional

class ProposalBase(BaseModel):
    job_id: int
    cover_letter: str
    bid_amount: int

class ProposalCreate(ProposalBase):
    pass

class ProposalResponse(ProposalBase):
    id: int
    freelancer_id: int
    status: str

    class Config:
        orm_mode = True
