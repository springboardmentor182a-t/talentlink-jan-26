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
    
    from src.projects.models import User
    # FOR NOW: Ensure a default client exists so the app doesn't crash on an empty DB
    default_client = db.query(User).filter(User.id == 1).first()
    if not default_client:
        default_client = User(id=1, username="nayana", full_name="Nayana", role="Client")
        db.add(default_client)
        db.commit()
        db.refresh(default_client)

    client_id = default_client.id
    
    return service.get_dashboard_data(db, client_id)