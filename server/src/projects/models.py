from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from src.database.core import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    
    # Relationships
    projects_client = relationship("Project", back_populates="client", foreign_keys="[Project.client_id]")
    contracts_freelancer = relationship("Contract", back_populates="freelancer", foreign_keys="[Contract.freelancer_id]")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)  # <--- THIS IS MISSING IN YOUR DB
    budget = Column(Float, default=0.0)          # <--- THIS IS MISSING IN YOUR DB
    status = Column(String, default="Open")
    progress = Column(Integer, default=0)
    deadline = Column(DateTime)
    budget_spent = Column(Float, default=0.0)
    
    client_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    client = relationship("User", back_populates="projects_client", foreign_keys=[client_id])
    contracts = relationship("Contract", back_populates="project")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    status = Column(String, default="Active")
    
    project_id = Column(Integer, ForeignKey("projects.id"))
    freelancer_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    project = relationship("Project", back_populates="contracts")
    freelancer = relationship("User", back_populates="contracts_freelancer", foreign_keys=[freelancer_id])