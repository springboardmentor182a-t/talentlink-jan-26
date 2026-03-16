import sys
import os

# Add the current directory to sys.path so it can find the 'src' folder
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from src.database.core import SessionLocal, engine, Base

# Import the actual classes based on your file structure
from src.entities.user import User
from src.users.models import ClientProfile
from src.projects.models import Project

def seed_data():
    db = SessionLocal()
    try:
        print("Cleaning up old data (optional)...")
        # Base.metadata.drop_all(bind=engine) # Uncomment if you want a total reset
        Base.metadata.create_all(bind=engine)

        # 1. Create a User (The Identity)
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password="fake_hashed_password", # In real life, use passlib
                role="client"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"✅ User created: {admin_user.username}")
        else:
            print("ℹ️ User 'admin' already exists.")

        # 2. Create a Client Profile (The Metadata)
        client_profile = db.query(ClientProfile).filter(ClientProfile.user_id == admin_user.id).first()
        if not client_profile:
            client_profile = ClientProfile(
                user_id=admin_user.id,
                company_name="TalentLink Corp",
                industry="Tech",
                company_description="Top tier AI-ML internship projects."
            )
            db.add(client_profile)
            db.commit()
            print("✅ Client Profile linked.")

        # 3. Create a Project (The Work)
        # We use admin_user.id as the client_id
        if not db.query(Project).first():
            new_project = Project(
                title="Develop AI Search Engine",
                description="Looking for an intern to integrate Gemini API into TalentLink.",
                budget_min=1000,
                budget_max=5000,
                duration="3 months",
                skills="Python, React, FastAPI",
                client_id=admin_user.id
            )
            db.add(new_project)
            db.commit()
            print("✅ Sample Project posted.")
        else:
            print("ℹ️ Projects already exist in DB.")

        print("\n🚀 Seeding Complete! Run uvicorn and check http://localhost:8000/projects/")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
