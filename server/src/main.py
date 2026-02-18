from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database.core import Base, engine
from src.auth.controller import router as auth_router
from src.client_dashboard.router import router as client_dashboard_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(client_dashboard_router)

@app.get("/")
def home():
    return {"message": "Backend working ✅"}
