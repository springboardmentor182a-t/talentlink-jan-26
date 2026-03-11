from sqlalchemy import Column, Integer, String, Float
from database import Base


# ---------------------------
# Freelancer Table
# ---------------------------
class FreelancerProfile(Base):
    __tablename__ = "freelancer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    fullName = Column(String)
    skills = Column(String)
    hourlyRate = Column(Float)
    experience = Column(Integer)
    location = Column(String)
    availability = Column(String)


# ---------------------------
# Client Table
# ---------------------------
class ClientProfile(Base):
    __tablename__ = "client_profiles"

    id = Column(Integer, primary_key=True, index=True)
    companyName = Column(String)
    about = Column(String)
    location = Column(String)
    website = Column(String)
    industry = Column(String)