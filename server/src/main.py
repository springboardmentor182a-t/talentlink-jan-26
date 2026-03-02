from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database.core import Base, engine
from src.proposals.controller import router as proposals_router

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TalentLink Proposals API",
    description="Proposal management endpoints for TalentLink",
    version="1.0.0"
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────
app.include_router(proposals_router, prefix="/proposals", tags=["Proposals"])

@app.get("/")
def root():
    return {"message": "TalentLink Proposals API is running ✅"}
