import os
from pathlib import Path
import secrets

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError

from src.database.core import engine, Base

# Import all entity modules so Base.metadata.create_all picks up every table.
import src.entities.user     # noqa: F401
import src.entities.todo     # noqa: F401
import src.entities.message  # noqa: F401
import src.users.models      # noqa: F401

from src.rate_limiter import rate_limit_middleware
from src.exceptions import error_handler_middleware
from src.auth.controller import router as auth_router
from src.users.router import router as users_router
from src.todos.controller import router as todos_router
from src.messages.controller import router as messages_router

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

# ── Startup guard — also enforced in auth/service.py but repeated here so
#    the WS endpoint (which duplicates JWT decode logic) is also protected.
_WEAK_KEYS = {"", "your-secret-key-change-in-production", "secret", "changeme"}
if SECRET_KEY in _WEAK_KEYS:
    raise RuntimeError(
        "SECRET_KEY is not set or is using the insecure default. "
        "Set a strong random value in your .env file:\n"
        "  python -c \"import secrets; print(secrets.token_hex(32))\""
    )

Base.metadata.create_all(bind=engine)

# ── SMTP startup guard ────────────────────────────────────────────────────────
# In production/staging the password reset flow sends real emails.
# If the SMTP env vars are missing the reset flow silently swallows the error
# (by design — to prevent email enumeration), but the feature is completely
# broken. Fail loudly on startup instead so the misconfiguration is caught
# during deployment, not during a user's password reset attempt at 2am.
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
# Origins are driven by env var so staging/production never need a code change.
# Set ALLOWED_ORIGINS as a comma-separated list in your .env:
#   ALLOWED_ORIGINS=https://app.talentlink.com,https://staging.talentlink.com
#
# IMPORTANT: WebSocket upgrade requests bypass CORSMiddleware entirely.
# WS auth is handled by token validation inside the endpoint itself.
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
app.middleware("http")(error_handler_middleware)

app.include_router(auth_router,     prefix="/api/auth",     tags=["Authentication"])
app.include_router(users_router,    prefix="/api/users",    tags=["Users"])
app.include_router(todos_router,    prefix="/api/todos",    tags=["Todos"])
app.include_router(messages_router, prefix="/api/messages", tags=["Messages"])


# ── WebSocket Connection Manager ──────────────────────────────────────────────
# Keyed by user_id (int) → WebSocket instance.
# One connection per user — second tab replaces first gracefully.
#
# ⚠️ MULTI-WORKER LIMITATION: This in-memory dict only works with a single
# uvicorn worker (--workers 1). With multiple workers each process has its own
# dict, so cross-worker broadcasts silently fail. Fix before scaling:
# replace with a Redis pub/sub backend (e.g. via broadcaster or fastapi-socketio).
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()

        # Gracefully close an existing socket (second-tab scenario) before
        # replacing the reference so we don't leak connection objects.
        if user_id in self.active_connections:
            old_ws = self.active_connections[user_id]
            try:
                await old_ws.close(code=4000)
            except Exception:
                pass  # already dead — that's fine

        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int, websocket: WebSocket):
        # Only remove if it's still THIS socket — a second tab may have already
        # replaced the reference before the first tab's disconnect fires.
        if self.active_connections.get(user_id) is websocket:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: int, payload: dict):
        """Push a JSON payload to a specific user. Silent no-op if offline."""
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(payload)
            except Exception:
                # Socket died between the lookup and the send — remove stale entry.
                self.active_connections.pop(user_id, None)

    def is_online(self, user_id: int) -> bool:
        return user_id in self.active_connections

    def online_user_ids(self) -> list[int]:
        return list(self.active_connections.keys())


# Singleton shared across the whole app lifetime (single-worker only — see above).
manager = ConnectionManager()


# ── WS Ticket Store ───────────────────────────────────────────────────────────
# Short-lived, single-use tokens that let the frontend connect to the WebSocket
# without putting the JWT in the URL (which gets logged by every proxy).
#
# Flow:
#   1. Client calls POST /api/messages/ws-ticket (authenticated via Bearer header)
#   2. Server stores a random ticket → user_id mapping with a 60-second TTL
#   3. Client connects: ws://host/ws/{user_id}?ticket=<uuid>
#   4. WS endpoint redeems the ticket (one-time use) and discards it
#
# MUST FIX (applied): was a plain dict — no size cap, so a bot hammering the
# ticket endpoint between expiry cycles could grow it unboundedly.
# TTLCache auto-expires entries after _WS_TICKET_TTL_SECONDS and caps total
# entries at 10_000 (~1 MB). The manual pruning loop in _issue_ticket is no
# longer needed and has been removed.
#
# NOTE: for new WebSocket routes — ALWAYS use this ticket system.
# Do NOT put JWT tokens in WS URLs. See auth/dependencies.py for explanation.
_WS_TICKET_TTL_SECONDS = 60

from cachetools import TTLCache as _TTLCache  # noqa: E402 — after constants

# TTLCache handles expiry and size-capping automatically.
# Values are plain user_id integers — no wrapper class needed.
_ws_tickets: _TTLCache = _TTLCache(maxsize=10_000, ttl=_WS_TICKET_TTL_SECONDS)
_ws_tickets_lock = __import__("threading").Lock()


def _issue_ticket(user_id: int) -> str:
    ticket = secrets.token_urlsafe(32)
    with _ws_tickets_lock:
        _ws_tickets[ticket] = user_id
    return ticket


def _redeem_ticket(ticket: str) -> int | None:
    """Consume a ticket and return its user_id, or None if invalid/expired.

    TTLCache enforces the TTL — an entry that is present has not yet expired.
    pop() is atomic under the lock, so a ticket cannot be redeemed twice even
    under concurrent requests.
    """
    with _ws_tickets_lock:
        return _ws_tickets.pop(ticket, None)


# ── WS Ticket Endpoint ────────────────────────────────────────────────────────
# Placed on app directly (not behind /api/messages prefix) for discoverability,
# but uses the same auth dependency as every other protected endpoint.
from src.auth.dependencies import get_current_user  # noqa: E402 — after app created
from src.database.core import get_db                # noqa: E402
from fastapi import Depends                         # noqa: E402
from sqlalchemy.orm import Session                  # noqa: E402
from src.entities.user import User                  # noqa: E402


@app.post("/api/messages/ws-ticket", tags=["Messages"])
async def create_ws_ticket(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Issue a short-lived one-time ticket for WebSocket authentication.

    The client exchanges this ticket for a WS connection immediately.
    Tickets expire after 60 seconds and are invalidated on first use,
    so they cannot be replayed even if intercepted.
    """
    ticket = _issue_ticket(current_user.id)  # type: ignore[arg-type]
    return {"ticket": ticket, "expires_in": _WS_TICKET_TTL_SECONDS}


# ── WebSocket Endpoint ────────────────────────────────────────────────────────
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    ticket: str = Query(...),   # ?ticket=<one-time-token> — NOT the JWT
):
    """Authenticate via one-time ticket → register → broadcast presence → hold → cleanup.

    Auth must happen before websocket.accept(). Close code 4001 = unauthorized.
    """
    # Step 1: Redeem the ticket. If invalid or expired, reject before accepting.
    ticket_user_id = _redeem_ticket(ticket)
    if ticket_user_id is None or ticket_user_id != user_id:
        # MUST FIX (applied): ASGI spec requires accept() before close() for the
        # close code to be transmitted. Without accept() first, Chrome/Firefox
        # deliver close code 1006 (abnormal closure) instead of 4001.
        # The frontend's onclose handler branches on 4001 to trigger the polling
        # fallback — receiving 1006 instead causes it to enter the exponential
        # backoff reconnect loop, hammering the server with doomed reconnects.
        await websocket.accept()
        await websocket.close(code=4001)
        return

    # Step 2: Accept and register the connection.
    await manager.connect(user_id, websocket)

    # Step 3: Broadcast online presence to every other connected user.
    for other_id in manager.online_user_ids():
        if other_id != user_id:
            await manager.send_to_user(other_id, {
                "type":    "presence",
                "user_id": user_id,
                "status":  "online",
            })

    # Step 4: Send the current online snapshot to the newly connected user.
    await manager.send_to_user(user_id, {
        "type":     "online_users",
        "user_ids": [uid for uid in manager.online_user_ids() if uid != user_id],
    })

    # Step 5: Hold the connection open. Receive optional pings from the client
    # (keeps the socket alive through proxy idle timeouts).
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        # Step 6: Clean up and broadcast offline presence.
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
