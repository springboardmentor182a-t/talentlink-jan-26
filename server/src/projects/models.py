from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from src.database.core import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String, default="Client")
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    projects_client = relationship("Project", back_populates="client", foreign_keys="[Project.client_id]")
    contracts_freelancer = relationship("Contract", back_populates="freelancer", foreign_keys="[Contract.freelancer_id]")
    activities = relationship("ActivityLog", back_populates="user")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    budget = Column(Float, default=0.0)
    status = Column(String, default="Open")
    progress = Column(Integer, default=0)
    deadline = Column(DateTime)
    budget_spent = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    client = relationship("User", back_populates="projects_client", foreign_keys=[client_id])
    contracts = relationship("Contract", back_populates="project")
    payments = relationship("Payment", back_populates="project")
    activities = relationship("ActivityLog", back_populates="project")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project_id = Column(Integer, ForeignKey("projects.id"))
    freelancer_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    project = relationship("Project", back_populates="contracts")
    freelancer = relationship("User", back_populates="contracts_freelancer", foreign_keys=[freelancer_id])
    payments = relationship("Payment", back_populates="contract")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String, default="Completed")
    payment_date = Column(DateTime, default=datetime.utcnow)
    
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    contract = relationship("Contract", back_populates="payments")
    project = relationship("Project", back_populates="payments")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    description = Column(String, nullable=False)
    activity_type = Column(String)  # proposal, payment, job_post
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="activities")
    project = relationship("Project", back_populates="activities")