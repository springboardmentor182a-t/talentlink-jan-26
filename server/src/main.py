from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.projects.controller import router as projects_router
from src.client_dashboard.controller import router as client_dashboard_router, freelancer_router as freelancer_dashboard_router
from src.database.core import engine, Base

# Create tables if they don't exist (useful for dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from src.auth.controller import router as auth_router

# Include Routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(client_dashboard_router)
app.include_router(freelancer_dashboard_router)

@app.get("/")
def home():
    return {"message": "Backend working ✅", "status": "online"}
