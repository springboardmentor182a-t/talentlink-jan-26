from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from .model import Project
from .schema import ProjectCreate, ProjectResponse
from src.entities.proposal import Proposal
from src.entities.user import User
from src.notifications.controller import create_and_send_notification

router = APIRouter(tags=["Projects"])


@router.get("/open/", response_model=list[ProjectResponse])
def get_open_projects(db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .filter(Project.status == "open")
        .order_by(Project.created_at.desc())
        .all()
    )


@router.get("/client/{client_id}", response_model=list[ProjectResponse])
def get_client_projects(client_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .filter(Project.client_id == client_id)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=ProjectResponse)
async def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**data.dict())
    db.add(project)
    db.commit()
    db.refresh(project)

    # ── Notify client — project posted successfully ───────────
    if project.client_id:
        await create_and_send_notification(
            db,
            user_id = project.client_id,
            title   = "Project Posted Successfully 🚀",
            message = f"Your project '{project.title}' is now live and accepting proposals.",
            type    = "proposal"
        )

    # ── Notify ALL freelancers — new project available ────────
    freelancers = db.query(User).filter(User.role == "freelancer").all()
    for freelancer in freelancers:
        await create_and_send_notification(
            db,
            user_id = freelancer.id,
            title   = "New Project Available 🎯",
            message = f"A new project '{project.title}' has been posted. Check it out and submit a proposal!",
            type    = "proposal"
        )

    return project


@router.put("/{project_id}/close")
async def close_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.status = "closed"
    db.commit()

    # ── Notify client — project closed ───────────────────────
    if project.client_id:
        await create_and_send_notification(
            db,
            user_id = project.client_id,
            title   = "Project Closed 🔒",
            message = f"Your project '{project.title}' has been closed.",
            type    = "proposal"
        )

    # ── Notify all pending freelancers — project closed ───────
    pending_proposals = db.query(Proposal).filter(
        Proposal.project_id == project_id,
        Proposal.status     == "pending"
    ).all()

    for prop in pending_proposals:
        freelancer = db.query(User).filter(User.id == prop.freelancer_id).first()
        if freelancer:
            await create_and_send_notification(
                db,
                user_id = prop.freelancer_id,
                title   = "Project Closed",
                message = f"The project '{project.title}' you applied to has been closed.",
                type    = "proposal"
            )

    return {"message": "Project closed"}


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, data: dict, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    old_status = project.status

    for key, value in data.items():
        if hasattr(project, key) and key not in ["id", "client_id", "created_at"]:
            setattr(project, key, value)
    db.commit()
    db.refresh(project)

    # ── Notify client — project updated ──────────────────────
    if project.client_id:
        await create_and_send_notification(
            db,
            user_id = project.client_id,
            title   = "Project Updated ✏️",
            message = f"Your project '{project.title}' has been updated successfully.",
            type    = "proposal"
        )

    # ── Notify freelancers if status changed ─────────────────
    if "status" in data and data["status"] != old_status:
        proposals = db.query(Proposal).filter(
            Proposal.project_id == project_id,
            Proposal.status.in_(["pending", "accepted"])
        ).all()

        for prop in proposals:
            freelancer = db.query(User).filter(User.id == prop.freelancer_id).first()
            if freelancer:
                await create_and_send_notification(
                    db,
                    user_id = prop.freelancer_id,
                    title   = "Project Status Updated 📋",
                    message = f"The project '{project.title}' status changed to '{data['status']}'.",
                    type    = "proposal"
                )

    return project