from sqlalchemy import Column, Integer, String, Text, ForeignKey
from src.database.core import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    budget = Column(Integer, nullable=False)

    duration = Column(String, nullable=True)

    skills_required = Column(String, nullable=True)

    client_id = Column(Integer, ForeignKey("users.id"))

    status = Column(String, default="open")