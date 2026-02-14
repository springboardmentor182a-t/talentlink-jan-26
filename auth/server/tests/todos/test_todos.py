def test_create_todo(client):
    response = client.post(
        "/api/todos/",
        json={
            "title": "Test Todo",
            "description": "Test Description",
            "completed": False
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["completed"] is False

def test_get_todos(client):
    # Create a todo first
    client.post(
        "/api/todos/",
        json={"title": "Test Todo"}
    )
    
    # Get todos
    response = client.get("/api/todos/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
