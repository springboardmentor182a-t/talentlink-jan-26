from fastapi import FastAPI
from src.database.core import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Import all entities to ensure they are registered with Base metadata
from src.entities.user import User
from src.entities.job import Job
from src.entities.proposal import Proposal
from src.auth.controller import router as auth_router
from src.jobs.controller import router as jobs_router
from src.proposals.controller import router as proposals_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(proposals_router)
