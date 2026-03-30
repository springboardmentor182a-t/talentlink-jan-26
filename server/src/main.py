from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from src.users import controller as users_controller
from src.messages import controller as messages_controller

from src.database import core as db_core

load_dotenv()

app = FastAPI()

# Load configuration from environment
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")


@app.on_event("startup")
def startup():
    # Initialize database tables
    db_core.init_db()


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_controller.router, prefix="/users", tags=["Users"])
app.include_router(messages_controller.router, prefix="/messages", tags=["Messages"])

@app.get("/")
def home():
    return {"message": "Backend working ✅"}