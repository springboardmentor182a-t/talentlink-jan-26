import requests

BASE_URL = "http://localhost:8000"

def test_profile():
    # 1. Register a new user
    import time
    user_email = f"test_{int(time.time())}@example.com"
    reg_payload = {"name": "Test User", "email": user_email, "password": "password123", "role": "freelancer"}
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    print("Register:", res.status_code, res.text)
    
    # 2. Login
    login_payload = {"email": user_email, "password": "password123"}
    res = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    print("Login:", res.status_code)
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. GET profile
    res = requests.get(f"{BASE_URL}/users/profile", headers=headers)
    print("GET Profile:", res.status_code, res.json())
    
    # 4. PUT profile
    put_payload = {
        "professionalTitle": "Senior Developer",
        "hourlyRate": "50",
        "skills": ["React", "Python"],
        "bio": "I am a test user."
    }
    res = requests.put(f"{BASE_URL}/users/profile", json=put_payload, headers=headers)
    print("PUT Profile:", res.status_code, res.json())
    
    # 5. GET profile again
    res = requests.get(f"{BASE_URL}/users/profile", headers=headers)
    print("GET Profile 2:", res.status_code, res.json())

if __name__ == "__main__":
    test_profile()
