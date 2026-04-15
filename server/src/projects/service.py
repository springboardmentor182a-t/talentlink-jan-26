import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from src.projects.models import Project          # ← was src.entities.project (wrong file)
from src.projects import schemas

logger = logging.getLogger(__name__)


class ProjectService:

    @staticmethod
    def create_project(db: Session, project: schemas.ProjectCreate, client_id: int):
        """Create a new project linked to the client's user id."""
        try:
            db_project = Project(
                **project.model_dump(),
                client_id=client_id,
                status="open"
            )
            db.add(db_project)
            db.commit()
            db.refresh(db_project)
            logger.info(f"Created project {db_project.id} for client {client_id}")
            return db_project

        except SQLAlchemyError as err:
            db.rollback()
            logger.error(f"DB error creating project for client {client_id}: {err}")
            raise HTTPException(
                status_code=500,
                detail="An internal database error occurred while posting your project."
            )

    @staticmethod
    def get_project_by_id(db: Session, project_id: int):
        """Fetch a single project by ID, with client display name attached."""
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")
        return ProjectService._attach_client_name(project)

    @staticmethod
    def get_projects(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: str | None = None,
        min_budget: float | None = None,
    ):
        """Fetch open projects with pagination, search, and budget filtering."""
        query = db.query(Project).filter(Project.status == "open")

        if search:
            from sqlalchemy import or_
            term = f"%{search}%"
            query = query.filter(
                or_(
                    Project.title.ilike(term),
                    Project.description.ilike(term),
                    Project.skills.ilike(term),
                )
            )

        if min_budget is not None:
            # budget_max is the ceiling the client is willing to pay
            query = query.filter(Project.budget_max >= min_budget)  # ← was Project.budget (column doesn't exist)

        total_count = query.count()
        projects = (
            query.order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        enriched = [ProjectService._attach_client_name(p) for p in projects]

        return {
            "items": enriched,
            "total_count": total_count,
            "skip": skip,
            "limit": limit,
        }

    @staticmethod
    def _attach_client_name(project: Project) -> Project:
        """
        Attach client_display_name to a project instance using the ORM relationship.
        Prefers company_name from ClientProfile, falls back to username or email.
        """
        try:
            user = project.client
            if user:
                client_profile = getattr(user, "client_profile", None)
                if client_profile and getattr(client_profile, "company_name", None):
                    project.client_display_name = client_profile.company_name
                else:
                    project.client_display_name = user.username or user.email
            else:
                project.client_display_name = None
        except Exception:
            project.client_display_name = None
        return project