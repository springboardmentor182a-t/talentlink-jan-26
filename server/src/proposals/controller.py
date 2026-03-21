from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from .model import Proposal
from .schema import ProposalCreate, ProposalResponse

router = APIRouter(tags=["Proposals"])


@router.post("/", response_model=ProposalResponse)
def create_proposal(data: ProposalCreate, db: Session = Depends(get_db)):
    # ── One proposal per freelancer per project ───────────────────────────────
    existing = db.query(Proposal).filter(
        Proposal.project_id    == data.project_id,
        Proposal.freelancer_id == data.freelancer_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted a proposal for this project."
        )
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
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = "accepted"
    db.commit()
    return {"message": "Accepted"}


@router.put("/{proposal_id}/reject")
def reject_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = "rejected"
    db.commit()
    return {"message": "Rejected"}