from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

# Imports
from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.users.models import FreelancerProfile, Proposal
from src.entities.contract import Contract
from src.projects.models import Project

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Ensures we only get data for the logged-in user!
):
    # 1. Get the actual profile for whoever is logged in
    profile = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == current_user.id).first()
    
    # Fallback to their email prefix if they haven't set a full name yet
    user_name = profile.full_name if profile else current_user.email.split('@')[0]
    freelancer_id = profile.id if profile else 0

    # 2. Dynamically count pending proposals & sum earnings
    pending_proposals_count = db.query(Proposal).filter(
        Proposal.freelancer_id == freelancer_id,
        Proposal.status == "pending"
    ).count()

    earnings_sum = db.query(func.sum(Proposal.bid_amount)).filter(
        Proposal.freelancer_id == freelancer_id,
        Proposal.status == "accepted"
    ).scalar() or 0.0

    # 3. Get Active Projects and Contracts (Using real entities)
    active_projects_count = db.query(Project).count()
    active_contract = db.query(Contract).filter(Contract.status == "active").first()
    
    # 4. Return the fully dynamic data!
    return {
        "user": user_name,
        "stats": {
            "active_projects": active_projects_count,
            "pending_proposals": pending_proposals_count,
            "total_earnings": f"${earnings_sum:,.0f}",
            "profile_views": getattr(profile, 'profile_views', 0) if profile else 0
        },
        "active_contract": {
            "title": active_contract.title if active_contract else "No active contracts",
            "due": "N/A", # Due dates are inside milestones in the new architecture
            "progress": 0
        } if active_contract else {
            "title": "No active contracts",
            "due": "N/A",
            "progress": 0
        }
    }