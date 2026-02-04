from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.core import engine
from .proposals import models
from .proposals.router import router as proposals_router

# This creates the database file and tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API")

# Security: Allows React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(proposals_router)

@app.get("/")
def root():
    return {"message": "Success! The Backend is finally running."}