from fastapi.testclient import TestClient
from src.main import app
from src.database.core import init_db

client = TestClient(app)


def setup_module(module):
    # ensure fresh tables before running tests
    init_db()


def test_send_and_fetch_messages():
    payload = {"sender_id": 1, "receiver_id": 2, "content": "hello from test"}
    resp = client.post("/messages/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 1
    assert data["content"] == "hello from test"

    # now retrieve conversation
    resp = client.get("/messages/1?other_user_id=2")
    assert resp.status_code == 200
    conv = resp.json()
    assert isinstance(conv, list)
    assert len(conv) == 1
    assert conv[0]["content"] == "hello from test"
