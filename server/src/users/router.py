# server/src/users/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.users import schemas, service
from src.users.schemas.client import ClientDashboardResponse

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


# 4. Get Freelancer Profile
@router.get("/{user_id}/freelancer_profile", response_model=schemas.FreelancerProfileResponse)
def get_freelancer_profile(user_id: int, db: Session = Depends(get_db)):
    from . import models
    profile = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


# 5. Get Client Profile
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
    from . import models
    
    # 1. Find the freelancer profile for this user
    freelancer = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    
    if not freelancer:
        raise HTTPException(status_code=404, detail="You must have a Freelancer Profile to apply.")
    
    # 2. PREVENT DUPLICATES: Check if this freelancer already applied to this specific project
    existing_proposal = db.query(models.Proposal).filter(
        models.Proposal.freelancer_id == freelancer.id,
        models.Proposal.project_id == proposal.project_id
    ).first()
    
    if existing_proposal:
        raise HTTPException(
            status_code=400, 
            detail="You have already submitted a proposal for this project."
        )
    
    # 3. Create proposal linked to that freelancer
    return service.create_proposal(db=db, proposal=proposal, freelancer_id=freelancer.id)

# 7. Get My Proposals (View Application History)
@router.get("/{user_id}/proposals", response_model=List[schemas.ProposalResponse])
def get_my_proposals(user_id: int, db: Session = Depends(get_db)):
    from . import models
    freelancer = db.query(models.FreelancerProfile).filter(models.FreelancerProfile.user_id == user_id).first()
    if not freelancer:
        return [] # Return empty list if no profile
    return freelancer.proposals


# 8. Get Client Dashboard Aggregate Data
@router.get("/{user_id}/client-dashboard", response_model=ClientDashboardResponse)
def get_client_dashboard(user_id: int, db: Session = Depends(get_db)):
    # TEMPORARILY DISABLED FOR UI TESTING
    # from . import models
    # client_profile = db.query(models.ClientProfile).filter(models.ClientProfile.user_id == user_id).first()
    # if not client_profile:
    #     raise HTTPException(status_code=403, detail="Access denied. Client profile required.")

    # TODO: Replace this dictionary with actual SQLAlchemy queries once Project/Contract models are built.
    return {
        "stats": {
            "active_projects": 3, 
            "pending_proposals": 12,
            "total_spent": 4500.00, 
            "completed_projects": 8
        },
        "active_projects": [
            {
                "id": 1,
                "title": "E-Commerce Website Redesign",
                "posted_time": "2 days ago",
                "proposals_count": 8,
                "budget": "$2,000 - $5,000",
                "duration": "2-3 months",
                "status": "Active"
            },
            {
                "id": 2,
                "title": "Mobile App Development",
                "posted_time": "5 days ago",
                "proposals_count": 15,
                "budget": "$5,000 - $10,000",
                "duration": "3-4 months",
                "status": "Active"
            },
            {
                "id": 3,
                "title": "Logo & Brand Identity",
                "posted_time": "1 week ago",
                "proposals_count": 23,
                "budget": "$500 - $1,500",
                "duration": "2-4 weeks",
                "status": "Active"
            }
        ],
        "recent_activity": [
            {
                "id": 1,
                "type": "proposal",
                "text": "New proposal received from John Doe",
                "time": "2 hours ago"
            },
            {
                "id": 2,
                "type": "contract",
                "text": "Contract signed with Emily Chen",
                "time": "5 hours ago"
            }
        ]
    }