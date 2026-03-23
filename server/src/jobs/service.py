from sqlalchemy.orm import Session
from src.entities.job import Job
from src.jobs.models import JobCreate

def create_job(db: Session, job: JobCreate, client_id: int):
    new_job = Job(
        title=job.title,
        description=job.description,
        budget=job.budget,
        client_id=client_id,
        status="OPEN"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

def get_jobs(db: Session):
    return db.query(Job).filter(Job.status == "OPEN").all()

def get_job_by_id(db: Session, job_id: int):
    return db.query(Job).filter(Job.id == job_id).first()
