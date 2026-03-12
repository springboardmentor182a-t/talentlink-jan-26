from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from decimal import Decimal


def _utc(dt: datetime | None) -> datetime | None:
    """Attach UTC tzinfo to naive datetimes from the DB — matches messages.models pattern."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ── Request schemas ────────────────────────────────────────────────────────────

class MilestoneCreate(BaseModel):
    title:    str            = Field(..., min_length=1, max_length=255)
    due_date: Optional[datetime] = None


class ContractCreate(BaseModel):
    """Client-only — creates a contract in draft status."""
    proposal_id: int
    title:       str              = Field(..., min_length=1, max_length=255)
    budget:      Decimal          = Field(..., gt=0)
    terms:       Optional[str]    = None
    start_date:  Optional[datetime] = None
    end_date:    Optional[datetime] = None
    milestones:  Optional[List[MilestoneCreate]] = []


class ContractEditTerms(BaseModel):
    """Freelancer-only — propose term edits while contract is pending_sign."""
    terms: str = Field(..., min_length=1)


class MilestoneUpdate(BaseModel):
    """Freelancer-only — mark a milestone complete or incomplete."""
    is_completed: bool


# ── Response schemas ───────────────────────────────────────────────────────────

class MilestoneResponse(BaseModel):
    id:           int
    title:        str
    due_date:     Optional[datetime]
    is_completed: bool

    class Config:
        from_attributes = True

    def model_post_init(self, __context):
        object.__setattr__(self, "due_date", _utc(self.due_date))


class ContractResponse(BaseModel):
    id:          int
    proposal_id: int
    title:       str
    budget:      Decimal
    terms:       Optional[str]
    start_date:  Optional[datetime]
    end_date:    Optional[datetime]
    status:      str
    milestones:  List[MilestoneResponse]
    progress:    int   # computed: 0-100, not a DB column
    created_at:  datetime

    class Config:
        from_attributes = True

    def model_post_init(self, __context):
        object.__setattr__(self, "start_date", _utc(self.start_date))
        object.__setattr__(self, "end_date",   _utc(self.end_date))
        object.__setattr__(self, "created_at", _utc(self.created_at))