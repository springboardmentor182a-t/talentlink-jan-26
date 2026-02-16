from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.client_dashboard import service
from src.entities.dashboard import DashboardResponse

# Define the router
router = APIRouter(prefix="/client", tags=["Client Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
def read_dashboard(db: Session = Depends(get_db)):
    """
    Fetch all metrics for the Client Dashboard.
    """
    # ---------------------------------------------------------
    # TODO: When merging with Auth module, replace this line:
    # client_id = current_user.id
    # ---------------------------------------------------------
    
    # FOR NOW: We assume we are User #1 (Test Mode)
    client_id = 1 
    
    return service.get_dashboard_data(db, client_id)