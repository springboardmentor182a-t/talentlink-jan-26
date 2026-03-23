# server/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database.core import Base, get_db

# ── Isolated test database ────────────────────────────────────────────────────
# SQLite is used for speed and zero-dependency CI. Two caveats:
#   1. group_by("label") behaves differently in SQLite vs PostgreSQL — if the
#      conversations-list test passes here but fails on staging Postgres, that
#      is the cause. Fix: use column expressions instead of string labels.
#   2. DateTime(timezone=True) columns lose tz info in SQLite — UTC comparisons
#      in tests may need .replace(tzinfo=None) adjustments.
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Fresh DB session per test. Creates all tables before, drops after."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """FastAPI TestClient with DB dependency overridden."""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ── Auth helpers ───────────────────────────────────────────────────────────────

REGISTER_PAYLOAD = {
    "email": "alice@example.com",
    "username": "alice",
    "password": "securepass123",
    "role": "freelancer",
}

REGISTER_PAYLOAD_B = {
    "email": "bob@example.com",
    "username": "bob",
    "password": "securepass456",
    "role": "client",
}


@pytest.fixture
def registered_user(client):
    """Register a user and return the response JSON."""
    resp = client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest.fixture
def auth_token(client, registered_user):
    """Log in as the registered user and return the Bearer token."""
    resp = client.post("/api/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": REGISTER_PAYLOAD["password"],
    })
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Authorization header dict ready to pass to client requests."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def two_users(client):
    """
    Register two users (alice and bob) and return both auth header dicts.
    Used by message tests that need a sender and a receiver.
    """
    resp_a = client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    assert resp_a.status_code == 201
    resp_b = client.post("/api/auth/register", json=REGISTER_PAYLOAD_B)
    assert resp_b.status_code == 201

    token_a = client.post("/api/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": REGISTER_PAYLOAD["password"],
    }).json()["access_token"]

    token_b = client.post("/api/auth/login", json={
        "email": REGISTER_PAYLOAD_B["email"],
        "password": REGISTER_PAYLOAD_B["password"],
    }).json()["access_token"]

    alice_id = resp_a.json()["user"]["id"]
    bob_id   = resp_b.json()["user"]["id"]

    return {
        "alice": {"headers": {"Authorization": f"Bearer {token_a}"}, "id": alice_id},
        "bob":   {"headers": {"Authorization": f"Bearer {token_b}"}, "id": bob_id},
    }
# ── Rate limiter reset ────────────────────────────────────────────────────────
# The rate limiter TTLCache is module-level and persists across the entire test
# process. Without this fixture, requests made in earlier test classes burn
# through the 100-request limit before the rate limiter tests even run.
@pytest.fixture(autouse=True)
def reset_rate_limiter():
    from src.rate_limiter import _cache, _lock
    with _lock:
        _cache.clear()
    yield
    with _lock:
        _cache.clear()