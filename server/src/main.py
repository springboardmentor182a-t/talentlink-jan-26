import os
import secrets
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from cachetools import TTLCache
import threading

# 1. Database & Core Imports
from src.database.core import engine, Base, get_db, SessionLocal
import src.entities.user
import src.users.models
import src.projects.models
import src.entities.todo
import src.entities.message
import src.entities.contract

# 2. Router & Logic Imports
from src.auth.controller import router as auth_router
from src.users.router import router as users_router
from src.todos.controller import router as todos_router
from src.projects.router import router as projects_router
from src.messages.controller import router as messages_router
from src.contracts.controller import router as contracts_router
from src.rate_limiter import rate_limit_middleware
from src.exceptions import error_handler_middleware
from src.auth.dependencies import get_current_user
from src.entities.user import User

# --- ENVIRONMENT SETUP ---
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

# Startup guard for security
_WEAK_KEYS = {"", "your-secret-key-change-in-production", "secret", "changeme"}
if SECRET_KEY in _WEAK_KEYS:
    raise RuntimeError("SECRET_KEY is insecure. Set a strong value in .env")

# SMTP guard for production
_APP_ENV = os.getenv("APP_ENV", "")
if _APP_ENV != "development":
    _REQUIRED_SMTP_VARS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "FRONTEND_URL"]
    if any(not os.getenv(v) for v in _REQUIRED_SMTP_VARS):
        raise RuntimeError("Missing SMTP environment variables for production.")

# --- INITIALIZE APP ---
app = FastAPI(title="TalentLink API", version="1.0.0")

# --- MIDDLEWARE ---
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(error_handler_middleware)
app.middleware("http")(rate_limit_middleware)

# --- DATABASE TABLES ---
Base.metadata.create_all(bind=engine)

# --- WEBSOCKET CONNECTION MANAGER ---
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

# --- WS TICKET SYSTEM ---
_WS_TICKET_TTL_SECONDS = 60
_ws_tickets = TTLCache(maxsize=10000, ttl=_WS_TICKET_TTL_SECONDS)
_ws_tickets_lock = threading.Lock()

def _issue_ticket(user_id: int) -> str:
    ticket = secrets.token_urlsafe(32)
    with _ws_tickets_lock:
        _ws_tickets[ticket] = user_id
    return ticket

def _redeem_ticket(ticket: str) -> int | None:
    with _ws_tickets_lock:
        return _ws_tickets.pop(ticket, None)

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {"message": "TalentLink API is running", "status": "online", "version": "1.0.0"}

@app.post("/api/messages/ws-ticket", tags=["Messages"])
async def create_ws_ticket(current_user: User = Depends(get_current_user)):
    ticket = _issue_ticket(current_user.id)
    return {"ticket": ticket, "expires_in": _WS_TICKET_TTL_SECONDS}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, ticket: str = Query(...)):
    ticket_user_id = _redeem_ticket(ticket)
    if ticket_user_id is None or ticket_user_id != user_id:
        await websocket.accept()
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    
    # Notify others of presence
    for other_id in manager.online_user_ids():
        if other_id != user_id:
            await manager.send_to_user(other_id, {"type": "presence", "user_id": user_id, "status": "online"})

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping": await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id, websocket)
        for other_id in manager.online_user_ids():
            await manager.send_to_user(other_id, {"type": "presence", "user_id": user_id, "status": "offline"})

# --- ROUTERS ---
app.include_router(auth_router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(users_router,     prefix="/api/users",     tags=["Users"])
app.include_router(todos_router,     prefix="/api/todos",     tags=["Todos"])
app.include_router(projects_router,  prefix="/api/projects",  tags=["Projects"])
app.include_router(messages_router,  prefix="/api/messages",  tags=["Messages"])
app.include_router(contracts_router, prefix="/api/contracts", tags=["Contracts"])

# --- DATABASE SEEDING ---
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
            db.add(Project(title="Example Project", description="Seeded Project", budget_min=100, budget_max=500, client_id=admin.id))
            db.commit()
    except Exception as e:
        print(f"Seed Error: {e}")
    finally:
        db.close()

seed_database()