from fastapi import APIRouter, Depends
from .service import ClientDashboardService
from .schemas import DashboardStats, ProjectSummary, ChartData, UnreadMessages, ContractStats, ContractSummary, ProposalSchema
from typing import List
from sqlalchemy.orm import Session
from src.database.core import get_db

router = APIRouter(prefix="/api/client", tags=["Client Dashboard"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return ClientDashboardService.get_dashboard_stats(db)

@router.get("/dashboard/recent-projects", response_model=List[ProjectSummary])
def get_recent_projects(db: Session = Depends(get_db)):
    return ClientDashboardService.get_recent_projects(db)

@router.get("/dashboard/charts", response_model=ChartData)
def get_chart_data(db: Session = Depends(get_db)):
    return ClientDashboardService.get_chart_data(db)

@router.get("/messages/unread-count", response_model=UnreadMessages)
def get_unread_messages_count(db: Session = Depends(get_db)):
    return ClientDashboardService.get_unread_messages_count(db)

@router.get("/contracts/stats", response_model=ContractStats)
def get_contract_stats(db: Session = Depends(get_db)):
    return ClientDashboardService.get_contract_stats(db)

@router.get("/contracts/active", response_model=List[ContractSummary])
def get_active_contracts(db: Session = Depends(get_db)):
    return ClientDashboardService.get_active_contracts(db)

@router.get("/contracts/completed", response_model=List[ContractSummary])
def get_completed_contracts(db: Session = Depends(get_db)):
    return ClientDashboardService.get_completed_contracts(db)

@router.get("/proposals/{project_id}", response_model=List[ProposalSchema])
def get_proposals(project_id: int, db: Session = Depends(get_db)):
    return ClientDashboardService.get_proposals(db, project_id)

@router.post("/proposals/{proposal_id}/accept")
def accept_proposal(proposal_id: int, db: Session = Depends(get_db)):
    contract = ClientDashboardService.accept_proposal(db, proposal_id)
    if not contract:
        return {"error": "Proposal not found"}
    return {"message": "Proposal accepted and contract created", "contract_id": contract.id}
