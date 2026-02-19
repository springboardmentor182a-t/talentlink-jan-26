# server/src/users/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.users import schemas, service
from typing import List

router = APIRouter()


@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user via the users module"""
    db_user = service.UserService.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return service.UserService.create_user(db=db, user=user)


@router.get("/", response_model=list[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Get all users (admin use)"""
    return service.UserService.get_all_users(db)


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    user = service.UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/freelancer-profile", response_model=schemas.FreelancerProfileResponse)
def create_freelancer_profile(
    user_id: int,
    profile: schemas.FreelancerProfileCreate,
    db: Session = Depends(get_db)
):
    return service.UserService.create_freelancer_profile(db=db, user_id=user_id, profile=profile)


@router.post("/{user_id}/client-profile", response_model=schemas.ClientProfileResponse)
def create_client_profile(
    user_id: int, 
    profile: schemas.ClientProfileCreate, 
    db: Session = Depends(get_db)
):
    """Create or update a client profile dynamically using the UserService"""
    return service.UserService.create_client_profile(db=db, user_id=user_id, profile=profile)


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
    from . import models
    freelancer = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="You must have a Freelancer Profile to apply.")
    
    # 2. Create proposal linked to that freelancer
    return service.create_proposal(db=db, proposal=proposal, freelancer_id=freelancer.id)


# 7. Get My Proposals (View Application History)
@router.get("/{user_id}/proposals", response_model=List[schemas.ProposalResponse])
def get_my_proposals(user_id: int, db: Session = Depends(get_db)):
    from . import models
    freelancer = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    if not freelancer:
        return [] # Return empty list if no profile
    return freelancer.proposals