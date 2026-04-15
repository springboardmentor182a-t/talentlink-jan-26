import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.core import Base, get_db
from src.main import app

# Setup in-memory DB for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_freelancer_dashboard_flow():
    # 1. Register Client
    client_data = {"name": "Client User", "email": "client@example.com", "password": "password", "role": "client"}
    response = client.post("/auth/register", json=client_data)
    assert response.status_code == 200

    # 2. Login Client
    login_data = {"email": "client@example.com", "password": "password"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    client_token = response.json()["access_token"]
    client_headers = {"Authorization": f"Bearer {client_token}"}

    # 3. Post a Job
    job_data = {"title": "Test Job", "description": "This is a test job", "budget": 100}
    response = client.post("/jobs/", json=job_data, headers=client_headers)
    assert response.status_code == 200
    job_id = response.json()["id"]

    # 4. Register Freelancer
    freelancer_data = {"name": "Freelancer User", "email": "freelancer@example.com", "password": "password", "role": "freelancer"}
    response = client.post("/auth/register", json=freelancer_data)
    assert response.status_code == 200

    # 5. Login Freelancer
    login_data = {"email": "freelancer@example.com", "password": "password"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    freelancer_token = response.json()["access_token"]
    freelancer_headers = {"Authorization": f"Bearer {freelancer_token}"}

    # 6. Fetch Jobs
    response = client.get("/jobs/", headers=freelancer_headers)
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) > 0
    assert jobs[0]["title"] == "Test Job"

    # 7. Submit Proposal
    proposal_data = {"job_id": job_id, "cover_letter": "I can do this", "bid_amount": 90}
    response = client.post("/proposals/", json=proposal_data, headers=freelancer_headers)
    assert response.status_code == 200

    # 8. Fetch My Proposals
    response = client.get("/proposals/me", headers=freelancer_headers)
    assert response.status_code == 200
    proposals = response.json()
    assert len(proposals) > 0
    assert proposals[0]["cover_letter"] == "I can do this"

    print("Freelancer Dashboard Flow Verified Successfully!")
