from sqlalchemy import Column, Integer, String, DateTime
from src.database.core import Base
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String)
    budget = Column(String)
    status = Column(String) # 'open', 'in progress', 'completed'
    created_at = Column(DateTime, default=datetime.utcnow)
