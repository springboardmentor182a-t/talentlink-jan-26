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

@app.get("/dashboard/", response_model=DashboardResponse)
async def get_dashboard():
    return {
        "welcome_msg": "Welcome back, John! 👋",
        "stats": {
            "active_projects": 3,
            "pending_proposals": 12,
            "total_earnings": "$4.5k",
            "profile_views": 247
        },
        "active_contract": {
            "title": "Website Redesign",
            "due": "5 days",
            "progress": 75
        },
        "recommended_projects": [
            { "id": 1, "title": "Mobile App Development", "client": "TechStart Inc.", "budget": "$3,000 - $6,000", "match": "95%" },
            { "id": 2, "title": "E-Commerce Website", "client": "Shopify Experts", "budget": "$1,500 - $2,500", "match": "88%" },
            { "id": 3, "title": "Corporate Logo Design", "client": "Bright Future Ltd.", "budget": "$500 - $1,200", "match": "92%" },
            { "id": 4, "title": "React Frontend Fixes", "client": "WebSolutions Co.", "budget": "$40 - $60 / hr", "match": "85%" },
            { "id": 5, "title": "Python API Optimization", "client": "DataFlow Systems", "budget": "$2,000 fixed", "match": "90%" },
            { "id": 6, "title": "UI/UX Design for Travel App", "client": "Wanderlust Inc.", "budget": "$4,000 - $5,000", "match": "80%" }
        ]
    }

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

    