from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Numeric, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.core import Base

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
from decimal import Decimal


# ── ORM models ─────────────────────────────────────────────────────────────────

class Contract(Base):
    __tablename__ = "contracts"

    id          = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, unique=True)
    title       = Column(String(255), nullable=False)
    budget      = Column(Numeric(10, 2), nullable=False)
    terms       = Column(Text, nullable=True)
    start_date  = Column(DateTime(timezone=True), nullable=True)
    end_date    = Column(DateTime(timezone=True), nullable=True)
    status      = Column(String(50), default="draft", nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    proposal   = relationship("Proposal", back_populates="contract")
    milestones = relationship(
        "ContractMilestone",
        back_populates="contract",
        cascade="all, delete-orphan",
        order_by="ContractMilestone.id",
    )

    __table_args__ = (
        Index("ix_contracts_status", "status"),
    )


class ContractMilestone(Base):
    __tablename__ = "contract_milestones"

    id           = Column(Integer, primary_key=True, index=True)
    contract_id  = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    title        = Column(String(255), nullable=False)
    due_date     = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, default=False, server_default="false", nullable=False)

    contract = relationship("Contract", back_populates="milestones")


# ── Pydantic helpers ───────────────────────────────────────────────────────────

def _utc(dt: datetime | None) -> datetime | None:
    """Attach UTC tzinfo to naive datetimes from the DB."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ── Request schemas ────────────────────────────────────────────────────────────

class MilestoneCreate(BaseModel):
    title:    str                = Field(..., min_length=1, max_length=255)
    due_date: Optional[datetime] = None


class ContractCreate(BaseModel):
    """Client-only — creates a contract in draft status."""
    proposal_id: int
    title:       str                             = Field(..., min_length=1, max_length=255)
    budget:      Decimal                         = Field(..., gt=0)
    terms:       Optional[str]                   = None
    start_date:  Optional[datetime]              = None
    end_date:    Optional[datetime]              = None
    milestones:  Optional[List[MilestoneCreate]] = []


class ContractEditTerms(BaseModel):
    """Freelancer-only — propose term edits while contract is pending_sign."""
    terms: str = Field(..., min_length=1)


class ContractRenegotiate(BaseModel):
    """Client-only — counter-propose after freelancer has rejected terms.

    At least one of terms or budget must be provided so the renegotiation
    actually changes something. Both are optional individually so the client
    can update either or both.
    """
    terms:  Optional[str]     = Field(None, min_length=1)
    budget: Optional[Decimal] = Field(None, gt=0)


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
    status:      Literal['draft', 'pending_sign', 'active', 'rejected', 'completed', 'cancelled']
    milestones:  List[MilestoneResponse]
    progress:    int   # computed: 0-100, not a DB column
    created_at:  datetime

    class Config:
        from_attributes = True

    def model_post_init(self, __context):
        object.__setattr__(self, "start_date", _utc(self.start_date))
        object.__setattr__(self, "end_date",   _utc(self.end_date))
        object.__setattr__(self, "created_at", _utc(self.created_at))