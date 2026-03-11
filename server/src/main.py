from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database.core import Base, engine
from src.users.router import router as users_router
from src.auth.controller import router as auth_router
from src.client_dashboard.router import router as client_dashboard_router
from src.entities.contract import Contract, Milestone
from src.entities.proposal import Proposal

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

import os
from dotenv import load_dotenv

load_dotenv()

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

@app.get("/")
def home():
    return {"message": "Backend working ✅"}
