from datetime import datetime
from typing import Optional
import calendar

from sqlalchemy import func
from sqlalchemy.orm import Session

from src.entities.dashboard import DashboardResponse
from src.projects.models import ActivityLog, Contract, Payment, Project, Proposal, User


def _time_ago(value: datetime) -> str:
    delta = datetime.now() - value
    if delta.days > 0:
        return f"{delta.days} day{'s' if delta.days != 1 else ''} ago"
    hours = delta.seconds // 3600
    if hours > 0:
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    minutes = max(1, delta.seconds // 60)
    return f"{minutes} minute{'s' if minutes != 1 else ''} ago"


def _status_label(progress: int, days_left: int) -> str:
    if progress >= 85:
        return "Almost Done"
    if days_left <= 7 and progress < 50:
        return "Lagging"
    return "On Track"


def _serialize_active_project(project: Project, contract: Optional[Contract]):
    freelancer = contract.freelancer if contract else None
    client = project.client
    days_left = 0
    if project.deadline:
        days_left = max(0, (project.deadline - datetime.now()).days)

    return {
        "id": project.id,
        "title": project.title,
        "client_name": f"{client.first_name} {client.last_name}" if client else "Unknown Client",
        "freelancer_name": f"{freelancer.first_name} {freelancer.last_name}" if freelancer else "Not Assigned",
        "status": project.status,
        "status_label": _status_label(project.progress or 0, days_left),
        "progress": project.progress or 0,
        "days_left": days_left,
        "budget": float(project.budget or 0),
        "deadline": project.deadline.isoformat() if project.deadline else None,
    }


def _serialize_activity(log: ActivityLog):
    return {
        "id": log.id,
        "description": log.description,
        "time_ago": _time_ago(log.created_at),
        "type": log.activity_type,
    }


def _serialize_proposal(proposal: Proposal):
    return {
        "id": proposal.id,
        "title": proposal.title,
        "description": proposal.description,
        "amount": float(proposal.amount or 0),
        "rate": float(proposal.rate or 0),
        "timeline": proposal.timeline,
        "status": proposal.status,
        "client_id": proposal.client_id,
        "freelancer_id": proposal.freelancer_id,
        "project_id": proposal.project_id,
        "client_name": f"{proposal.client.first_name} {proposal.client.last_name}" if proposal.client else None,
        "freelancer_name": f"{proposal.freelancer.first_name} {proposal.freelancer.last_name}" if proposal.freelancer else None,
        "created_at": proposal.created_at.isoformat() if proposal.created_at else None,
        "time_ago": _time_ago(proposal.created_at) if proposal.created_at else None,
    }


def _serialize_payment(payment: Payment):
    project = payment.project
    client = project.client if project else None
    return {
        "id": payment.id,
        "amount": float(payment.amount or 0),
        "status": payment.status,
        "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
        "time_ago": _time_ago(payment.payment_date) if payment.payment_date else None,
        "project_title": project.title if project else "Untitled Project",
        "client_name": f"{client.first_name} {client.last_name}" if client else "Unknown Client",
    }


def _serialize_client_project(project: Project, contract: Optional[Contract]):
    freelancer = contract.freelancer if contract else None
    days_left = max(0, (project.deadline - datetime.now()).days) if project.deadline else 0
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "budget": float(project.budget or 0),
        "status": project.status,
        "progress": project.progress or 0,
        "deadline": project.deadline.isoformat() if project.deadline else None,
        "days_left": days_left,
        "freelancer_name": f"{freelancer.first_name} {freelancer.last_name}" if freelancer else "Not Hired Yet",
        "status_label": _status_label(project.progress or 0, days_left),
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "time_ago": _time_ago(project.created_at) if project.created_at else None,
    }


def _freelancer_overview(db: Session, freelancer_id: int):
    total_earnings = db.query(func.sum(Payment.amount)).join(Contract).filter(
        Contract.freelancer_id == freelancer_id,
        Payment.contract_id == Contract.id,
        Payment.status == "Completed",
    ).scalar() or 0.0

    pending_earnings = db.query(func.sum(Payment.amount)).join(Contract).filter(
        Contract.freelancer_id == freelancer_id,
        Payment.contract_id == Contract.id,
        Payment.status != "Completed",
    ).scalar() or 0.0

    active_contracts = db.query(Contract).filter(
        Contract.freelancer_id == freelancer_id,
        Contract.status == "Active",
    ).all()

    proposals = db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()
    accepted_proposals = [proposal for proposal in proposals if proposal.status == "Accepted"]

    profile_views = db.query(func.count(ActivityLog.id)).filter(
        ActivityLog.user_id == freelancer_id,
        ActivityLog.activity_type == "profile_view",
    ).scalar() or 0

    success_rate = round((len(accepted_proposals) / len(proposals)) * 100, 1) if proposals else 0.0

    return {
        "total_earnings": float(total_earnings),
        "pending_earnings": float(pending_earnings),
        "active_contracts": active_contracts,
        "proposals": proposals,
        "success_rate": success_rate,
        "profile_views": profile_views,
    }


def _growth_percentage(current: float, previous: float) -> float:
    if previous == 0:
        return float(current if current else 0)
    return round(((current - previous) / previous) * 100, 1)


def _client_overview(db: Session, client_id: int):
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    previous_month = 12 if current_month == 1 else current_month - 1
    previous_year = current_year - 1 if current_month == 1 else current_year

    total_spent = db.query(func.sum(Payment.amount)).join(Project).filter(
        Project.client_id == client_id,
        Payment.status == "Completed",
    ).scalar() or 0.0

    current_month_spent = db.query(func.sum(Payment.amount)).join(Project).filter(
        Project.client_id == client_id,
        Payment.status == "Completed",
        func.extract("month", Payment.payment_date) == current_month,
        func.extract("year", Payment.payment_date) == current_year,
    ).scalar() or 0.0

    previous_month_spent = db.query(func.sum(Payment.amount)).join(Project).filter(
        Project.client_id == client_id,
        Payment.status == "Completed",
        func.extract("month", Payment.payment_date) == previous_month,
        func.extract("year", Payment.payment_date) == previous_year,
    ).scalar() or 0.0

    active_projects = db.query(Project).filter(
        Project.client_id == client_id,
        Project.status == "In Progress",
    ).all()

    previous_active_count = db.query(Project).filter(
        Project.client_id == client_id,
        Project.status == "In Progress",
        Project.created_at < datetime(current_year, current_month, 1),
    ).count()

    hired_freelancers = db.query(func.count(func.distinct(Contract.freelancer_id))).join(Project).filter(
        Project.client_id == client_id,
    ).scalar() or 0

    avg_rating = db.query(func.avg(User.rating)).join(
        Contract, Contract.freelancer_id == User.id
    ).join(Project).filter(
        Project.client_id == client_id,
    ).scalar() or 0.0

    proposals = db.query(Proposal).filter(Proposal.client_id == client_id).all()
    accepted_proposals = [proposal for proposal in proposals if proposal.status == "Accepted"]

    return {
        "total_spent": float(total_spent),
        "total_spent_growth": _growth_percentage(float(current_month_spent), float(previous_month_spent)),
        "active_projects": active_projects,
        "active_projects_growth": len(active_projects) - previous_active_count,
        "hired_freelancers": hired_freelancers,
        "hired_freelancers_growth": hired_freelancers,
        "avg_rating": round(float(avg_rating), 1),
        "avg_rating_growth": round(float(avg_rating), 1),
        "proposals": proposals,
        "accepted_proposals": accepted_proposals,
    }

def get_dashboard_data(db: Session, client_id: int) -> DashboardResponse:
    overview = _client_overview(db, client_id)

    projects = db.query(Project).filter(
        Project.client_id == client_id,
        Project.status == "In Progress",
    ).all()

    active_list = []
    for p in projects:
        latest_contract = db.query(Contract).filter(Contract.project_id == p.id).first()
        active_list.append(_serialize_active_project(p, latest_contract))

    current_year = datetime.now().year

    spending_query = db.query(
        func.extract('month', Payment.payment_date).label('month'),
        func.sum(Payment.amount).label('total'),
    ).join(Project).filter(
        Project.client_id == client_id,
        func.extract('year', Payment.payment_date) == current_year,
    ).group_by('month').order_by('month').all()

    spending_map = {i: 0 for i in range(1, 13)}
    for month, total in spending_query:
        spending_map[int(month)] = total

    spending_months = [calendar.month_abbr[i] for i in range(1, 13)]
    spending_values = [spending_map[i] for i in range(1, 13)]

    timeline_query = db.query(
        func.extract('month', Project.created_at).label('month'),
        func.count(Project.id).label('count'),
    ).filter(
        Project.client_id == client_id,
        func.extract('year', Project.created_at) == current_year,
    ).group_by('month').order_by('month').all()

    timeline_map = {i: 0 for i in range(1, 13)}
    for month, count in timeline_query:
        timeline_map[int(month)] = count

    timeline_values = [timeline_map[i] for i in range(1, 13)]

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == client_id,
    ).order_by(ActivityLog.created_at.desc()).limit(5).all()

    activity_list = [_serialize_activity(log) for log in activities]

    client_user = db.query(User).filter(User.id == client_id).first()
    profile_data = {
        "full_name": f"{client_user.first_name} {client_user.last_name}" if client_user else "Account User",
        "role": client_user.role if client_user else "Client",
        "account_type": client_user.role if client_user else "Client",
    }

    return {
        "profile": profile_data,
        "stats": {
            "total_spent": round(overview["total_spent"], 2),
            "total_spent_growth": overview["total_spent_growth"],
            "active_projects": len(overview["active_projects"]),
            "active_projects_growth": overview["active_projects_growth"],
            "hired_freelancers": overview["hired_freelancers"],
            "hired_freelancers_growth": overview["hired_freelancers_growth"],
            "avg_rating": overview["avg_rating"],
            "avg_rating_growth": overview["avg_rating_growth"],
        },
        "spending_chart": {
            "months": spending_months,
            "spending": spending_values,
        },
        "project_timeline": {
            "months": spending_months,
            "projects_count": timeline_values,
        },
        "active_projects": active_list,
        "recent_activity": activity_list,
    }


def get_freelancer_dashboard_data(db: Session, freelancer_id: int):
    now = datetime.now()
    user = db.query(User).filter(User.id == freelancer_id).first()
    overview = _freelancer_overview(db, freelancer_id)
    active_contracts = overview["active_contracts"]

    project_rows = db.query(Project, Contract).join(
        Contract, Contract.project_id == Project.id
    ).filter(
        Contract.freelancer_id == freelancer_id,
        Contract.status == "Active",
    ).all()

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == freelancer_id,
    ).order_by(ActivityLog.created_at.desc()).limit(5).all()

    earnings_series = []
    for month in range(1, 13):
        month_total = db.query(func.sum(Payment.amount)).join(Contract).filter(
            Contract.freelancer_id == freelancer_id,
            func.extract('month', Payment.payment_date) == month,
            func.extract('year', Payment.payment_date) == now.year,
            Payment.status == "Completed",
        ).scalar() or 0
        earnings_series.append({"month": calendar.month_abbr[month], "earnings": float(month_total)})

    proposal_counts = {i: 0 for i in range(1, 13)}
    proposal_query = db.query(
        func.extract('month', Proposal.created_at).label('month'),
        func.count(Proposal.id).label('count'),
    ).filter(
        Proposal.freelancer_id == freelancer_id,
        func.extract('year', Proposal.created_at) == now.year,
    ).group_by('month').all()
    for month, count in proposal_query:
        proposal_counts[int(month)] = count

    return {
        "user": {
            "full_name": f"{user.first_name} {user.last_name}" if user else "Account User",
            "role": user.role if user else "Freelancer",
            "email": user.email if user else "",
            "rating": float(user.rating or 0) if user else 0.0,
            "initials": f"{user.first_name[:1]}{user.last_name[:1]}" if user else "FR",
        },
        "stats": {
            "activeProposals": len([proposal for proposal in overview["proposals"] if proposal.status in ["Under Review", "Pending"]]),
            "ongoingProjects": len(active_contracts),
            "activeProjects": len(active_contracts),
            "totalEarnings": overview["total_earnings"],
            "proposalsSent": len(overview["proposals"]),
            "successRate": overview["success_rate"],
            "profileViews": overview["profile_views"],
        },
        "proposals": [_serialize_proposal(proposal) for proposal in overview["proposals"]],
        "contracts": [
            {
                "id": contract.id,
                "project_id": contract.project_id,
                "amount": float(contract.amount or 0),
                "status": contract.status,
                "created_at": contract.created_at.isoformat() if contract.created_at else None,
            }
            for contract in active_contracts
        ],
        "earningsSeries": earnings_series,
        "projectTimeline": [
            {"month": calendar.month_abbr[i], "projects": proposal_counts[i]}
            for i in range(1, 13)
        ],
        "activeProjects": [
            _serialize_active_project(project, contract)
            for project, contract in project_rows
        ],
        "recentActivity": [_serialize_activity(activity) for activity in activities],
    }


def get_received_proposals(db: Session, client_id: int):
    proposals = db.query(Proposal).filter(Proposal.client_id == client_id).all()

    return {
        "proposals": [_serialize_proposal(proposal) for proposal in proposals],
    }


def update_client_proposal_status(db: Session, client_id: int, proposal_id: int, status: str):
    proposal = db.query(Proposal).filter(
        Proposal.id == proposal_id,
        Proposal.client_id == client_id,
    ).first()
    if not proposal:
        return None

    proposal.status = status
    db.commit()
    db.refresh(proposal)
    return _serialize_proposal(proposal)


def get_client_projects(db: Session, client_id: int):
    project_rows = db.query(Project).filter(
        Project.client_id == client_id,
    ).order_by(Project.created_at.desc()).all()

    projects = []
    for project in project_rows:
        contract = db.query(Contract).filter(Contract.project_id == project.id).first()
        projects.append(_serialize_client_project(project, contract))

    return {
        "projects": projects,
    }


def get_client_profile_data(db: Session, client_id: int):
    user = db.query(User).filter(User.id == client_id).first()
    overview = _client_overview(db, client_id)

    projects = db.query(Project).filter(
        Project.client_id == client_id,
    ).order_by(Project.created_at.desc()).all()

    recent_projects = []
    for project in projects[:5]:
        contract = db.query(Contract).filter(Contract.project_id == project.id).first()
        recent_projects.append(_serialize_client_project(project, contract))

    proposals = db.query(Proposal).filter(
        Proposal.client_id == client_id,
    ).order_by(Proposal.created_at.desc()).limit(6).all()

    payments = db.query(Payment).join(Project).filter(
        Project.client_id == client_id,
    ).order_by(Payment.payment_date.desc()).limit(6).all()

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == client_id,
    ).order_by(ActivityLog.created_at.desc()).limit(6).all()

    return {
        "profile": {
            "full_name": f"{user.first_name} {user.last_name}" if user else "Client",
            "email": user.email if user else "",
            "role": user.role if user else "Client",
            "member_since": user.created_at.isoformat() if user and user.created_at else None,
            "initials": f"{user.first_name[:1]}{user.last_name[:1]}" if user else "CL",
        },
        "overview": {
            "total_spent": round(overview["total_spent"], 2),
            "active_projects": len(overview["active_projects"]),
            "hired_freelancers": overview["hired_freelancers"],
            "avg_rating": overview["avg_rating"],
            "proposals_received": len(overview["proposals"]),
            "accepted_proposals": len(overview["accepted_proposals"]),
        },
        "projects": recent_projects,
        "received_proposals": [_serialize_proposal(proposal) for proposal in proposals],
        "payments": [_serialize_payment(payment) for payment in payments],
        "recent_activity": [_serialize_activity(activity) for activity in activities],
    }


def get_freelancer_proposals(db: Session, freelancer_id: int):
    proposals = db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()

    return {
        "proposals": [_serialize_proposal(proposal) for proposal in proposals],
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

    return _serialize_proposal(proposal)


def get_freelancer_profile_data(db: Session, freelancer_id: int):
    user = db.query(User).filter(User.id == freelancer_id).first()
    overview = _freelancer_overview(db, freelancer_id)

    active_projects = db.query(Project, Contract).join(
        Contract, Contract.project_id == Project.id
    ).filter(
        Contract.freelancer_id == freelancer_id,
        Contract.status == "Active",
    ).order_by(Project.deadline.asc()).all()

    recent_proposals = db.query(Proposal).filter(
        Proposal.freelancer_id == freelancer_id,
    ).order_by(Proposal.created_at.desc()).limit(5).all()

    payment_history = db.query(Payment).join(Contract).filter(
        Contract.freelancer_id == freelancer_id,
        Payment.contract_id == Contract.id,
    ).order_by(Payment.payment_date.desc()).limit(6).all()

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == freelancer_id,
    ).order_by(ActivityLog.created_at.desc()).limit(6).all()

    return {
        "profile": {
            "full_name": f"{user.first_name} {user.last_name}" if user else "Freelancer",
            "email": user.email if user else "",
            "role": user.role if user else "Freelancer",
            "rating": float(user.rating or 0) if user else 0.0,
            "member_since": user.created_at.isoformat() if user and user.created_at else None,
            "initials": f"{user.first_name[:1]}{user.last_name[:1]}" if user else "FR",
        },
        "overview": {
            "total_earnings": overview["total_earnings"],
            "pending_earnings": overview["pending_earnings"],
            "active_projects": len(overview["active_contracts"]),
            "proposals_sent": len(overview["proposals"]),
            "success_rate": overview["success_rate"],
            "profile_views": overview["profile_views"],
        },
        "active_projects": [
            _serialize_active_project(project, contract)
            for project, contract in active_projects
        ],
        "recent_proposals": [_serialize_proposal(proposal) for proposal in recent_proposals],
        "payment_history": [_serialize_payment(payment) for payment in payment_history],
        "recent_activity": [_serialize_activity(activity) for activity in activities],
    }


def get_freelancer_projects(db: Session, freelancer_id: int):
    applied_project_ids = {
        proposal.project_id
        for proposal in db.query(Proposal).filter(Proposal.freelancer_id == freelancer_id).all()
        if proposal.project_id
    }

    projects = db.query(Project).filter(Project.status == "Open").order_by(Project.created_at.desc()).all()
    return {
        "projects": [
            {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "budget": float(project.budget or 0),
                "status": project.status,
                "deadline": project.deadline.isoformat() if project.deadline else None,
                "days_left": max(0, (project.deadline - datetime.now()).days) if project.deadline else None,
                "client_name": f"{project.client.first_name} {project.client.last_name}" if project.client else "Unknown Client",
                "already_applied": project.id in applied_project_ids,
                "created_at": project.created_at.isoformat() if project.created_at else None,
                "time_ago": _time_ago(project.created_at) if project.created_at else None,
            }
            for project in projects
        ]
    }


def get_freelancer_earnings(db: Session, freelancer_id: int):
    overview = _freelancer_overview(db, freelancer_id)
    history = db.query(Payment).join(Contract).filter(
        Contract.freelancer_id == freelancer_id,
        Payment.contract_id == Contract.id,
    ).order_by(Payment.payment_date.desc()).all()

    monthly_totals = {i: 0.0 for i in range(1, 13)}
    current_year = datetime.now().year
    for payment in history:
        if payment.payment_date and payment.payment_date.year == current_year:
            monthly_totals[payment.payment_date.month] += float(payment.amount or 0)

    return {
        "summary": {
            "totalEarned": overview["total_earnings"],
            "availableBalance": overview["total_earnings"],
            "pending": overview["pending_earnings"],
        },
        "history": [_serialize_payment(payment) for payment in history[:10]],
        "monthly": [
            {"month": calendar.month_abbr[month], "amount": monthly_totals[month]}
            for month in range(1, 13)
        ],
    }
