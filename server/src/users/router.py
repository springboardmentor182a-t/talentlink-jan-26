from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from src.database.core import get_db
from src.auth.service import get_current_user
from src.entities.user import User
<<<<<<< Group-A-feature/freelancer-dashboard-adwaith
from src.entities.freelancer_profile import FreelancerProfile
from .models import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=ProfileResponse)
def get_user_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == current_user.id).first()
    if not profile:
        profile = FreelancerProfile(user_id=current_user.id, professional_title="Freelancer")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return ProfileResponse(
        fullName=current_user.name,
        email=current_user.email,
        professionalTitle=profile.professional_title,
        hourlyRate=profile.hourly_rate,
        location=profile.location,
        experience=profile.experience,
        bio=profile.bio,
        skills=profile.skills if profile.skills is not None else [],
        portfolio=profile.portfolio if profile.portfolio is not None else []
    )

@router.put("/profile", response_model=ProfileResponse)
def update_user_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == current_user.id).first()
    if not profile:
        profile = FreelancerProfile(user_id=current_user.id, professional_title="Freelancer")
        db.add(profile)
    
    if data.professionalTitle is not None: profile.professional_title = data.professionalTitle
    if data.hourlyRate is not None: profile.hourly_rate = data.hourlyRate
    if data.location is not None: profile.location = data.location
    if data.experience is not None: profile.experience = data.experience
    if data.bio is not None: profile.bio = data.bio
    if data.skills is not None: profile.skills = data.skills
    if data.portfolio is not None: profile.portfolio = data.portfolio

    db.commit()
    db.refresh(profile)

    return ProfileResponse(
        fullName=current_user.name,
        email=current_user.email,
        professionalTitle=profile.professional_title,
        hourlyRate=profile.hourly_rate,
        location=profile.location,
        experience=profile.experience,
        bio=profile.bio,
        skills=profile.skills if profile.skills is not None else [],
        portfolio=profile.portfolio if profile.portfolio is not None else []
    )
=======
from src.reviews.model import Review

router = APIRouter(tags=["Users"])


# ── Schemas ───────────────────────────────────────────

class ProfileUpdate(BaseModel):
    name:       Optional[str] = None
    bio:        Optional[str] = None
    location:   Optional[str] = None
    phone:      Optional[str] = None
    skills:     Optional[str] = None
    experience: Optional[str] = None
    portfolio:  Optional[str] = None
    industry:   Optional[str] = None
    website:    Optional[str] = None

class ProfileResponse(BaseModel):
    id:         int
    name:       str
    email:      str
    role:       str
    bio:        Optional[str] = None
    location:   Optional[str] = None
    phone:      Optional[str] = None
    skills:     Optional[str] = None
    experience: Optional[str] = None
    portfolio:  Optional[str] = None
    industry:   Optional[str] = None
    website:    Optional[str] = None

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    reviewer_id:  int
    reviewee_id:  int
    rating:       int
    comment:      str           # required, not optional
    project_name: Optional[str] = None

class ReviewResponse(BaseModel):
    id:            int
    reviewer_id:   int
    reviewee_id:   int
    rating:        int
    comment:       Optional[str] = None
    project_name:  Optional[str] = None
    created_at:    Optional[datetime] = None
    reviewer_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Profile endpoints — prefixed with /profile ────────
# This avoids conflicts with /projects/{id} and other routes

@router.get("/profile/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/profile/{user_id}", response_model=ProfileResponse)
def update_profile(user_id: int, data: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = data.dict()
    for field, value in update_data.items():
        if value is not None and hasattr(user, field):
            setattr(user, field, value if value != "" else None)
    db.commit()
    db.refresh(user)
    return user


# Keep /users/{id} for backward compat (messages etc use this)
@router.get("/users/{user_id}", response_model=ProfileResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Review endpoints ──────────────────────────────────

@router.post("/reviews/", response_model=ReviewResponse)
def create_review(data: ReviewCreate, db: Session = Depends(get_db)):
    existing = db.query(Review).filter(
        Review.reviewer_id  == data.reviewer_id,
        Review.reviewee_id  == data.reviewee_id,
        Review.project_name == data.project_name,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this project.")
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    review = Review(
        reviewer_id  = data.reviewer_id,
        reviewee_id  = data.reviewee_id,
        rating       = data.rating,
        comment      = data.comment,
        project_name = data.project_name,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    reviewer = db.query(User).filter(User.id == review.reviewer_id).first()
    result = ReviewResponse.from_orm(review).dict()
    result["reviewer_name"] = reviewer.name if reviewer else "Anonymous"
    return result


@router.get("/reviews/given/{user_id}", response_model=list[ReviewResponse])
def get_given_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(
        Review.reviewer_id == user_id
    ).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        reviewer = db.query(User).filter(User.id == r.reviewer_id).first()
        d = ReviewResponse.from_orm(r).dict()
        d["reviewer_name"] = reviewer.name if reviewer else "Anonymous"
        result.append(d)
    return result


# ⚠️ Must be AFTER /reviews/given/{user_id}
@router.get("/reviews/{user_id}", response_model=list[ReviewResponse])
def get_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(
        Review.reviewee_id == user_id
    ).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        reviewer = db.query(User).filter(User.id == r.reviewer_id).first()
        d = ReviewResponse.from_orm(r).dict()
        d["reviewer_name"] = reviewer.name if reviewer else "Anonymous"
        result.append(d)
    return result
>>>>>>> main-group-A
