from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database.core import get_db
from ..auth.dependencies import get_current_user
from ..entities.user import User
from ..projects.models import Project
from . import models, schemas

router = APIRouter(tags=["Saved Projects"])


@router.get("/", response_model=List[schemas.SavedProjectResponse])
def get_saved_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all projects saved by the current user."""
    return (
        db.query(models.SavedProject)
        .filter(models.SavedProject.user_id == current_user.id)
        .order_by(models.SavedProject.created_at.desc())
        .all()
    )


@router.post("/{project_id}", response_model=schemas.SavedProjectResponse, status_code=status.HTTP_201_CREATED)
def save_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a project for the current user. Idempotent — returns existing record if already saved."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing = (
        db.query(models.SavedProject)
        .filter(
            models.SavedProject.user_id == current_user.id,
            models.SavedProject.project_id == project_id,
        )
        .first()
    )
    if existing:
        return existing

    saved = models.SavedProject(user_id=current_user.id, project_id=project_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a saved project for the current user."""
    saved = (
        db.query(models.SavedProject)
        .filter(
            models.SavedProject.user_id == current_user.id,
            models.SavedProject.project_id == project_id,
        )
        .first()
    )
    if not saved:
        raise HTTPException(status_code=404, detail="Saved project not found")

    db.delete(saved)
    db.commit()