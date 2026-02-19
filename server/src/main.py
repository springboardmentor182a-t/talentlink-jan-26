from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

# --- DB & Core Imports (From main-group-D) ---
from src.database.core import engine, Base, get_db
import src.entities.user  # noqa: F401 - registers User table
import src.entities.todo  # noqa: F401 - registers Todo table
import src.users.models   # noqa: F401 - registers FreelancerProfile, ClientProfile tables

# --- Middlewares & Routers (From main-group-D) ---
from src.rate_limiter import rate_limit_middleware
from src.exceptions import error_handler_middleware
from src.auth.controller import router as auth_router
from src.users.router import router as users_router
from src.todos.controller import router as todos_router

# --- Your Imports ---
from .proposals import models

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API", version="1.0.0")

# --- SECURITY: CORS (From main-group-D) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # fallback / CRA
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Middlewares (From main-group-D) ---
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(error_handler_middleware)

# --- Routers (From main-group-D) ---
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(todos_router, prefix="/api/todos", tags=["Todos"])


# ==========================================================
# --- MODELS: Dashboard & Proposals (From your branch) ---
# ==========================================================

class StatData(BaseModel):
    active_projects: int
    pending_proposals: int
    total_earnings: str
    profile_views: int

class Project(BaseModel):
    id: int
    title: str
    client: str
    budget: str
    match: str

class Contract(BaseModel):
    title: str
    due: str
    progress: int

class DashboardResponse(BaseModel):
    welcome_msg: str
    stats: StatData
    active_contract: Contract
    recommended_projects: List[Project]

class Proposal(BaseModel):
    project_id: int
    cover_letter: str
    bid_amount: float


# ==========================================================
# --- ENDPOINTS: Dashboard (From your branch) ---
# ==========================================================

@app.get("/dashboard/")
def get_dashboard(db: Session = Depends(get_db)):
    # Pulls real data from the database
    recommended_projects = db.query(models.Project).limit(6).all()
    active_contract = db.query(models.Contract).filter(models.Contract.status == "Active").first()
    
    return {
        "welcome_msg": "Welcome back, John! 👋",
        "stats": {
            "active_projects": db.query(models.Project).count(),
            "pending_proposals": 12,
            "total_earnings": "$4.5k",
            "profile_views": 247
        },
        "active_contract": active_contract or {"title": "No active contracts", "progress": 0},
        "recommended_projects": recommended_projects
    }

@app.get("/projects/")
def get_all_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

@app.get("/contracts/")
def get_all_contracts(db: Session = Depends(get_db)):
    return db.query(models.Contract).all()

@app.post("/proposals/")
async def create_proposal(proposal: Proposal):
    print(f"Proposal received for Project ID: {proposal.project_id}")
    return {"status": "success", "message": "Proposal saved!"}

# --- ROOT ENDPOINT (Combined) ---
@app.get("/")
async def root():
    return {"message": "TalentLink API is Live", "version": "1.0.0", "docs": "/docs"}