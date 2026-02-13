from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    email: str
    password: str
    username: str

@router.post("/login")
def login(user: UserLogin):
    # TODO: Implement actual login logic with database and JWT
    if user.email == "test@test.com" and user.password == "password":
        return {"access_token": "fake-jwt-token", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/signup")
def signup(user: UserSignup):
    # TODO: Implement actual signup logic
    return {"message": "User created successfully", "user": user.username}
