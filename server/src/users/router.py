# server/src/users/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.users import schemas, service

router = APIRouter()


@router.get("/", response_model=list[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),       # auth required; underscore = unused but fires
):
    """Get all users — authenticated only."""
    return service.UserService.get_all_users(db)


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID — public (used by profile view pages)."""
    user = service.UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/freelancer-profile", response_model=schemas.FreelancerProfileResponse)
def create_freelancer_profile(
    user_id: int,
    profile: schemas.FreelancerProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update a freelancer profile — only the owning user may do this."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own profile")
    return service.UserService.create_freelancer_profile(db=db, user_id=user_id, profile=profile)


@router.post("/{user_id}/client-profile", response_model=schemas.ClientProfileResponse)
def create_client_profile(
    user_id: int,
    profile: schemas.ClientProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update a client profile — only the owning user may do this."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own profile")
    return service.UserService.create_client_profile(db=db, user_id=user_id, profile=profile)


@router.get("/{user_id}/freelancer_profile", response_model=schemas.FreelancerProfileResponse)
def get_freelancer_profile(user_id: int, db: Session = Depends(get_db)):
    """Get a freelancer profile by user ID — public (used by client view pages)."""
    from src.users import models
    profile = db.query(models.FreelancerProfile).filter(
        models.FreelancerProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.get("/{user_id}/client_profile", response_model=schemas.ClientProfileResponse)
def get_client_profile(user_id: int, db: Session = Depends(get_db)):
    """Get a client profile by user ID — public (used by freelancer view pages)."""
    from src.users import models
    profile = db.query(models.ClientProfile).filter(
        models.ClientProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile