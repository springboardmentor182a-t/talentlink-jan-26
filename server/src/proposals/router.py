from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database.core import get_db
from ..auth.dependencies import get_current_user
from ..entities.user import User
from . import models, schemas

router = APIRouter(prefix="/proposals", tags=["Proposals"])


@router.post("/", response_model=schemas.ProposalResponse)
def create_proposal(
    proposal: schemas.ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_proposal = models.Proposal(
        **proposal.model_dump(),
        freelancer_id=current_user.id,
    )
    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)
    return new_proposal


@router.get("/my-proposals", response_model=List[schemas.ProposalResponse])
def get_my_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(models.Proposal).filter(
        models.Proposal.freelancer_id == current_user.id
    ).all()