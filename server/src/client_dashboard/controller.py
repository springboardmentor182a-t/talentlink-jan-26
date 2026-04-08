from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.client_dashboard import service
from src.entities.dashboard import DashboardResponse

from src.auth.dependencies import get_current_user
from src.projects.models import User


class ProposalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    rate: float
    timeline: str
    client_email: str
    project_id: Optional[int] = None


class ProposalStatusUpdate(BaseModel):
    status: str

# Define the router
router = APIRouter(prefix="/client", tags=["Client Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
def read_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch all metrics for the Client Dashboard.
    """
    return service.get_dashboard_data(db, current_user.id)


@router.get("/received-proposals")
def read_received_proposals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch received proposals for the authenticated client.
    """
    return service.get_received_proposals(db, current_user.id)


@router.patch("/received-proposals/{proposal_id}")
def update_received_proposal_status(
    proposal_id: int,
    payload: ProposalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the status of a received proposal for the authenticated client.
    """
    if payload.status not in {"Accepted", "Rejected", "Under Review", "Pending"}:
        raise HTTPException(status_code=400, detail="Invalid proposal status")

    proposal = service.update_client_proposal_status(db, current_user.id, proposal_id, payload.status)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal


@router.get("/projects")
def read_client_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch projects for the authenticated client.
    """
    return service.get_client_projects(db, current_user.id)


@router.get("/profile")
def read_client_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch client profile, project, payment, and activity data.
    """
    return service.get_client_profile_data(db, current_user.id)

# Freelancer endpoints
freelancer_router = APIRouter(prefix="/freelancer", tags=["Freelancer Dashboard"])

@freelancer_router.get("/proposals")
def read_freelancer_proposals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch proposals for the authenticated freelancer.
    """
    return service.get_freelancer_proposals(db, current_user.id)


@freelancer_router.get("/dashboard")
def read_freelancer_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch metrics and data for the freelancer dashboard.
    """
    return service.get_freelancer_dashboard_data(db, current_user.id)


@freelancer_router.get("/profile")
def read_freelancer_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch profile, performance, and activity data for the authenticated freelancer.
    """
    return service.get_freelancer_profile_data(db, current_user.id)


@freelancer_router.get("/projects")
def read_freelancer_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch open projects visible to the authenticated freelancer.
    """
    return service.get_freelancer_projects(db, current_user.id)


@freelancer_router.get("/earnings")
def read_freelancer_earnings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch earnings summary and payment history for the authenticated freelancer.
    """
    return service.get_freelancer_earnings(db, current_user.id)


@freelancer_router.post("/proposals")
def create_freelancer_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new proposal as a freelancer.
    """
    client = db.query(User).filter(User.email == proposal.client_email).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    new_proposal = service.create_freelancer_proposal(
        db,
        freelancer_id=current_user.id,
        client_id=client.id,
        project_id=proposal.project_id,
        title=proposal.title,
        description=proposal.description,
        amount=proposal.amount,
        rate=proposal.rate,
        timeline=proposal.timeline,
    )

    return new_proposal
