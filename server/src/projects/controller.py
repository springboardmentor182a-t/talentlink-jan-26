from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.projects import service, schemas

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/")
def create_new_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """
    Create a new project for the client.
    """
    # We are still hardcoding client_id=1 until we add Login/Auth
    from src.projects.models import User
    default_client = db.query(User).filter(User.id == 1).first()
    if not default_client:
        default_client = User(id=1, username="nayana", full_name="Nayana", role="Client")
        db.add(default_client)
        db.commit()
        db.refresh(default_client)
        
    client_id = default_client.id 
    return service.create_project(db, project, client_id)