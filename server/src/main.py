from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from src.database.core import Base, engine
from src.users.router import router as users_router
from src.auth.controller import router as auth_router
from src.client_dashboard.router import router as client_dashboard_router
from src.proposals.controller import router as proposals_router
from src.projects.controller import router as projects_router
from src.messages.controller import router as messages_router
from src.notifications.controller import router as notifications_router
from src.entities.contract import Contract, Milestone
from src.reviews.model import Review
from src.notifications.model import Notification
from src.ai.router import router as ai_router

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,              prefix="/auth",          tags=["Auth"])
app.include_router(client_dashboard_router)
app.include_router(users_router)
app.include_router(proposals_router,         prefix="/proposals",     tags=["Proposals"])
app.include_router(projects_router,          prefix="/projects",      tags=["Projects"])
app.include_router(messages_router,          prefix="/messages",      tags=["Messages"])
app.include_router(notifications_router,     prefix="/notifications", tags=["Notifications"])
app.include_router(ai_router)

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

static_dir = "/app/static"
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(static_dir, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "TalentLink API is running ✅"}
