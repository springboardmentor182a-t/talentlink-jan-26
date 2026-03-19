from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from src.database.core import Base
from datetime import datetime

class Contract(Base):
    __tablename__ = "contracts"
    __table_args__ = {"extend_existing": True}  # ← ADD
    id = Column(Integer, primary_key=True)       # ← removed index=True
    title = Column(String)                        # ← removed index=True
    freelancer_name = Column(String)
    status = Column(String)
    contract_value = Column(String)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(String, nullable=True)
    milestones_total = Column(Integer, default=0)
    milestones = relationship("Milestone", back_populates="contract", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"
    __table_args__ = {"extend_existing": True}  # ← ADD
    id = Column(Integer, primary_key=True)       # ← removed index=True
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    title = Column(String)
    amount = Column(String)
    status = Column(String)
    contract = relationship("Contract", back_populates="milestones")