import os
import secrets
from pathlib import Path

from cachetools import TTLCache as _TTLCache
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from src.database.core import engine, Base, get_db, SessionLocal

# ── Entity registration — all tables picked up by Base.metadata.create_all ───
import src.entities.user      # noqa: F401
import src.entities.todo      # noqa: F401
import src.entities.message   # noqa: F401
import src.entities.contract  # noqa: F401
import src.users.models       # noqa: F401
import src.entities.project   # noqa: F401 - Preserved from our architectural refactor

from src.rate_limiter import rate_limit_middleware
from src.exceptions import error_handler_middleware
from src.auth.controller import router as auth_router
from src.users.router import router as users_router
from src.todos.controller import router as todos_router
from src.messages.controller import router as messages_router
from src.contracts.controller import router as contracts_router
from src.projects.router import router as projects_router

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

# ── Startup guard ─────────────────────────────────────────────────────────────
_WEAK_KEYS = {"", "your-secret-key-change-in-production", "secret", "changeme"}
if SECRET_KEY in _WEAK_KEYS:
    raise RuntimeError(
        "SECRET_KEY is not set or is using the insecure default. "
        "Set a strong random value in your .env file:\n"
        "  python -c \"import secrets; print(secrets.token_hex(32))\""
    )

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

# ── SMTP startup guard ────────────────────────────────────────────────────────
_APP_ENV = os.getenv("APP_ENV", "")
if _APP_ENV != "development":
    _REQUIRED_SMTP_VARS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "FRONTEND_URL"]
    _missing_smtp = [v for v in _REQUIRED_SMTP_VARS if not os.getenv(v)]
    if _missing_smtp:
        raise RuntimeError(
            f"Missing required SMTP environment variables: {', '.join(_missing_smtp)}. "
            "Password reset emails cannot be sent. "
            "Add them to your .env file or set APP_ENV=development to suppress this check. "
            "See README — SMTP Configuration."
        )

app = FastAPI(title="TalentLink API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
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

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(users_router,     prefix="/api/users",     tags=["Users"])
app.include_router(todos_router,     prefix="/api/todos",     tags=["Todos"])
app.include_router(messages_router,  prefix="/api/messages",  tags=["Messages"])
app.include_router(contracts_router, prefix="/api/contracts", tags=["Contracts"])
app.include_router(projects_router,  prefix="/api/projects",  tags=["Projects"])


# ── WebSocket Connection Manager ──────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id in self.active_connections:
            old_ws = self.active_connections[user_id]
            try:
                await old_ws.close(code=4000)
            except Exception:
                pass
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int, websocket: WebSocket):
        if self.active_connections.get(user_id) is websocket:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: int, payload: dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(payload)
            except Exception:
                self.active_connections.pop(user_id, None)

    def is_online(self, user_id: int) -> bool:
        return user_id in self.active_connections

    def online_user_ids(self) -> list[int]:
        return list(self.active_connections.keys())


manager = ConnectionManager()


# ── WS Ticket Store ───────────────────────────────────────────────────────────
_WS_TICKET_TTL_SECONDS = 60
_ws_tickets: _TTLCache = _TTLCache(maxsize=10_000, ttl=_WS_TICKET_TTL_SECONDS)
_ws_tickets_lock = __import__("threading").Lock()


def _issue_ticket(user_id: int) -> str:
    ticket = secrets.token_urlsafe(32)
    with _ws_tickets_lock:
        _ws_tickets[ticket] = user_id
    return ticket


def _redeem_ticket(ticket: str) -> int | None:
    with _ws_tickets_lock:
        return _ws_tickets.pop(ticket, None)


# ── WS Ticket Endpoint ────────────────────────────────────────────────────────
from src.auth.dependencies import get_current_user  # noqa: E402
from fastapi import Depends                         # noqa: E402
from src.entities.user import User                  # noqa: E402


@app.post("/api/messages/ws-ticket", tags=["Messages"])
async def create_ws_ticket(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = _issue_ticket(current_user.id)  # type: ignore[arg-type]
    return {"ticket": ticket, "expires_in": _WS_TICKET_TTL_SECONDS}


# ── WebSocket Endpoint ────────────────────────────────────────────────────────
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    ticket: str = Query(...),
):
    ticket_user_id = _redeem_ticket(ticket)
    if ticket_user_id is None or ticket_user_id != user_id:
        await websocket.accept()
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)

    for other_id in manager.online_user_ids():
        if other_id != user_id:
            await manager.send_to_user(other_id, {
                "type":    "presence",
                "user_id": user_id,
                "status":  "online",
            })

    await manager.send_to_user(user_id, {
        "type":     "online_users",
        "user_ids": [uid for uid in manager.online_user_ids() if uid != user_id],
    })

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    except RuntimeError:
        pass
    finally:
        manager.disconnect(user_id, websocket)
        for other_id in manager.online_user_ids():
            await manager.send_to_user(other_id, {
                "type":    "presence",
                "user_id": user_id,
                "status":  "offline",
            })


@app.get("/")
async def root():
    return {"message": "TalentLink API", "version": "1.0.0"}