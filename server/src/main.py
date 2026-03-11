from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD

from src.database.core import Base, engine
from src.users.router import router as users_router
from src.auth.controller import router as auth_router
from src.client_dashboard.router import router as client_dashboard_router
from src.entities.contract import Contract, Milestone
from src.entities.proposal import Proposal

# Create database tables
=======
from src.database.core import Base, engine
from src.auth.controller import router as auth_router

# Create all database tables
>>>>>>> 96fdd50c0c4203c8bc7f97de3ab54771f58165f7
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TalentLink Auth API",
    description="Authentication endpoints for TalentLink",
    version="1.0.0"
)

<<<<<<< HEAD
import os
from dotenv import load_dotenv

load_dotenv()

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_ORIGIN", "http://localhost:3000")],
=======
# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
>>>>>>> 96fdd50c0c4203c8bc7f97de3ab54771f58165f7
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# Include routers
app.include_router(auth_router)
app.include_router(client_dashboard_router)
app.include_router(users_router)

@app.get("/")
def home():
    return {"message": "Backend working ✅"}
=======
# ── Routers ──────────────────────────────────
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"message": "TalentLink Auth API is running ✅"}
>>>>>>> 96fdd50c0c4203c8bc7f97de3ab54771f58165f7
