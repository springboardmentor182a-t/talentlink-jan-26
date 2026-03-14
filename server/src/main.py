from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.database.core import engine, Base, SessionLocal
from src.entities.project import Project
import src.entities

app = FastAPI()

Base.metadata.create_all(bind=engine)

# -----------------------------
# CORS CONFIG
# -----------------------------
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

# -----------------------------
# HOME ROUTE
# -----------------------------
@app.get("/")
def home():
    return {"message": "TalentLink API Running"}


# -----------------------------
# PROJECTS ROUTE (DATABASE + SEARCH)
# -----------------------------
@app.get("/projects")
def get_projects(search: str = Query(default="")):

    db = SessionLocal()

    query = db.query(Project)

    if search:
        query = query.filter(Project.title.ilike(f"%{search}%"))

    projects = query.all()

    result = []

    for p in projects:
        result.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "budget": p.budget,
            "duration": p.duration,
            "skills_required": p.skills_required,
            "status": p.status
        })

    db.close()

    return result


# -----------------------------
# APPLY TO PROJECT
# -----------------------------
class Application(BaseModel):
    project_id: int
    freelancer_id: int


@app.post("/apply")
def apply_project(application: Application):

    print("Freelancer", application.freelancer_id, "applied to project", application.project_id)

    return {
        "message": "Application submitted successfully"
    }
from pydantic import BaseModel

# -----------------------------
# APPLY REQUEST MODEL
# -----------------------------
class ApplyRequest(BaseModel):
    project_id: int
    freelancer_id: int


# -----------------------------
# APPLY ROUTE
# -----------------------------
@app.post("/apply")
def apply_project(data: ApplyRequest):

    print(f"Freelancer {data.freelancer_id} applied to project {data.project_id}")

    return {
        "message": "Application submitted successfully"
    }
