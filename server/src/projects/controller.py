from fastapi import APIRouter
from sqlalchemy.orm import Session

from src.database import SessionLocal
from src.projects.models import Project

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
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