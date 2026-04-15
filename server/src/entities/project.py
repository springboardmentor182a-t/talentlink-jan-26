from sqlalchemy import Column, Integer, String, DateTime
from src.database.core import Base
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True)  # ← removed index=True
    title = Column(String)                   # ← removed index=True
    category = Column(String)
    budget = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)