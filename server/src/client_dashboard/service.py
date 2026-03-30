from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from typing import Optional
from src.projects.models import Project, Contract, Payment, User, ActivityLog, Proposal
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
        freelancer = latest_contract.freelancer if latest_contract else None
        freelancer_name = f"{freelancer.first_name} {freelancer.last_name}" if freelancer else "Not Hired Yet"
        
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

    spending_months = [calendar.month_abbr[i] for i in range(1, 13)]
    spending_values = [spending_map[i] for i in range(1, 13)]

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
        
    timeline_values = [timeline_map[i] for i in range(1, 13)]

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
        "full_name": f"{client_user.first_name} {client_user.last_name}" if client_user else "Account User",
        "role": client_user.role if client_user else "Client",
        "account_type": client_user.role if client_user else "Client"
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


def get_freelancer_dashboard_data(db: Session, freelancer_id: int):
    now = datetime.now()
    active_proposals = db.query(Proposal).filter(
        Proposal.freelancer_id == freelancer_id,
        Proposal.status.in_(["Under Review", "Pending"])
    ).count()

    ongoing_contracts = db.query(Contract).filter(
        Contract.freelancer_id == freelancer_id,
        Contract.status == "Active"
    ).all()

    total_earnings = db.query(func.sum(Payment.amount)).join(Contract).filter(
        Contract.freelancer_id == freelancer_id,
        Payment.contract_id == Contract.id,
        Payment.status == "Completed"
    ).scalar() or 0.0

    profile_views = db.query(func.count(ActivityLog.id)).filter(
        ActivityLog.user_id == freelancer_id,
        ActivityLog.activity_type == "profile_view"
    ).scalar() or 0

    proposals = db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()
    contracts = ongoing_contracts
    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == freelancer_id
    ).order_by(ActivityLog.created_at.desc()).limit(5).all()

    user = db.query(User).filter(User.id == freelancer_id).first()

    # build simplified series for past months based on contract payments
    earnings_series = []
    for month in range(1, 13):
        month_total = db.query(func.sum(Payment.amount)).join(Contract).filter(
            Contract.freelancer_id == freelancer_id,
            func.extract('month', Payment.payment_date) == month,
            func.extract('year', Payment.payment_date) == now.year,
            Payment.status == "Completed"
        ).scalar() or 0
        earnings_series.append({"month": calendar.month_abbr[month], "earnings": float(month_total)})

    return {
        "user": {
            "full_name": f"{user.first_name} {user.last_name}" if user else "Account User",
            "role": user.role if user else "Freelancer"
        },
        "stats": {
            "activeProposals": active_proposals,
            "ongoingProjects": len(ongoing_contracts),
            "totalEarnings": float(total_earnings),
            "profileViews": profile_views
        },
        "proposals": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "amount": p.amount,
                "rate": p.rate,
                "timeline": p.timeline,
                "status": p.status,
                "client_name": f"{p.client.first_name} {p.client.last_name}" if p.client else None,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in proposals
        ],
        "contracts": [
            {
                "id": c.id,
                "project_id": c.project_id,
                "amount": c.amount,
                "status": c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in contracts
        ],
        "earningsSeries": earnings_series,
        "activities": [
            {
                "id": a.id,
                "description": a.description,
                "time_ago": (datetime.now() - a.created_at).days,
                "type": a.activity_type
            }
            for a in activities
        ]
    }


def get_received_proposals(db: Session, client_id: int):
    proposals = db.query(Proposal).filter(Proposal.client_id == client_id).all()

    return {
        "proposals": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "amount": p.amount,
                "rate": p.rate,
                "timeline": p.timeline,
                "status": p.status,
                "client_id": p.client_id,
                "freelancer_id": p.freelancer_id,
                "project_id": p.project_id,
                "client_name": f"{p.client.first_name} {p.client.last_name}" if p.client else None,
                "freelancer_name": f"{p.freelancer.first_name} {p.freelancer.last_name}" if p.freelancer else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in proposals
        ]
    }


def get_freelancer_proposals(db: Session, freelancer_id: int):
    proposals = db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()

    return {
        "proposals": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "amount": p.amount,
                "rate": p.rate,
                "timeline": p.timeline,
                "status": p.status,
                "client_id": p.client_id,
                "freelancer_id": p.freelancer_id,
                "project_id": p.project_id,
                "client_name": f"{p.client.first_name} {p.client.last_name}" if p.client else None,
                "freelancer_name": f"{p.freelancer.first_name} {p.freelancer.last_name}" if p.freelancer else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in proposals
        ]
    }


def create_freelancer_proposal(
    db: Session,
    freelancer_id: int,
    client_id: int,
    project_id: Optional[int],
    title: str,
    description: str,
    amount: float,
    rate: float,
    timeline: str,
):
    proposal = Proposal(
        title=title,
        description=description,
        amount=amount,
        rate=rate,
        timeline=timeline,
        status="Under Review",
        project_id=project_id,
        client_id=client_id,
        freelancer_id=freelancer_id,
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return {
        "id": proposal.id,
        "title": proposal.title,
        "description": proposal.description,
        "amount": proposal.amount,
        "rate": proposal.rate,
        "timeline": proposal.timeline,
        "status": proposal.status,
        "client_id": proposal.client_id,
        "freelancer_id": proposal.freelancer_id,
        "project_id": proposal.project_id,
        "client_name": proposal.client.first_name + " " + proposal.client.last_name if proposal.client else None,
        "freelancer_name": proposal.freelancer.first_name + " " + proposal.freelancer.last_name if proposal.freelancer else None,
        "created_at": proposal.created_at.isoformat() if proposal.created_at else None,
    }
