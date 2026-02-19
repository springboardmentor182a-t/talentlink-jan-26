from sqlalchemy import Column, Integer, String, Text
from ..database.core import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    budget_min = Column(Integer, nullable=True)
    budget_max = Column(Integer, nullable=True)
    duration = Column(String(100), nullable=True)
    skills = Column(String(255), nullable=True)
