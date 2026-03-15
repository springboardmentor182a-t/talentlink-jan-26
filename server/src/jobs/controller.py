from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import SessionLocal, get_db
from src.jobs.models import JobCreate, JobResponse
from src.jobs.service import create_job, get_jobs, get_job_by_id
from src.auth.service import get_current_user
from src.entities.user import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/", response_model=JobResponse)
def create_new_job(job: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can post jobs")
    return create_job(db, job, current_user.id)

@router.get("/", response_model=List[JobResponse])
def read_jobs(db: Session = Depends(get_db)):
    return get_jobs(db)

@router.get("/{job_id}", response_model=JobResponse)
def read_job(job_id: int, db: Session = Depends(get_db)):
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
