from sqlalchemy.orm import Session
from src.projects.models import Project
from src.projects.schemas import ProjectCreate

def create_project(db: Session, project: ProjectCreate, client_id: int):
    new_project = Project(
        title=project.title,
        description=project.description,
        budget=project.budget,
        deadline=project.deadline,
        client_id=client_id,
        status="Open",       # Default status for new jobs
        progress=0,          # Starts at 0%
        budget_spent=0.0     # Nothing spent yet
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project