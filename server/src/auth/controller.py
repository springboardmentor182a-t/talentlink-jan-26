from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.core import SessionLocal, get_db
from src.auth.models import RegisterRequest, LoginRequest, TokenResponse, ProfileResponse, ProfileUpdate
from src.auth.service import register_user, authenticate_user, create_token, get_current_user, get_user_profile, update_user_profile
from src.entities.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, data.name, data.email, data.password, data.role)
    if not user:
        raise HTTPException(status_code=400, detail="User already exists")

    return {"message": "Registration successful"}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    print(f"Login attempt for: {data.email}")
    user = authenticate_user(db, data.email, data.password)
    if not user:
        print(f"Login failed for: {data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": user.email,
        "role": user.role
    })

    return {
        "access_token": token,
        "token": token,  # Add token for compatibility
        "token_type": "bearer",
        "role": user.role,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


@router.get("/profile", response_model=ProfileResponse)
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_user_profile(db, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/profile", response_model=ProfileResponse)
def update_profile(data: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = update_user_profile(db, user.id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
