from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import SessionLocal
from src.projects.models import Project, User
from src.auth.dependencies import get_current_user

# (Assuming these were already used in your project)
from src.projects import schemas, service
from src.database.core import get_db


# Router
router = APIRouter(prefix="/projects", tags=["Projects"])


# ---------------- DASHBOARD (OLD CODE KEPT) ----------------
@router.get("/dashboard")
def get_dashboard():
    db: Session = SessionLocal()

    projects = db.query(Project).all()

    data = [
        {
            "id": p.id,
            "title": p.title,
            "status": p.status,
            "budget": p.budget
        }
        for p in projects
    ]

    db.close()

    return {"projects": data}


# ---------------- CREATE PROJECT (NEW CODE KEPT) ----------------
@router.post("/")
def create_new_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new project for the client.
    """
    return service.create_project(db, project, current_user.id)