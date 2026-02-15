from sqlalchemy.orm import Session
from passlib.context import CryptContext

from src.entities.user import User
from src.users.models import FreelancerProfile, ClientProfile
from src.users.schemas import UserCreate, FreelancerProfileCreate, ClientProfileCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:

    @staticmethod
    def get_all_users(db: Session):
        """Get all registered users"""
        return db.query(User).all()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        """Find a specific user by their ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        """Find a user by their email address"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create_user(db: Session, user: UserCreate):
        """Create a new user with a hashed password"""
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            email=user.email,
            username=user.email.split("@")[0],  # Derive username from email as default
            hashed_password=hashed_password,
            role=user.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def create_freelancer_profile(db: Session, user_id: int, profile: FreelancerProfileCreate):
        """Create or update a freelancer profile for a user"""
        db_profile = FreelancerProfile(
            user_id=user_id,
            full_name=profile.full_name,
            title=profile.title,
            bio=profile.bio,
            hourly_rate=profile.hourly_rate,
            skills=profile.skills,
        )
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile

    @staticmethod
    def create_client_profile(db: Session, user_id: int, profile: ClientProfileCreate):
        """Create or update a client profile for a user"""
        db_profile = ClientProfile(
            user_id=user_id,
            company_name=profile.company_name,
            industry=profile.industry,
            company_description=profile.company_description,
        )
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile
