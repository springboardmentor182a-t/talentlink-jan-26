from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from src.projects.models import Project, Contract
from src.entities.dashboard import DashboardResponse

def get_dashboard_data(db: Session, client_id: int) -> DashboardResponse:
    
    # --- 1. Top Stats Logic ---
    total_spent = db.query(func.sum(Project.budget_spent)).filter(
        Project.client_id == client_id
    ).scalar() or 0.00
    
    active_count = db.query(Project).filter(
        Project.client_id == client_id,
        Project.status == "In Progress"
    ).count()

    # --- 2. Active Projects List ---
    projects = db.query(Project).filter(
        Project.client_id == client_id,
        Project.status == "In Progress"
    ).all()
    
    active_list = []
    for p in projects:
        # Calculate days left
        days = (p.deadline - datetime.now()).days if p.deadline else 0
        
        active_list.append({
            "id": p.id,
            "title": p.title,
            "freelancer_name": "Sarah Johnson", # Placeholder until Auth is ready
            "status_label": "On Track" if p.progress > 50 else "Lagging",
            "progress": p.progress,
            "days_left": max(0, days)
        })

    # --- 3. Construct Final Response ---
    return {
        "stats": {
            "total_spent": total_spent,
            "total_spent_growth": 18.2,     
            "active_projects": active_count,
            "active_projects_growth": 4,    
            "hired_freelancers": 18,        
            "hired_freelancers_growth": 6,
            "avg_rating": 4.8,
            "avg_rating_growth": 0.3
        },
        "spending_chart": {
            "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "spending": [2500, 3200, 2800, 4100, 5000, 4800]
        },
        "project_timeline": {
            "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "projects_count": [3, 5, 4, 7, 6, 8]
        },
        "active_projects": active_list,
        "recent_activity": [
            {"id": 1, "description": "John Smith submitted proposal", "time_ago": "1 hour ago", "type": "proposal"},
            {"id": 2, "description": "Payment processed: $3,200", "time_ago": "1 day ago", "type": "payment"}
        ]
    }