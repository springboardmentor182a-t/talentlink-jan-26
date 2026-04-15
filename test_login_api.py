import requests
import json

url = "http://localhost:8000/auth/login"
payload = {
    "email": "freelancer_test@example.com",
    "password": "password123"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
