import pytest
import requests
import json

BASE_URL = "http://localhost:8000"

def test_job_and_proposal_integration():
    # 1. Login to get token (assuming a test user exists or we create one)
    # For simplicity, we'll assume the server is running and we can use a known email
    test_email = "testfreelancer@example.com"
    test_password = "password123"
    
    # Try to register if not exists
    requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test Freelancer",
        "email": test_email,
        "password": test_password,
        "role": "freelancer"
    })
    
    # Login
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Post a job as client
    client_email = "testclient@example.com"
    requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test Client",
        "email": client_email,
        "password": test_password,
        "role": "client"
    })
    client_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": client_email,
        "password": test_password
    })
    client_token = client_login.json()["access_token"]
    client_headers = {"Authorization": f"Bearer {client_token}"}

    job_data = {
        "title": "React Developer Needed",
        "description": "Build a stunning dashboard with real-time updates.",
        "budget": 5000,
        "skills": "React,TypeScript,Tailwind",
        "duration": "2 months"
    }
    job_res = requests.post(f"{BASE_URL}/jobs/", json=job_data, headers=client_headers)
    assert job_res.status_code == 200
    job_id = job_res.json()["id"]
    assert job_res.json()["skills"] == "React,TypeScript,Tailwind"
    assert job_res.json()["duration"] == "2 months"

    # 3. Submit proposal as freelancer
    proposal_data = {
        "job_id": job_id,
        "cover_letter": "I am an expert in React and Tailwind. I can deliver this in 1 month.",
        "bid_amount": 4500,
        "delivery_time": "1 month"
    }
    proposal_res = requests.post(f"{BASE_URL}/proposals/", json=proposal_data, headers=headers)
    assert proposal_res.status_code == 200
    assert proposal_res.json()["delivery_time"] == "1 month"

    # 4. Verify freelancer can see the proposal
    my_proposals_res = requests.get(f"{BASE_URL}/proposals/me", headers=headers)
    assert my_proposals_res.status_code == 200
    proposals = my_proposals_res.json()
    assert any(p["job_id"] == job_id and p["delivery_time"] == "1 month" for p in proposals)

    print("Verification successful!")

if __name__ == "__main__":
    test_job_and_proposal_integration()
