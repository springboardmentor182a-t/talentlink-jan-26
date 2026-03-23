from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.reviews.models import ReviewCreate, ReviewResponse
from src.reviews.service import get_reviews_for_user, create_review
from src.auth.service import get_current_user
from src.entities.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/me", response_model=List[ReviewResponse])
def read_my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_reviews_for_user(db, current_user.id)

@router.get("/{user_id}", response_model=List[ReviewResponse])
def read_user_reviews(user_id: int, db: Session = Depends(get_db)):
    return get_reviews_for_user(db, user_id)

@router.post("/", response_model=ReviewResponse)
def post_review(review: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_review(db, review, current_user.id)
