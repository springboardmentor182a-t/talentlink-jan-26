from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from src.projects.models import Project, Contract, Payment, User, ActivityLog
from src.entities.dashboard import DashboardResponse
import calendar

def get_dashboard_data(db: Session, client_id: int) -> DashboardResponse:
    
    # --- 1. Top Stats Logic (REAL DATA) ---
    
    # Total Spent: Sum of all completed payments for this client's projects
    # We join Payment -> Project to filter by client_id
    total_spent = db.query(func.sum(Payment.amount)).join(Project).filter(
        Project.client_id == client_id,
        Payment.status == "Completed"
    ).scalar() or 0.00
    
    # Active Projects Count
    active_count = db.query(Project).filter(
        Project.client_id == client_id,
        Project.status == "In Progress"
    ).count()

    # Hired Freelancers: Unique count of freelancers in contracts for this client's projects
    hired_count = db.query(func.count(func.distinct(Contract.freelancer_id))).join(Project).filter(
        Project.client_id == client_id
    ).scalar() or 0
    
    # Avg Rating: Average rating of freelancers hired by this client
    # Join Contract -> User (Freelancer)
    avg_rating = db.query(func.avg(User.rating)).join(Contract, Contract.freelancer_id == User.id).join(Project).filter(
        Project.client_id == client_id
    ).scalar() or 0.0

    # --- 2. Active Projects List (REAL DATA) ---
    projects = db.query(Project).filter(
        Project.client_id == client_id,
        Project.status == "In Progress"
    ).all()
    
    active_list = []
    for p in projects:
        # Get Freelancer Name from latest contract (if any)
        latest_contract = db.query(Contract).filter(Contract.project_id == p.id).first()
        freelancer_name = latest_contract.freelancer.full_name if latest_contract and latest_contract.freelancer else "Not Hired Yet"
        
        days = (p.deadline - datetime.now()).days if p.deadline else 0
        
        status_label = "On Track"
        if p.progress < 50 and days < 7:
            status_label = "Lagging"
        elif p.progress > 80:
            status_label = "Almost Done"

        active_list.append({
            "id": p.id,
            "title": p.title,
            "freelancer_name": freelancer_name,
            "status_label": status_label,
            "progress": p.progress,
            "days_left": max(0, days)
        })

    # --- 3. Spending Chart (REAL DATA: Group by Month) ---
    # We will get data for current year
    current_year = datetime.now().year
    
    spending_query = db.query(
        func.extract('month', Payment.payment_date).label('month'),
        func.sum(Payment.amount).label('total')
    ).join(Project).filter(
        Project.client_id == client_id,
        func.extract('year', Payment.payment_date) == current_year
    ).group_by('month').order_by('month').all()
    
    # Initialize 12 months with 0
    spending_map = {i: 0 for i in range(1, 13)}
    for month, total in spending_query:
        spending_map[int(month)] = total

    spending_months = [calendar.month_abbr[i] for i in range(1, 7)] # Jan-Jun for demo, or dynamic
    spending_values = [spending_map[i] for i in range(1, 7)]

    # --- 4. Project Timeline (REAL DATA: Projects Created by Month) ---
    timeline_query = db.query(
        func.extract('month', Project.created_at).label('month'),
        func.count(Project.id).label('count')
    ).filter(
        Project.client_id == client_id,
        func.extract('year', Project.created_at) == current_year
    ).group_by('month').order_by('month').all()

    timeline_map = {i: 0 for i in range(1, 13)}
    for month, count in timeline_query:
        timeline_map[int(month)] = count
        
    timeline_values = [timeline_map[i] for i in range(1, 7)]

    # --- 5. Recent Activity (REAL DATA) ---
    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == client_id
    ).order_by(ActivityLog.created_at.desc()).limit(5).all()
    
    activity_list = []
    for log in activities:
        # Simple "time ago" logic
        delta = datetime.now() - log.created_at
        if delta.days > 0:
            time_ago = f"{delta.days} days ago"
        elif delta.seconds > 3600:
            time_ago = f"{delta.seconds // 3600} hours ago"
        else:
            time_ago = "Just now"

        activity_list.append({
            "id": log.id,
            "description": log.description,
            "time_ago": time_ago,
            "type": log.activity_type
        })

    # --- 6. Profile Feed ---
    client_user = db.query(User).filter(User.id == client_id).first()
    profile_data = {
        "full_name": client_user.full_name if client_user else "Nayana",
        "role": client_user.role if client_user else "Client",
        "account_type": "Premium Account"
    }

    # --- Construct Final Response ---
    return {
        "profile": profile_data,
        "stats": {
            "total_spent": round(total_spent, 2),
            "total_spent_growth": 0.0,  # Could calculate vs last month if needed
            "active_projects": active_count,
            "active_projects_growth": 0,
            "hired_freelancers": hired_count,
            "hired_freelancers_growth": 0,
            "avg_rating": round(avg_rating, 1),
            "avg_rating_growth": 0.0
        },
        "spending_chart": {
            "months": spending_months,
            "spending": spending_values
        },
        "project_timeline": {
            "months": spending_months, # Sync x-axis
            "projects_count": timeline_values
        },
        "active_projects": active_list,
        "recent_activity": activity_list
    }