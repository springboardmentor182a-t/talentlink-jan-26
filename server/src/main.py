from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.projects.controller import router as projects_router
from src.client_dashboard.controller import router as client_dashboard_router
from src.database.core import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API", version="1.0.0")

# CORS CONFIG
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTERS
app.include_router(projects_router)
app.include_router(client_dashboard_router)

# HOME ROUTE
@app.get("/")
def home():
    return {"message": "TalentLink API Running", "status": "online"}