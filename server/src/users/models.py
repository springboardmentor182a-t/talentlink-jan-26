from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="client") # 'client' or 'freelancer'

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "client"
