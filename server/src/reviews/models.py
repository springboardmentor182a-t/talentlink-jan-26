from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    reviewee_id: int
    project_id: Optional[int] = None
    rating: float
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    reviewee_id: int
    project_id: Optional[int]
    rating: float
    comment: Optional[str]
    created_at: datetime
    reviewer_name: Optional[str] = None

    class Config:
        orm_mode = True
