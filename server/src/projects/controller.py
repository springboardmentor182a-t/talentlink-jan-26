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
    client_id = 1 
    return service.create_project(db, project, client_id)