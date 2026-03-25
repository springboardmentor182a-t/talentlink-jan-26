import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database.core import Base, get_db
from src.users.models import ClientProfile
from src.entities.user import User

# --- Setup Test Database ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_talentlink_projects.db"

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

# Mock the client_id dependency we placed in the router
def override_get_mock_client_id():
    db = TestingSessionLocal()
    client = db.query(ClientProfile).first()
    client_id = client.id if client else 1
    db.close()
    return client_id

app.dependency_overrides[get_db] = override_get_db
from src.projects.router import get_mock_client_id
app.dependency_overrides[get_mock_client_id] = override_get_mock_client_id

client = TestClient(app)

# --- Fixtures ---
@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def mock_client():
    """Create a user and associated client profile for testing."""
    db = TestingSessionLocal()
    
    user = User(
        email="testclient@example.com",
        username="testclient",
        hashed_password="hashed_password123",
        role="client"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = ClientProfile(
        user_id=user.id,
        company_name="Test Company",
        industry="Technology",
        company_description="A test company",
        company_bio="Bio text"
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    client_id = profile.id
    db.close()
    return client_id

# --- Tests ---

def test_create_valid_project(mock_client):
    payload = {
        "title": "Build an outstanding awesome feature",
        "description": "We need this feature built. It should definitely have at least 50 characters to pass validation so I am adding padding text.",
        "budget": 1000.50
    }
    
    response = client.post("/api/projects/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["client_id"] == mock_client
    assert data["status"] == "open"

def test_project_validation_short_title(mock_client):
    payload = {
        "title": "Too short",  # BAD DATA (under 10 chars)
        "description": "We need this feature built. It should definitely have at least 50 characters to pass validation so I am adding padding text.",
        "budget": 1000.50
    }
    
    response = client.post("/api/projects/", json=payload)
    assert response.status_code == 422 # Unprocessable Entity

def test_project_validation_short_description(mock_client):
    payload = {
        "title": "This is a valid title",
        "description": "Too short description.", # BAD DATA (under 50 chars)
        "budget": 1000.50
    }
    
    response = client.post("/api/projects/", json=payload)
    assert response.status_code == 422

def test_project_validation_negative_budget(mock_client):
    payload = {
        "title": "This is a valid title",
        "description": "We need this feature built. It should definitely have at least 50 characters to pass validation so I am adding padding text.",
        "budget": -50.0 # BAD DATA (<= 0)
    }
    
    response = client.post("/api/projects/", json=payload)
    assert response.status_code == 422

def test_no_client_profile_rejection():
    # In this mock, we override get_mock_client_id to return 9999
    # which does not exist in the DB.
    app.dependency_overrides[get_mock_client_id] = lambda: 9999
    
    payload = {
        "title": "This is a valid title",
        "description": "We need this feature built. It should definitely have at least 50 characters to pass validation so I am adding padding text.",
        "budget": 1000.50
    }
    
    response = client.post("/api/projects/", json=payload)
    assert response.status_code == 404
    assert "You must have a Client Profile" in response.json()["detail"]
    
    # Restore override for subsequent tests just in case
    app.dependency_overrides[get_mock_client_id] = override_get_mock_client_id

# --- Automated Search & Pagination Tests ---

@pytest.fixture
def mock_multiple_projects(mock_client):
    db = TestingSessionLocal()
    from src.projects.models import Project
    
    projects = [
        Project(title="Build an AI Model", description="Need a python script with 50 chars minimum description right here.", budget=5000, client_id=mock_client, status="open"),
        Project(title="React Dashboard", description="Need a react dashboard with 50 chars minimum description right here.", budget=1500, client_id=mock_client, status="open"),
        Project(title="Python Data Scraper", description="Need a python scraper with 50 chars minimum description right here.", budget=300, client_id=mock_client, status="open"),
        Project(title="Closed Project Example", description="Need a closed project with 50 chars minimum description right here.", budget=1000, client_id=mock_client, status="completed")
    ]
    
    for p in projects:
        db.add(p)
    db.commit()
    db.close()

def test_get_projects_default_pagination(mock_multiple_projects):
    response = client.get("/api/projects/")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 3 # Only "open" projects
    assert len(data["items"]) == 3
    assert data["skip"] == 0
    assert data["limit"] == 10

def test_get_projects_with_search_title(mock_multiple_projects):
    # Searching for 'React'
    response = client.get("/api/projects/?search=React")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 1
    assert data["items"][0]["title"] == "React Dashboard"

def test_get_projects_with_search_description_case_insensitive(mock_multiple_projects):
    # Searching for 'PYTHON' (case insensitive match on description or title)
    response = client.get("/api/projects/?search=PYTHON")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 2 # "Build an AI Model" and "Python Data Scraper"

def test_get_projects_with_min_budget(mock_multiple_projects):
    # Budget >= 1000
    response = client.get("/api/projects/?min_budget=1000")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 2 # 5000 and 1500 budgets
    
def test_get_projects_combined_filters(mock_multiple_projects):
    # python AND >= 4000
    response = client.get("/api/projects/?search=python&min_budget=4000")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 1
    assert data["items"][0]["title"] == "Build an AI Model"
