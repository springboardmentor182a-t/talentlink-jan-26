from sqlalchemy.orm import Session
from src.entities.proposal import Proposal
from src.proposals.models import ProposalCreate

def create_proposal(db: Session, proposal: ProposalCreate, freelancer_id: int):
    new_proposal = Proposal(
        job_id=proposal.job_id,
        freelancer_id=freelancer_id,
        cover_letter=proposal.cover_letter,
        bid_amount=proposal.bid_amount,
        status="PENDING"
    )
    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)
    return new_proposal

def get_proposals_by_user(db: Session, user_id: int):
    return db.query(Proposal).filter(Proposal.freelancer_id == user_id).all()
