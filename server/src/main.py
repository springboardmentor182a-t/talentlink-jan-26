from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.users import controller as users_controller
from src.messages import controller as messages_controller

from src.database import core as db_core
from src.users import models as user_models

app = FastAPI()


@app.on_event("startup")
def startup():
    # create database tables and optionally seed a couple of users for testing
    db_core.init_db()
    db = db_core.SessionLocal()
    try:
        if db.query(user_models.User).count() == 0:
            # create two example accounts (passwords are plain text for demo only)
            db.add_all([
                user_models.User(email="bob@example.com", hashed_password="secret", role="freelancer"),
                user_models.User(email="alice@example.com", hashed_password="secret", role="client"),
            ])
            db.commit()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_controller.router, prefix="/users", tags=["Users"])
app.include_router(messages_controller.router, prefix="/messages", tags=["Messages"])

@app.get("/")
def home():
    return {"message": "Backend working ✅"}
