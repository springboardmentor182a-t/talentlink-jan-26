from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import SessionLocal, get_db
from src.proposals.models import ProposalCreate, ProposalResponse
from src.proposals.service import create_proposal, get_proposals_by_user
from src.auth.service import get_current_user
from src.entities.user import User

router = APIRouter(prefix="/proposals", tags=["Proposals"])

@router.post("/", response_model=ProposalResponse)
def submit_proposal(proposal: ProposalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can submit proposals")
    return create_proposal(db, proposal, current_user.id)

@router.get("/me", response_model=List[ProposalResponse])
def read_my_proposals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_proposals_by_user(db, current_user.id)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from .model import Proposal
from .schema import ProposalCreate, ProposalResponse

router = APIRouter(prefix="/proposals", tags=["Proposals"])


@router.post("/", response_model=ProposalResponse)
def create_proposal(data: ProposalCreate, db: Session = Depends(get_db)):
    proposal = Proposal(**data.dict())
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/project/{project_id}", response_model=list[ProposalResponse])
def get_proposals(project_id: int, db: Session = Depends(get_db)):
    return db.query(Proposal).filter(Proposal.project_id == project_id).all()


@router.get("/freelancer/{freelancer_id}", response_model=list[ProposalResponse])
def get_my_proposals(freelancer_id: int, db: Session = Depends(get_db)):
    return db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()


@router.put("/{proposal_id}/accept")
def accept_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()  # ✅ fixed
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = "accepted"
    db.commit()
    return {"message": "Accepted"}


@router.put("/{proposal_id}/reject")
def reject_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()  # ✅ fixed
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = "rejected"
    db.commit()
    return {"message": "Rejected"}
