from sqlalchemy.orm import Session
from passlib.context import CryptContext

from src.entities.user import User
from src.users.models import FreelancerProfile, ClientProfile
from src.users.schemas import UserCreate, FreelancerProfileCreate, ClientProfileCreate
from src.users import models, schemas # Keep these if your proposal function needs them

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Optional: Keep your standalone proposal function if it's being used elsewhere
def create_proposal(db: Session, proposal: schemas.ProposalCreate, freelancer_id: int):
    # 1. Convert the Schema (Pydantic) to a Model (Database)
    db_proposal = models.Proposal(
        **proposal.dict(),
        freelancer_id=freelancer_id,
        status="pending",
    )
    # 2. Add and Save
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal


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
        # 1. Check if the profile already exists
        existing_profile = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == user_id).first()

        if existing_profile:
            # 2a. Update existing profile dynamically
            profile_data = profile.dict(exclude_unset=True)
            for key, value in profile_data.items():
                setattr(existing_profile, key, value)
            
            db.commit()
            db.refresh(existing_profile)
            return existing_profile
        else:
            # 2b. Create a new profile if one doesn't exist
            db_profile = FreelancerProfile(
                user_id=user_id,
                **profile.dict()
            )
            db.add(db_profile)
            db.commit()
            db.refresh(db_profile)
            return db_profile

    @staticmethod
    def create_client_profile(db: Session, user_id: int, profile: ClientProfileCreate):
        """Create or update a client profile for a user"""
        # 1. Check if the profile already exists
        existing_profile = db.query(ClientProfile).filter(ClientProfile.user_id == user_id).first()

        if existing_profile:
            # 2a. Update existing profile dynamically
            profile_data = profile.dict(exclude_unset=True)
            for key, value in profile_data.items():
                setattr(existing_profile, key, value)
            
            db.commit()
            db.refresh(existing_profile)
            return existing_profile
        else:
            # 2b. Create a new profile if one doesn't exist
            db_profile = ClientProfile(
                user_id=user_id,
                **profile.dict()
            )
            db.add(db_profile)
            db.commit()
            db.refresh(db_profile)
            return db_profile