from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# database imports
from database import engine, SessionLocal, Base

# models import
from models import FreelancerProfile as FreelancerProfileModel
from models import ClientProfile as ClientProfileModel

# schemas import
import schemas

# create database tables
Base.metadata.create_all(bind=engine)

# create FastAPI app
app = FastAPI()

# ---------------------------
# CORS Configuration
# allows React frontend to connect
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Test Route
# ---------------------------
@app.get("/")
def home():
    return {"message": "TalentLink Backend Running Successfully"}


# ---------------------------
# Save Client Profile
# ---------------------------
@app.post("/client-profile")
def save_client_profile(profile: schemas.ClientProfileCreate):

    db = SessionLocal()

    new_client = ClientProfileModel(
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

    return {
        "message": "Client Profile Saved in Database Successfully"
    }


# ---------------------------
# Save Freelancer Profile
# ---------------------------
@app.post("/freelancer-profile")
def save_freelancer_profile(profile: schemas.FreelancerProfileCreate):

    db = SessionLocal()

    new_profile = FreelancerProfileModel(
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

    return {
        "message": "Freelancer Profile Saved in Database Successfully"
    }


# ---------------------------
# Get All Freelancers
# ---------------------------
@app.get("/freelancers")
def get_freelancers():

    db = SessionLocal()

    freelancers = db.query(FreelancerProfileModel).all()

    db.close()

    return freelancers


# ---------------------------
# Get All Clients
# ---------------------------
@app.get("/clients")
def get_clients():

    db = SessionLocal()

    clients = db.query(ClientProfileModel).all()

    db.close()

    return clients