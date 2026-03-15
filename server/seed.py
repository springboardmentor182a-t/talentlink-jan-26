from sqlalchemy.orm import Session
from src.database.core import SessionLocal, engine, Base
from src.auth.service import register_user
from src.jobs.service import create_job
from src.jobs.models import JobCreate

def seed_data():
    db = SessionLocal()
    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)

        # Create Client
        client_email = "client@example.com"
        client = register_user(db, "Demo Client", client_email, "password", "client")
        if client:
            print(f"Created client: {client_email} / password")
        else:
            print(f"Client {client_email} already exists")
            from src.entities.user import User
            client = db.query(User).filter(User.email == client_email).first()

        # Create Freelancer
        freelancer_email = "freelancer@example.com"
        freelancer = register_user(db, "Demo Freelancer", freelancer_email, "password", "freelancer")
        if freelancer:
            print(f"Created freelancer: {freelancer_email} / password")
        else:
            print(f"Freelancer {freelancer_email} already exists")

        # Create Job
        if client:
            job_data = JobCreate(
                title="Build a React Dashboard",
                description="We need a freelancer to build a dashboard using React and FastAPI.",
                budget=1500
            )
            create_job(db, job_data, client.id)
            print("Created demo job: 'Build a React Dashboard'")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
