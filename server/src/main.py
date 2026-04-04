from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from src.projects.controller import router as projects_router
from src.client_dashboard.controller import router as client_dashboard_router

from .database import engine, Base, SessionLocal
from .models import FreelancerProfile, ClientProfile
from . import schemas

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers
app.include_router(projects_router)
app.include_router(client_dashboard_router)


# ---------------------------
# Test Route
# ---------------------------
@app.get("/")
def home():
    return {"message": "Backend working ✅", "status": "online"}


# ---------------------------
# Save Client Profile
# ---------------------------
@app.post("/client-profile")
def save_client_profile(profile: schemas.ClientProfileCreate):
    db = SessionLocal()

    new_client = ClientProfile(
        companyName=profile.companyName,
        about=profile.about,
        location=profile.location,
        website=profile.website,
        industry=profile.industry
    )

    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    db.close()

    return {"message": "Client Profile Saved"}


# ---------------------------
# Save Freelancer Profile
# ---------------------------
@app.post("/freelancer-profile")
def save_freelancer_profile(profile: schemas.FreelancerProfileCreate):
    db = SessionLocal()

    new_profile = FreelancerProfile(
        fullName=profile.fullName,
        skills=profile.skills,
        hourlyRate=profile.hourlyRate,
        experience=profile.experience,
        location=profile.location,
        availability=profile.availability
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    db.close()

    return {"message": "Freelancer Profile Saved"}


# ---------------------------
# Get Freelancers
# ---------------------------
@app.get("/freelancers")
def get_freelancers():
    db = SessionLocal()
    data = db.query(FreelancerProfile).all()
    db.close()
    return data


# ---------------------------
# Get Clients
# ---------------------------
@app.get("/clients")
def get_clients():
    db = SessionLocal()
    data = db.query(ClientProfile).all()
    db.close()
    return data