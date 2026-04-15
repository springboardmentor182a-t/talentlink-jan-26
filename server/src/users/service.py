from sqlalchemy.orm import Session
from passlib.context import CryptContext
import logging
from fastapi import HTTPException

from src.entities.user import User
from src.users.models import FreelancerProfile, ClientProfile
from src.users.schemas import UserCreate, FreelancerProfileCreate, ClientProfileCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)


class UserService:

    @staticmethod
    def get_all_users(db: Session):
        return db.query(User).all()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create_user(db: Session, user: UserCreate):
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            email=user.email,
            username=user.email.split("@")[0],
            hashed_password=hashed_password,
            role=user.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def create_freelancer_profile(db: Session, user_id: int, profile: FreelancerProfileCreate):
        existing = db.query(FreelancerProfile).filter(
            FreelancerProfile.user_id == user_id
        ).first()
        if existing:
            for key, value in profile.model_dump(exclude_unset=True).items():
                setattr(existing, key, value)
            db.commit()
            db.refresh(existing)
            return existing
        db_profile = FreelancerProfile(user_id=user_id, **profile.model_dump())
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile

    @staticmethod
    def create_client_profile(db: Session, user_id: int, profile: ClientProfileCreate):
        existing = db.query(ClientProfile).filter(
            ClientProfile.user_id == user_id
        ).first()
        if existing:
            for key, value in profile.model_dump(exclude_unset=True).items():
                setattr(existing, key, value)
            db.commit()
            db.refresh(existing)
            return existing
        db_profile = ClientProfile(user_id=user_id, **profile.model_dump())
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile