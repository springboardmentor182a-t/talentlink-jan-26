from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from src.database.core import Base

class FreelancerProfile(Base):
    __tablename__ = "freelancer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    professional_title = Column(String(100), default="")
    hourly_rate = Column(String(50), default="0")
    location = Column(String(100), default="")
    experience = Column(String(50), default="")
    bio = Column(Text, default="")
    skills = Column(JSON, default=list)
    portfolio = Column(JSON, default=list)

    user = relationship("User")
