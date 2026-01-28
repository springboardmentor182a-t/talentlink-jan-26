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
    # Check if email already exists
    db_user = service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return service.create_user(db=db, user=user)

# 2. Create Freelancer Profile
@router.post("/{user_id}/freelancer-profile", response_model=schemas.FreelancerProfileResponse)
def create_freelancer_profile(user_id: int, profile: schemas.FreelancerProfileCreate, db: Session = Depends(get_db)):
    # In a real app, we would verify the currently logged-in user here
    return service.create_freelancer_profile(db=db, user_id=user_id, profile=profile)

# 3. Create Client Profile
@router.post("/{user_id}/client-profile", response_model=schemas.ClientProfileResponse)
def create_client_profile(user_id: int, profile: schemas.ClientProfileCreate, db: Session = Depends(get_db)):
    return service.create_client_profile(db=db, user_id=user_id, profile=profile)