from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List
from sqlalchemy.orm import Session
from src.database.core import get_db
from .service import FreelancerDashboardService
from src.client_dashboard.schemas import ContractStats, ContractSummary

router = APIRouter(prefix="/api/freelancer", tags=["Freelancer Dashboard"])

@router.get("/contracts/stats", response_model=ContractStats)
def get_contract_stats(freelancer_name: str, db: Session = Depends(get_db)):
    if not freelancer_name:
        raise HTTPException(status_code=400, detail="freelancer_name parameter is required")
    return FreelancerDashboardService.get_contract_stats(db, freelancer_name)

@router.get("/contracts/active", response_model=List[ContractSummary])
def get_active_contracts(freelancer_name: str, db: Session = Depends(get_db)):
    if not freelancer_name:
        raise HTTPException(status_code=400, detail="freelancer_name parameter is required")
    return FreelancerDashboardService.get_active_contracts(db, freelancer_name)

@router.get("/contracts/completed", response_model=List[ContractSummary])
def get_completed_contracts(freelancer_name: str, db: Session = Depends(get_db)):
    if not freelancer_name:
        raise HTTPException(status_code=400, detail="freelancer_name parameter is required")
    return FreelancerDashboardService.get_completed_contracts(db, freelancer_name)

@router.put("/contracts/{contract_id}/milestones/{milestone_id}")
def update_milestone_status(
    contract_id: int, 
    milestone_id: int, 
    freelancer_name: str,
    status: str,
    db: Session = Depends(get_db)
):
    if not freelancer_name:
        raise HTTPException(status_code=400, detail="freelancer_name parameter is required")
    
    # 'completed', 'in-progress', 'pending' are the valid frontend statuses
    contract = FreelancerDashboardService.update_milestone_status(db, contract_id, milestone_id, status, freelancer_name)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract/Milestone not found or authorization failed")
    
    return {"message": "Milestone updated", "contract": contract}
