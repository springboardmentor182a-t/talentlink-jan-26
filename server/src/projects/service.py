import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from src.projects import models, schemas

logger = logging.getLogger(__name__)

class ProjectService:

    @staticmethod
    def create_project(db: Session, project: schemas.ProjectCreate, client_id: int):
        """Create a new project linked to a client profile."""
        try:
            db_project = models.Project(
                **project.model_dump(),
                client_id=client_id,
                status="open"
            )
            
            db.add(db_project)
            db.commit()
            db.refresh(db_project)
            
            logger.info(f"Successfully created project {db_project.id} for client {client_id}")
            return db_project
            
        except SQLAlchemyError as err:
            db.rollback()
            logger.error(f"Database error creating project for client {client_id}: {str(err)}")
            raise HTTPException(
                status_code=500, 
                detail="An internal database error occurred while posting your project."
            )

    @staticmethod
    def get_projects(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: str | None = None,
        min_budget: float | None = None
    ):
        """Fetch open projects with pagination and filtering."""
        query = db.query(models.Project).filter(models.Project.status == "open")

        if search:
            search_filter = f"%{search}%"
            # Using basic or_ logic here with SQLAlchemy
            # We import or_ dynamically to keep it clean, or we can use bitwise |
            from sqlalchemy import or_
            query = query.filter(
                or_(
                    models.Project.title.ilike(search_filter),
                    models.Project.description.ilike(search_filter)
                )
            )

        if min_budget is not None:
            query = query.filter(models.Project.budget >= min_budget)

        total_count = query.count()
        
        # We order by created_at descending by default
        projects = query.order_by(models.Project.created_at.desc()).offset(skip).limit(limit).all()

        return {
            "items": projects,
            "total_count": total_count,
            "skip": skip,
            "limit": limit
        }
