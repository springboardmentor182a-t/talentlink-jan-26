from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.contracts.models import ContractCreate, ContractEditTerms, MilestoneUpdate, ContractResponse
from src.contracts.service import ContractService

router = APIRouter()


# ── Contracts ──────────────────────────────────────────────────────────────────

@router.post("/", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def create_contract(
    data: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new contract in draft status. Client only."""
    if current_user.role != "client":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only clients can create contracts")
    return ContractService.create_contract(db, data, current_user.id)


@router.get("/", response_model=List[ContractResponse])
def list_contracts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all contracts for the current user (client or freelancer)."""
    return ContractService.get_contracts(db, current_user.id, current_user.role)


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single contract with milestones. Returns 403 if not a party."""
    return ContractService.get_contract(db, contract_id, current_user.id)


@router.post("/{contract_id}/send", response_model=ContractResponse)
def send_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send draft → pending_sign. Client only."""
    if current_user.role != "client":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only clients can send contracts")
    return ContractService.send_contract(db, contract_id, current_user.id)


@router.post("/{contract_id}/sign", response_model=ContractResponse)
def sign_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sign pending_sign → active. Freelancer only."""
    if current_user.role != "freelancer":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only freelancers can sign contracts")
    return ContractService.sign_contract(db, contract_id, current_user.id)


@router.patch("/{contract_id}/terms", response_model=ContractResponse)
def edit_terms(
    contract_id: int,
    data: ContractEditTerms,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Propose term edits → rejected. Freelancer only."""
    if current_user.role != "freelancer":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only freelancers can propose term edits")
    return ContractService.edit_terms(db, contract_id, data, current_user.id)


@router.post("/{contract_id}/cancel", response_model=ContractResponse)
def cancel_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel active or pending_sign contract. Either party."""
    return ContractService.cancel_contract(db, contract_id, current_user.id)


# ── Milestones ─────────────────────────────────────────────────────────────────

@router.patch("/milestones/{milestone_id}", response_model=ContractResponse)
def update_milestone(
    milestone_id: int,
    data: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark milestone complete/incomplete. Returns the updated contract. Freelancer only."""
    if current_user.role != "freelancer":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only freelancers can update milestones")
    return ContractService.update_milestone(db, milestone_id, data.is_completed, current_user.id)