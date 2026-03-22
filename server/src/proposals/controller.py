from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from .model import Proposal
from .schema import ProposalCreate, ProposalResponse
from src.projects.model import Project
from src.entities.contract import Contract
from src.entities.user import User

router = APIRouter(tags=["Proposals"])


def enrich_proposal(proposal: Proposal, db: Session) -> dict:
    """Add freelancer_name and project_title to a proposal dict."""
    data = {c.name: getattr(proposal, c.name) for c in proposal.__table__.columns}

    freelancer = db.query(User).filter(User.id == proposal.freelancer_id).first()
    data["freelancer_name"] = freelancer.name if freelancer else f"Freelancer #{proposal.freelancer_id}"

    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    data["project_title"] = project.title if project else f"Project #{proposal.project_id}"

    return data


@router.post("/", response_model=ProposalResponse)
def create_proposal(data: ProposalCreate, db: Session = Depends(get_db)):
    existing = db.query(Proposal).filter(
        Proposal.project_id    == data.project_id,
        Proposal.freelancer_id == data.freelancer_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a proposal for this project.")
    proposal = Proposal(**data.dict())
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return enrich_proposal(proposal, db)


@router.get("/project/{project_id}")
def get_proposals(project_id: int, db: Session = Depends(get_db)):
    proposals = db.query(Proposal).filter(Proposal.project_id == project_id).all()
    return [enrich_proposal(p, db) for p in proposals]


@router.get("/freelancer/{freelancer_id}")
def get_my_proposals(freelancer_id: int, db: Session = Depends(get_db)):
    proposals = db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()
    return [enrich_proposal(p, db) for p in proposals]


@router.put("/contracts/complete/{project_id}")
def complete_contract(project_id: int, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.project_id == project_id).first()
    if contract:
        contract.status = "completed"
        db.commit()
    return {"message": "Contract marked as completed"}


@router.put("/{proposal_id}/accept")
def accept_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal.status = "accepted"

    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if project:
        project.status = "in-progress"

    others = db.query(Proposal).filter(
        Proposal.project_id == proposal.project_id,
        Proposal.id != proposal_id,
        Proposal.status == "pending"
    ).all()
    for p in others:
        p.status = "rejected"

    freelancer = db.query(User).filter(User.id == proposal.freelancer_id).first()
    freelancer_name = freelancer.name if freelancer else f"Freelancer #{proposal.freelancer_id}"

    contract = Contract(
        project_id      = proposal.project_id,
        client_id       = project.client_id if project else None,
        freelancer_id   = proposal.freelancer_id,
        title           = project.title if project else f"Project #{proposal.project_id}",
        freelancer_name = freelancer_name,
        status          = "active",
        contract_value  = str(proposal.proposed_budget),
    )
    db.add(contract)
    db.commit()

    return {"message": "Proposal accepted, project in-progress, contract created ✅"}


@router.put("/{proposal_id}/reject")
def reject_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = "rejected"
    db.commit()
    return {"message": "Rejected"}