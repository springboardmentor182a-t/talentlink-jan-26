from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.projects import service, schemas

from src.auth.dependencies import get_current_user
from src.projects.models import User

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/")
def create_new_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new project for the client.
    """
    return service.create_project(db, project, current_user.id)