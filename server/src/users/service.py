# server/src/users/service.py
from sqlalchemy.orm import Session
from . import models, schemas

# 1. Create a basic User
def create_user(db: Session, user: schemas.UserCreate):
    # In a real app, we would hash the password here (e.g., bcrypt)
    # For now, we store it simply to get the flow working.
    fake_hashed_password = user.password + "notreallyhashed"
    
    db_user = models.User(
        email=user.email, 
        hashed_password=fake_hashed_password,
        role=user.role.value
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 2. Get a User by Email (for login)
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# 3. Create Freelancer Profile
def create_freelancer_profile(db: Session, user_id: int, profile: schemas.FreelancerProfileCreate):
    db_profile = models.FreelancerProfile(
        user_id=user_id,
        **profile.dict() # Unpacks full_name, title, skills, etc.
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# 4. Create Client Profile
def create_client_profile(db: Session, user_id: int, profile: schemas.ClientProfileCreate):
    db_profile = models.ClientProfile(
        user_id=user_id,
        **profile.dict()
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile