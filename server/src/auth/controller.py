from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.core import SessionLocal
from src.auth.models import RegisterRequest, LoginRequest, TokenResponse
from src.auth.service import register_user, authenticate_user, create_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, data.name, data.email, data.password, data.role)
    if not user:
        raise HTTPException(status_code=400, detail="User already exists")

    return {"message": "Registration successful"}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": user.email,
        "role": user.role
    })

    return {"access_token": token}
