from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database.core import get_db
from .models import Project
from .schemas import ProjectOut

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.get("/", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return projects