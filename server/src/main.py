import os
import secrets
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# 1. Database & Core Imports
from src.database.core import engine, Base, get_db, SessionLocal
import src.entities.user
import src.users.models
import src.projects.models  # <--- YOUR PROJECT MODELS
import src.entities.todo
import src.entities.message

# 2. Router & Logic Imports
from src.auth.controller import router as auth_router
from src.users.router import router as users_router
from src.todos.controller import router as todos_router
from src.projects.router import router as projects_router # <--- YOUR ROUTER
from src.messages.controller import router as messages_router
from src.rate_limiter import rate_limit_middleware

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# Initialize FastAPI
app = FastAPI(title="TalentLink API", version="1.0.0")

# 3. CORS CONFIGURATION (Dynamic for Team D)
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(rate_limit_middleware)

# 4. ROUTER INCLUSION
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(todos_router, prefix="/api/todos", tags=["Todos"])
app.include_router(projects_router, tags=["Projects"]) # <--- YOUR ENDPOINT
app.include_router(messages_router, prefix="/api/messages", tags=["Messages"])

# 5. TEAM D WEBSOCKET MANAGER (Chat engine)
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id in self.active_connections:
            try: await self.active_connections[user_id].close(code=4000)
            except: pass
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int, websocket: WebSocket):
        if self.active_connections.get(user_id) is websocket:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: int, payload: dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try: await websocket.send_json(payload)
            except: self.active_connections.pop(user_id, None)

    def online_user_ids(self) -> list[int]:
        return list(self.active_connections.keys())

manager = ConnectionManager()

# 6. WEBSOCKET ENDPOINTS (For the Chat feature)
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, ticket: str = Query(...)):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping": await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id, websocket)

# 7. DATABASE STARTUP & YOUR SEEDING LOGIC
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        from src.entities.user import User
        from src.projects.models import Project
        
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(username="admin", email="admin@example.com", hashed_password="hashed_password", role="client")
            db.add(admin); db.commit(); db.refresh(admin)

        if not db.query(Project).first():
            db.add(Project(
                title="Example Freelance Project",
                description="The backend is successfully serving your projects!",
                budget_min=100, budget_max=500, duration="1 month",
                skills="React, FastAPI", client_id=admin.id
            ))
            db.commit()
            print("✅ Database Seeded Successfully!")
    except Exception as e:
        print(f"❌ Seed Error: {e}")
    finally:
        db.close()

seed_database()

@app.get("/")
async def root():
    return {"message": "TalentLink API is running", "status": "online"}