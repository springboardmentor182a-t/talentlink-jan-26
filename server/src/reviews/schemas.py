from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating:      int = Field(..., ge=1, le=5)   # Pydantic-layer guard matching DB CHECK
    comment:     Optional[str] = Field(None, max_length=2000)
    project_id:  int
    reviewee_id: int

class ReviewCreate(ReviewBase):
    pass   # reviewer_id removed — derived from JWT in router

class ReviewOut(ReviewBase):
    id:            int
    reviewer_id:   int
    reviewer_name: Optional[str] = None   # populated server-side
    created_at:    datetime

    class Config:
        from_attributes = True