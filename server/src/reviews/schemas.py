from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None
    project_id: int
    reviewee_id: int

class ReviewCreate(ReviewBase):
    reviewer_id: int

class ReviewOut(ReviewBase):
    id: int
    reviewer_id: int
    created_at: datetime

    class Config:
        from_attributes = True