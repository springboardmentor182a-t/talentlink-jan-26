from sqlalchemy.orm import Session
from src.entities.proposal import Proposal
from src.proposals.models import ProposalCreate

def create_proposal(db: Session, proposal: ProposalCreate, freelancer_id: int):
    new_proposal = Proposal(
        job_id=proposal.job_id,
        freelancer_id=freelancer_id,
        cover_letter=proposal.cover_letter,
        bid_amount=proposal.bid_amount,
        delivery_time=proposal.delivery_time,
        status="PENDING"
    )
    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)
    return new_proposal

def get_proposals_by_user(db: Session, user_id: int):
    return db.query(Proposal).filter(Proposal.freelancer_id == user_id).all()

def get_proposals_for_job(db: Session, job_id: int):
    return db.query(Proposal).filter(Proposal.job_id == job_id).all()

def update_proposal_status(db: Session, proposal_id: int, status: str):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if proposal:
        proposal.status = status.upper()
        db.commit()
        db.refresh(proposal)
        return proposal
    return None
