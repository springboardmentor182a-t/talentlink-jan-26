from sqlalchemy import Column, Integer, String, Text
from src.database.core import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    role       = Column(String(50),  nullable=False)  # client / freelancer

    # Shared fields
    bio        = Column(Text,        nullable=True)
    location   = Column(String(200), nullable=True)
    phone      = Column(String(50),  nullable=True)

    # Freelancer-specific
    skills     = Column(String(500), nullable=True)   # comma-separated
    experience = Column(String(200), nullable=True)   # e.g. "3 years"
    portfolio  = Column(String(500), nullable=True)   # URL

    # Client-specific
    industry   = Column(String(200), nullable=True)
    website    = Column(String(300), nullable=True)