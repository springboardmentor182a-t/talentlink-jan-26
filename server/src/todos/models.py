from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from src.database.core import Base


# ── ORM model ─────────────────────────────────────────────────────────────────

class Todo(Base):
    __tablename__ = "todos"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    completed   = Column(Boolean, default=False)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())


# ── Pydantic schemas ───────────────────────────────────────────────────────────

class TodoCreate(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    completed:   bool           = False


class TodoUpdate(BaseModel):
    title:       Optional[str]  = Field(None, min_length=1, max_length=200)
    description: Optional[str]  = None
    completed:   Optional[bool] = None


class TodoResponse(BaseModel):
    id:          int
    title:       str
    description: Optional[str]
    completed:   bool
    user_id:     int
    created_at:  datetime

    class Config:
        from_attributes = True