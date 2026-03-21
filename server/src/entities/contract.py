from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Numeric, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.core import Base


class Contract(Base):
    __tablename__ = "contracts"

    id          = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, nullable=False, unique=True)
    title       = Column(String(255), nullable=False)
    budget      = Column(Numeric(10, 2), nullable=False)
    terms       = Column(Text, nullable=True)
    start_date  = Column(DateTime(timezone=True), nullable=True)
    end_date    = Column(DateTime(timezone=True), nullable=True)
    status      = Column(String(50), default="draft", nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    #proposal   = relationship("Proposal", back_populates="contract")
    milestones = relationship(
        "ContractMilestone",
        back_populates="contract",
        cascade="all, delete-orphan",
        order_by="ContractMilestone.id",
    )

    __table_args__ = (
        # Fast lookups by status for the list endpoint filters
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