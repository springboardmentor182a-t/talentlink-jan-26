from src.proposals import models
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Import your database connection
from src.database.core import get_db
# Import your database tables (adjust this path if your models are elsewhere)
from src.proposals import models 

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    
    # 1. Perform SQL Queries via SQLAlchemy
    active_projects_count = db.query(models.Project).count()
    
   
    active_contract = db.query(models.Contract).filter(models.Contract.status == "Active").first()
    
    # 2. Return the dynamic data
    return {
        "user": "John", # Later, you can update this to the actual logged-in user
        "stats": {
            "active_projects": active_projects_count,
            "pending_proposals": 12, # Replace with pending_proposals_count when that table exists
            "total_earnings": "$4.5k",
            "profile_views": 247
        },
        "active_contract": {
            "title": active_contract.title if active_contract else "No active contracts",
            "due": active_contract.due if active_contract else "N/A",
            "progress": active_contract.progress if active_contract else 0
        } if active_contract else {
            "title": "No active contracts",
            "due": "N/A",
            "progress": 0
        }
    }