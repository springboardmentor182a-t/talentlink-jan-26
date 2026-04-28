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

    # ── Shared ────────────────────────────────────────────
    bio        = Column(Text,        nullable=True)
    location   = Column(String(200), nullable=True)
    phone      = Column(String(50),  nullable=True)

    # ── Freelancer profile (Naukri-style) ─────────────────
    title        = Column(String(200), nullable=True)   # e.g. "Full Stack Developer"
    skills       = Column(String(500), nullable=True)   # comma-separated
    experience   = Column(String(100), nullable=True)   # e.g. "3 years"
    portfolio    = Column(String(500), nullable=True)   # URL
    linkedin     = Column(String(300), nullable=True)
    github       = Column(String(300), nullable=True)
    education    = Column(String(500), nullable=True)   # e.g. "B.Tech CSE, IIT Delhi"
    certifications = Column(String(500), nullable=True) # comma-separated
    languages    = Column(String(300), nullable=True)   # e.g. "English, Hindi, Tamil"
    expected_salary = Column(String(100), nullable=True) # e.g. "$50/hr or $60,000/yr"
    availability = Column(String(100), nullable=True)   # e.g. "Immediate, 2 weeks notice"

    # ── Client profile ────────────────────────────────────
    industry   = Column(String(200), nullable=True)
    website    = Column(String(300), nullable=True)
    company_size = Column(String(100), nullable=True)   # e.g. "10-50 employees"