from sqlalchemy.orm import Session
from src.entities.review import Review
from src.entities.user import User
from src.reviews.models import ReviewCreate

def get_reviews_for_user(db: Session, user_id: int):
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    # Manually attach reviewer name for simplicity in this example
    for r in reviews:
        reviewer = db.query(User).filter(User.id == r.reviewer_id).first()
        r.reviewer_name = reviewer.name if reviewer else "Unknown"
    return reviews

def create_review(db: Session, review: ReviewCreate, reviewer_id: int):
    db_review = Review(
        reviewer_id=reviewer_id,
        **review.dict()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
