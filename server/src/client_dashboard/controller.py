from fastapi import APIRouter
from sqlalchemy.orm import Session

from src.database import SessionLocal
from src.client_dashboard import service
from src.entities.dashboard import DashboardResponse

# Define the router
router = APIRouter(prefix="/client", tags=["Client Dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def read_dashboard():
    db: Session = SessionLocal()

    # Ensure default client exists
    from src.projects.models import User

    default_client = db.query(User).filter(User.id == 1).first()

    if not default_client:
        default_client = User(
            id=1,
            username="nayana",
            full_name="Nayana",
            role="Client"
        )
        db.add(default_client)
        db.commit()
        db.refresh(default_client)

    client_id = default_client.id

    # Get dashboard data
    result = service.get_dashboard_data(db, client_id)

    db.close()

    return result