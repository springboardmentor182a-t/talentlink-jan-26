from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime, date
from decimal import Decimal
from typing import Optional


class ProposalBase(BaseModel):
    project_id:         int
    cover_letter:       str     = Field(..., min_length=20, max_length=2000)
    bid_amount:         Decimal = Field(..., gt=0)
    estimated_days:     Optional[int]  = Field(None, gt=0, le=365)
    availability_start: Optional[date] = None

    @field_validator("availability_start")
    @classmethod
    def must_not_be_past(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v < date.today():
            raise ValueError("availability_start cannot be in the past")
        return v


class ProposalCreate(ProposalBase):
    pass


class ProposalResponse(ProposalBase):
    id:            int
    freelancer_id: int
    status:        str
    created_at:    datetime

    model_config = ConfigDict(from_attributes=True)