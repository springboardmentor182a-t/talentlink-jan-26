from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from src.database.core import Base
from datetime import datetime

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    freelancer_name = Column(String)
    status = Column(String)  # 'active', 'completed'
    contract_value = Column(String)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(String, nullable=True)
    milestones_total = Column(Integer, default=0)
    
    milestones = relationship("Milestone", back_populates="contract", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    title = Column(String)
    amount = Column(String)
    status = Column(String)  # 'completed', 'in-progress', 'pending'
    
    contract = relationship("Contract", back_populates="milestones")
