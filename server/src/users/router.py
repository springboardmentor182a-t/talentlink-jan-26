from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.entities.user import User

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    # Bypassing auth: Return the first user in the DB (seeded user)
    user = db.query(User).first()
    if not user:
        return {"name": "Mock User", "email": "mock@example.com"}
    return {"name": user.name, "email": user.email}
