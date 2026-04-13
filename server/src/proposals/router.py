from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from ..database.core import get_db
from ..auth.dependencies import get_current_user
from ..entities.user import User
from . import models, schemas

router = APIRouter(tags=["Proposals"])


@router.post("/", response_model=schemas.ProposalResponse, status_code=status.HTTP_201_CREATED)
def create_proposal(
    proposal: schemas.ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from ..users.models import FreelancerProfile
    freelancer_profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.user_id == current_user.id
    ).first()
    if not freelancer_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can submit proposals",
        )

    new_proposal = models.Proposal(
        **proposal.model_dump(),
        freelancer_id=freelancer_profile.id,
    )
    db.add(new_proposal)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted a proposal for this project",
        )
    db.refresh(new_proposal)
    return new_proposal


@router.get("/my-proposals", response_model=List[schemas.ProposalResponse])
def get_my_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from ..users.models import FreelancerProfile
    freelancer_profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.user_id == current_user.id
    ).first()
    if not freelancer_profile:
        return []
    return db.query(models.Proposal).filter(
        models.Proposal.freelancer_id == freelancer_profile.id
    ).all()


@router.get("/project/{project_id}", response_model=List[schemas.ProposalResponse])
def get_proposals_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Gap 1 fix -- verify the current user owns this project before exposing
    # competitor bid amounts and cover letters.
    # project.client_id is users.id (FK -> users.id confirmed in projects/models.py)
    from ..projects.models import Project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can view its proposals",
        )
    return db.query(models.Proposal).filter(
        models.Proposal.project_id == project_id
    ).all()


@router.patch("/{proposal_id}/status", response_model=schemas.ProposalResponse)
def update_proposal_status(
    proposal_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposal = db.query(models.Proposal).filter(models.Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    # Gap 2 fix -- verify the current user owns the project this proposal belongs to.
    # Without this any authenticated user can accept or reject any proposal.
    # project.client_id is users.id (FK -> users.id confirmed in projects/models.py)
    from ..projects.models import Project
    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can accept or reject proposals",
        )

    proposal.status = payload.get("status", proposal.status)
    db.commit()
    db.refresh(proposal)
    return proposal