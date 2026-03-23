from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta

from src.database.core import SessionLocal, get_db
from src.entities.user import User
from src.entities.profile import Profile
from src.auth.models import ProfileUpdate

SECRET_KEY = "talentlink-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")



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

    if role == "freelancer":
        profile = Profile(
            user_id=user.id,
            professional_title="",
            hourly_rate="0",
            experience="Less than 1 year",
            skills=""
        )
        db.add(profile)
        db.commit()

    return user


def authenticate_user(db: Session, email, password):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def get_user_profile(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    # If no profile exists yet, return default data based on user account
    if not profile:
        return {
            "fullName": user.name,
            "professionalTitle": None,
            "hourlyRate": "0",
            "location": None,
            "experience": "Less than 1 year",
            "email": user.email,
            "bio": None,
            "skills": []
        }

    return {
        "fullName": user.name,
        "professionalTitle": profile.professional_title,
        "hourlyRate": profile.hourly_rate,
        "location": profile.location,
        "experience": profile.experience,
        "email": user.email,
        "bio": profile.bio,
        "skills": profile.skills.split(",") if profile.skills else []
    }


def update_user_profile(db: Session, user_id: int, data: ProfileUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    if data.fullName:
        user.name = data.fullName

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)

    if data.professionalTitle is not None:
        profile.professional_title = data.professionalTitle
    if data.hourlyRate is not None:
        profile.hourly_rate = data.hourlyRate
    if data.location is not None:
        profile.location = data.location
    if data.experience is not None:
        profile.experience = data.experience
    if data.bio is not None:
        profile.bio = data.bio
    if data.skills is not None:
        profile.skills = ",".join(data.skills)

    db.commit()
    return get_user_profile(db, user_id)
