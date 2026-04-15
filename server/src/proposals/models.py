from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database.core import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id                 = Column(Integer, primary_key=True, index=True)
    project_id         = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    freelancer_id      = Column(Integer, ForeignKey("profiles_freelancer.id", ondelete="CASCADE"), nullable=False, index=True)
    cover_letter       = Column(String, nullable=False)
    bid_amount         = Column(Numeric(10, 2), nullable=False)
    status             = Column(String, default="pending", nullable=False)
    estimated_days     = Column(Integer, nullable=True)
    availability_start = Column(Date, nullable=True)
    created_at         = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships — lets service layer do proposal.project and proposal.freelancer
    # without extra queries
    project    = relationship("Project",           back_populates="proposals")
    freelancer = relationship("FreelancerProfile", back_populates="proposals")
    contract   = relationship("Contract",          back_populates="proposal", uselist=False)
