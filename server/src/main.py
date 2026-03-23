from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from src.database.core import Base, engine

# Import all entities to ensure they are registered with Base metadata
from src.entities.user import User
from src.entities.job import Job
from src.entities.proposal import Proposal
from src.entities.freelancer_profile import FreelancerProfile
from src.entities.message import Message
from src.entities.contract import Contract, Milestone

from src.auth.controller import router as auth_router
from src.jobs.controller import router as jobs_router
from src.users.router import router as users_router
from src.client_dashboard.router import router as client_dashboard_router
from src.proposals.controller import router as proposals_router
from src.messages.router import router as messages_router
from src.projects.controller import router as projects_router

load_dotenv()

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TalentLink API",
    description="Authentication and Proposal management endpoints for TalentLink",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(client_dashboard_router)
app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(proposals_router, prefix="/proposals", tags=["Proposals"])
app.include_router(messages_router)
app.include_router(projects_router)

@app.get("/")
def root():
    return {"message": "TalentLink API is running ✅"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from src.database.core import Base, engine
from src.users.router import router as users_router
from src.auth.controller import router as auth_router
from src.client_dashboard.router import router as client_dashboard_router
from src.proposals.controller import router as proposals_router
from src.projects.controller import router as projects_router
from src.messages.controller import router as messages_router
from src.entities.contract import Contract, Milestone
from src.reviews.model import Review

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,             prefix="/auth",      tags=["Auth"])
app.include_router(client_dashboard_router)
app.include_router(users_router)
app.include_router(proposals_router,        prefix="/proposals", tags=["Proposals"])
app.include_router(projects_router,         prefix="/projects",  tags=["Projects"])
app.include_router(messages_router,         prefix="/messages",  tags=["Messages"])

@app.get("/")
def root():
    return {"message": "TalentLink API is running ✅"}
