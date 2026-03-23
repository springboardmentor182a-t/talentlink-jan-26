from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from src.database.core import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    professional_title = Column(String, nullable=True)
    hourly_rate = Column(String, nullable=True)
    location = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated skills

    user = relationship("User", backref="profile", uselist=False)
