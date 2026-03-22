from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from .model import Project
from .schema import ProjectCreate, ProjectResponse

router = APIRouter(tags=["Projects"])


@router.get("/projects/client/{client_id}", response_model=list[ProjectResponse])
def get_client_projects(client_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .filter(Project.client_id == client_id)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.get("/projects/open/", response_model=list[ProjectResponse])
def get_open_projects(db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .filter(Project.status == "open")
        .order_by(Project.created_at.desc())
        .all()
    )


@router.post("/projects/", response_model=ProjectResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**data.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/projects/{project_id}/close")
def close_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.status = "closed"
    db.commit()
    return {"message": "Project closed"}


@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: dict, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in data.items():
        if hasattr(project, key) and key not in ["id", "client_id", "created_at"]:
            setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project