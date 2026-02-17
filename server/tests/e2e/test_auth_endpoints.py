# server/tests/e2e/test_auth_endpoints.py

REGISTER_PAYLOAD = {
    "email": "test@example.com",
    "username": "testuser",
    "password": "securepass123",
    "role": "freelancer",
}


def test_register_creates_user(client):
    response = client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "hashed_password" not in data  # never expose hash


def test_login_returns_jwt_token(client):
    client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "securepass123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_wrong_password_returns_401(client):
    client.post("/api/auth/register", json=REGISTER_PAYLOAD)
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401
