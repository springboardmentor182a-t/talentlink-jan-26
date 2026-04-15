import requests

BASE_URL = "http://localhost:8000"

def test_profile_flow():
    # 1. Register a test user
    email = "newfreelancer_xyz@example.com"
    password = "password123"
    print("Registering user...")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test Freelancer",
        "email": email,
        "password": password,
        "role": "freelancer"
    })
    
    if res.status_code not in (200, 400): # 400 if already exists
        print("Registration failed:", res.text)
        return
        
    # 2. Login
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    if login_res.status_code != 200:
        print("Login failed:", login_res.text)
        return
    
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. GET Profile
    print("Fetching profile...")
    prof_res = requests.get(f"{BASE_URL}/users/profile", headers=headers)
    print("Profile GET response:", prof_res.status_code, prof_res.text)
    
    # 4. PUT Profile
    print("Updating profile...")
    update_data = {
        "professionalTitle": "Backend Engineer",
        "skills": ["Python", "FastAPI"]
    }
    put_res = requests.put(f"{BASE_URL}/users/profile", headers=headers, json=update_data)
    print("Profile PUT response:", put_res.status_code, put_res.text)

if __name__ == "__main__":
    test_profile_flow()
