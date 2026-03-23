from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from src.database.core import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Import all entities to ensure they are registered with Base metadata
from src.entities.user import User
from src.entities.job import Job
from src.entities.proposal import Proposal
from src.entities.freelancer_profile import FreelancerProfile
from src.entities.message import Message

from src.auth.controller import router as auth_router
from src.jobs.controller import router as jobs_router
from src.users.router import router as users_router
from src.client_dashboard.router import router as client_dashboard_router
from src.proposals.controller import router as proposals_router
from src.messages.router import router as messages_router

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

# Include routers
app.include_router(auth_router)
app.include_router(client_dashboard_router)
app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(proposals_router, prefix="/proposals", tags=["Proposals"])
app.include_router(messages_router)

@app.get("/")
def root():
    return {"message": "TalentLink API is running ✅"}
