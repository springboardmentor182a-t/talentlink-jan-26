from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from .models import Review
from .schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


def _get_completed_contract(db: Session, reviewer_id: int, reviewee_id: int, project_id: int):
    """
    Returns a completed contract that links reviewer and reviewee on the given project.
    Handles the freelancer_id ID-space: proposals.freelancer_id is profiles_freelancer.id,
    not users.id — use the same resolution pattern as contracts/service.py.
    """
    from src.contracts.models import Contract
    from src.proposals.models import Proposal
    from src.projects.models import Project
    from src.users.models import FreelancerProfile

    # Find all completed contracts for this project
    contracts = (
        db.query(Contract)
        .join(Proposal, Contract.proposal_id == Proposal.id)
        .join(Project, Proposal.project_id == Project.id)
        .filter(Project.id == project_id, Contract.status == "completed")
        .all()
    )

    for contract in contracts:
        proposal = contract.proposal
        project  = proposal.project

        # project.client_id is users.id directly
        client_user_id = project.client_id

        # proposal.freelancer_id is profiles_freelancer.id — resolve to users.id
        freelancer_profile = db.query(FreelancerProfile).filter(
            FreelancerProfile.id == proposal.freelancer_id
        ).first()
        if not freelancer_profile:
            continue
        freelancer_user_id = freelancer_profile.user_id

        parties = {client_user_id, freelancer_user_id}
        if reviewer_id in parties and reviewee_id in parties and reviewer_id != reviewee_id:
            return contract

    return None


@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review: ReviewCreate,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),   # Fix 1: auth required
):
    reviewer_id = current_user.id   # Fix 2: derive from JWT, never trust client

    # Fix 3: eligibility — a completed contract must link reviewer and reviewee
    contract = _get_completed_contract(db, reviewer_id, review.reviewee_id, review.project_id)
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review someone after completing a contract together on this project.",
        )

    # Fix 4: duplicate guard — one review per reviewer per project
    existing = db.query(Review).filter(
        Review.reviewer_id == reviewer_id,
        Review.project_id  == review.project_id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted a review for this project.",
        )

    db_review = Review(
        rating      = review.rating,
        comment     = review.comment,
        project_id  = review.project_id,
        reviewee_id = review.reviewee_id,
        reviewer_id = reviewer_id,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    # Fix 5: attach reviewer_name for the client
    reviewer = db.query(User).filter(User.id == reviewer_id).first()
    result = ReviewOut.model_validate(db_review)
    result.reviewer_name = reviewer.username if reviewer else None
    return result


@router.get("/user/{user_id}", response_model=List[ReviewOut])
def get_user_reviews(
    user_id: int,
    db:      Session = Depends(get_db),
    _:       User    = Depends(get_current_user),   # auth required — no unauthenticated reads
):
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()

    # Attach reviewer_name to each review
    results = []
    for rev in reviews:
        reviewer = db.query(User).filter(User.id == rev.reviewer_id).first()
        out = ReviewOut.model_validate(rev)
        out.reviewer_name = reviewer.username if reviewer else None
        results.append(out)

    return results