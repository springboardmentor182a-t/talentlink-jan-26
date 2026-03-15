import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.projects import schemas
from src.projects.service import ProjectService

logger = logging.getLogger(__name__)
router = APIRouter()

# In a real app, this would come from a JWT dependency `get_current_user`
# But based on instructions, we will mock the client_id for now as 1 (assuming client exists)
def get_mock_client_id() -> int:
    return 1

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db),
    client_id: int = Depends(get_mock_client_id)
):
    """Post a new project to the marketplace"""
    logger.info(f"Client {client_id} attempting to post a new project: {project.title}")
    
    # Optional logic: we could verify the client_id actually exists in `profiles_client`
    from src.users.models import ClientProfile
    client_profile = db.query(ClientProfile).filter(ClientProfile.id == client_id).first()
    
    if not client_profile:
        logger.warning(f"Client {client_id} attempted to post a project without a valid client profile.")
        raise HTTPException(status_code=404, detail="You must have a Client Profile to post projects.")
        
    return ProjectService.create_project(db=db, project=project, client_id=client_id)

@router.get("/", response_model=schemas.ProjectListResponse)
def get_projects(
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    min_budget: float | None = None,
    db: Session = Depends(get_db)
):
    """Retrieve open projects from the marketplace with optional filtering."""
    logger.info(f"Fetching projects - skip:{skip}, limit:{limit}, search:'{search}', min_budget:{min_budget}")
    return ProjectService.get_projects(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        min_budget=min_budget
    )
