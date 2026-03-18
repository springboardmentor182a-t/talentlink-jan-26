from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.core import get_db
from . import models, schemas

router = APIRouter(prefix="/proposals", tags=["Proposals"])

@router.post("/", response_model=schemas.ProposalResponse)
def create_proposal(proposal: schemas.ProposalCreate, db: Session = Depends(get_db)):
    # Create the new database record
    new_proposal = models.Proposal(
        **proposal.model_dump(), 
        freelancer_id=1  # Placeholder until Auth is set up
    )
    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)
    return new_proposal

@router.get("/my-proposals", response_model=List[schemas.ProposalResponse])
def get_my_proposals(db: Session = Depends(get_db)):
    return db.query(models.Proposal).filter(models.Proposal.freelancer_id == 1).all()

@router.get("/projects/")
def get_filtered_projects(min_budget: int = 0, db: Session = Depends(get_db)):
    # This line asks the database for projects where the budget is >= your selection
    projects = db.query(models.Project).filter(models.Project.budget >= min_budget).all()
    return projects