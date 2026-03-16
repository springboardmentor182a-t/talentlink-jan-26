from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging

# 1. Database & Core Imports
from src.database.core import engine, Base, get_db, SessionLocal

# 2. MODEL IMPORTS (Essential for Base.metadata.create_all)
import src.entities.user    # Contains the User model
import src.users.models     # Contains Client/Freelancer profiles
import src.projects.models  # Contains Project model
import src.entities.todo

# 3. Middleware & Routers
from src.rate_limiter import rate_limit_middleware
from src.auth.controller import router as auth_router
from src.users.router import router as users_router
from src.todos.controller import router as todos_router
from src.projects.router import router as projects_router

# Initialize FastAPI
app = FastAPI(title="TalentLink API", version="1.0.0")

# --- CORS CONFIGURATION ---
origins = [
    "http://localhost:5173", 
    "http://localhost:3000",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MIDDLEWARE ---
app.middleware("http")(rate_limit_middleware)

# --- ROUTER INCLUSION ---
app.include_router(auth_router, prefix="/api/auth")
app.include_router(users_router, prefix="/api/users")
app.include_router(todos_router, prefix="/api/todos")
app.include_router(projects_router) 

# --- DATABASE STARTUP ---

# Create tables immediately
Base.metadata.create_all(bind=engine)

def seed_database():
    """Ensures a user exists so projects don't fail Foreign Key constraints."""
    db = SessionLocal()
    try:
        # CORRECTED IMPORTS BASED ON YOUR FILE STRUCTURE
        from src.entities.user import User
        from src.projects.models import Project
        
        # 1. Check for Admin User (Identity)
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin", 
                email="admin@example.com", 
                hashed_password="admin_password_hash",
                role="client"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✅ Successfully created default admin user.")

        # 2. Check for at least one project (to help testing frontend)
        if not db.query(Project).first():
            test_project = Project(
                title="Example Freelance Project",
                description="This is a test project to verify the frontend is working.",
                budget_min=100,
                budget_max=500,
                duration="1 month",
                skills="React, FastAPI",
                client_id=admin.id
            )
            db.add(test_project)
            db.commit()
            print("✅ Successfully seeded a test project.")
            
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

# Run the seed
seed_database()

@app.get("/")
async def root():
    return {"message": "TalentLink API is running", "status": "online"}