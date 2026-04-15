from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.auth.service import get_current_user
from src.entities.user import User
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
