# server/src/users/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database.core import get_db
from . import schemas, service, models

router = APIRouter(prefix="/users", tags=["Users"])

# 1. Register a New User
@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return service.create_user(db=db, user=user)

# 2. Create OR Update Freelancer Profile (THE FIXED UPSERT LOGIC)
@router.post("/{user_id}/freelancer-profile", response_model=schemas.FreelancerProfileResponse)
def create_freelancer_profile(user_id: int, profile: schemas.FreelancerProfileCreate, db: Session = Depends(get_db)):
    # Check if profile exists
    db_profile = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    
    if db_profile:
        # UPDATE existing
        for key, value in profile.dict().items():
            setattr(db_profile, key, value)
        db.commit()
        db.refresh(db_profile)
        return db_profile
    else:
        # CREATE new
        return service.create_freelancer_profile(db=db, user_id=user_id, profile=profile)

# 3. Create OR Update Client Profile (THE FIXED UPSERT LOGIC)
@router.post("/{user_id}/client-profile", response_model=schemas.ClientProfileResponse)
def create_client_profile(user_id: int, profile: schemas.ClientProfileCreate, db: Session = Depends(get_db)):
    db_profile = db.query(models.ClientProfile).filter(models.ClientProfile.user_id == user_id).first()
    
    if db_profile:
        # UPDATE existing
        for key, value in profile.dict().items():
            setattr(db_profile, key, value)
        db.commit()
        db.refresh(db_profile)
        return db_profile
    else:
        # CREATE new
        return service.create_client_profile(db=db, user_id=user_id, profile=profile)

# 4. Get Freelancer Profile (THE MISSING FUNCTION)
@router.get("/{user_id}/freelancer_profile", response_model=schemas.FreelancerProfileResponse)
def get_freelancer_profile(user_id: int, db: Session = Depends(get_db)):
    from . import models
    profile = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

# 5. Get Client Profile (THE MISSING FUNCTION)
@router.get("/{user_id}/client_profile", response_model=schemas.ClientProfileResponse)
def get_client_profile(user_id: int, db: Session = Depends(get_db)):
    from . import models
    profile = db.query(models.ClientProfile).filter(models.ClientProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile



# 6. Create a Proposal (Submit Application)
@router.post("/{user_id}/proposals", response_model=schemas.ProposalResponse)
def create_proposal(user_id: int, proposal: schemas.ProposalCreate, db: Session = Depends(get_db)):
    # 1. Find the freelancer profile for this user
    freelancer = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="You must have a Freelancer Profile to apply.")
    
    # 2. Create proposal linked to that freelancer
    return service.create_proposal(db=db, proposal=proposal, freelancer_id=freelancer.id)

# 7. Get My Proposals (View Application History)
@router.get("/{user_id}/proposals", response_model=List[schemas.ProposalResponse])
def get_my_proposals(user_id: int, db: Session = Depends(get_db)):
    freelancer = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    if not freelancer:
        return [] # Return empty list if no profile
    return freelancer.proposals