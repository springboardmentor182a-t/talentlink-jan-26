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
