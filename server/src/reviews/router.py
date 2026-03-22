from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database.core import get_db
from .models import Review
from .schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("/", response_model=ReviewOut)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    # Basic validation: Rating must be 1-5
    if not (1 <= review.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
    db_review = Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/user/{user_id}", response_model=List[ReviewOut])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.reviewee_id == user_id).all()