from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from .model import Proposal
from .schema import ProposalCreate

router = APIRouter(prefix="/proposals", tags=["Proposals"])


@router.post("/")
def create_proposal(data: ProposalCreate, db: Session = Depends(get_db)):
    proposal = Proposal(**data.dict())
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/project/{project_id}")
def get_proposals(project_id: int, db: Session = Depends(get_db)):
    return db.query(Proposal).filter(Proposal.project_id == project_id).all()


@router.get("/freelancer/{freelancer_id}")
def get_my_proposals(freelancer_id: int, db: Session = Depends(get_db)):
    return db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()


@router.put("/{proposal_id}/accept")
def accept_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Not found")

    proposal.status = "accepted"
    db.commit()
    return {"message": "Accepted"}


@router.put("/{proposal_id}/reject")
def reject_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).get(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Not found")

    proposal.status = "rejected"
    db.commit()
    return {"message": "Rejected"}
