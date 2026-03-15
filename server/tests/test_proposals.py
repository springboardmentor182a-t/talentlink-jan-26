import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database.core import Base, get_db
from src.users.models import FreelancerProfile
from src.entities.user import User
from src.users.service import pwd_context

# --- Setup Test Database ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_talentlink.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# --- Fixtures ---
@pytest.fixture(autouse=True)
def setup_db():
    """Create fresh database tables for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def mock_user_and_profile():
    """Create a user and associated freelancer profile for testing."""
    db = TestingSessionLocal()
    
    # Create user
    user = User(
        email="testfreelancer@example.com",
        username="testfreelancer",
        hashed_password="hashed_password123",
        role="freelancer"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create profile
    profile = FreelancerProfile(
        user_id=user.id,
        bio="I am a test freelancer",
        skills="Testing, Python",
        hourly_rate=25.0
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    user_id = user.id
    db.close()
    return user_id

# --- Tests ---

def test_create_valid_proposal(mock_user_and_profile):
    """Test successful proposal creation."""
    user_id = mock_user_and_profile
    payload = {
        "project_id": 1,
        "cover_letter": "This is a strictly valid cover letter that is long enough.",
        "bid_amount": 500.0,
        "estimated_days": 10
    }
    
    response = client.post(f"/api/users/{user_id}/proposals", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == 1
    assert data["freelancer_id"] is not None
    assert data["status"] == "pending"

def test_prevent_duplicate_proposals(mock_user_and_profile):
    """Test that a freelancer cannot apply twice to the same project."""
    user_id = mock_user_and_profile
    payload = {
        "project_id": 2,
        "cover_letter": "This is a strictly valid cover letter that is long enough.",
        "bid_amount": 500.0,
        "estimated_days": 10
    }
    
    # First submission should succeed
    client.post(f"/api/users/{user_id}/proposals", json=payload)
    
    # Second submission should fail with 400
    response = client.post(f"/api/users/{user_id}/proposals", json=payload)
    assert response.status_code == 400
    assert "already submitted" in response.json()["detail"]

def test_pydantic_validation_negative_bid(mock_user_and_profile):
    """Test Pydantic rejects a negative bid amount."""
    user_id = mock_user_and_profile
    payload = {
        "project_id": 1,
        "cover_letter": "This is a strictly valid cover letter that is long enough.",
        "bid_amount": -10.0, # BAD DATA
        "estimated_days": 10
    }
    
    response = client.post(f"/api/users/{user_id}/proposals", json=payload)
    assert response.status_code == 422 # Unprocessable Entity
    
def test_pydantic_validation_short_cover_letter(mock_user_and_profile):
    """Test Pydantic rejects a cover letter under 20 characters."""
    user_id = mock_user_and_profile
    payload = {
        "project_id": 1,
        "cover_letter": "Too short", # BAD DATA
        "bid_amount": 100.0,
        "estimated_days": 10
    }
    
    response = client.post(f"/api/users/{user_id}/proposals", json=payload)
    assert response.status_code == 422

def test_no_freelancer_profile_rejection():
    """Test application failure if user lacks a freelancer profile."""
    # Create a user WITHOUT a profile
    db = TestingSessionLocal()
    user = User(
        email="noprofile@example.com",
        username="noprofile",
        hashed_password="hashed_password456",
        role="freelancer"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    db.close()
    
    payload = {
        "project_id": 1,
        "cover_letter": "This is a strictly valid cover letter that is long enough.",
        "bid_amount": 500.0,
        "estimated_days": 10
    }
    
    response = client.post(f"/api/users/{user_id}/proposals", json=payload)
    assert response.status_code == 404
    assert "must have a Freelancer Profile" in response.json()["detail"]
