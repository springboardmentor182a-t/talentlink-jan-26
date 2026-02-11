from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

from src.entities.user import User

SECRET_KEY = "talentlink-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)


def create_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def register_user(db: Session, name, email, password, role):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return None

    user = User(
        name=name,
        email=email,
        password=hash_password(password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email, password):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user
