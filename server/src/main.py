from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="TalentLink API", version="0.1.0")

# --- SECURITY: The "Universal Pass" for your Frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS: This creates the structure seen in your screenshot ---
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

# --- ENDPOINTS ---
from fastapi import Depends
from sqlalchemy.orm import Session
from .database.core import get_db
from .proposals import models

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

@app.get("/")
async def root():
    return {"status": "TalentLink API is Live", "docs": "/docs"}

class Proposal(BaseModel):
    project_id: int
    cover_letter: str
    bid_amount: float

# 2. Create the "Gate" to receive the /proposals/ data
@app.post("/proposals/")
async def create_proposal(proposal: Proposal):
    print(f"Proposal received for Project ID: {proposal.project_id}")
    return {"status": "success", "message": "Proposal saved!"}

    