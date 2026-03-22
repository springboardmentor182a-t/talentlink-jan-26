from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.client_dashboard import service
from src.entities.dashboard import DashboardResponse

from src.auth.dependencies import get_current_user
from src.projects.models import User

# Define the router
router = APIRouter(prefix="/client", tags=["Client Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
def read_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch all metrics for the Client Dashboard.
    """
    return service.get_dashboard_data(db, current_user.id)