from .schemas import DashboardStats, ProjectSummary, ChartData, UnreadMessages
from src.entities.project import Project
from sqlalchemy.orm import Session
from sqlalchemy import func

class ClientDashboardService:
    @staticmethod
    def get_dashboard_stats(db: Session):
        # Calculate stats from DB
        active_projects_count = db.query(Project).filter(Project.status == 'in progress').count()
        completed_projects_count = db.query(Project).filter(Project.status == 'completed').count()
        # For now, we mock pending proposals and contracts as we don't have tables for them yet
        
        return DashboardStats(
            active_projects=active_projects_count,
            pending_proposals=2, 
            active_contracts=1,
            completed_projects=completed_projects_count
        )

    @staticmethod
    def get_recent_projects(db: Session):
        projects = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
        return [
            ProjectSummary(
                id=p.id,
                title=p.title,
                category=p.category,
                budget=p.budget,
                status=p.status
            ) for p in projects
        ]

    @staticmethod
    def get_chart_data():
        return ChartData(data=[
            {"name": "Mon", "value": 10},
            {"name": "Tue", "value": 15},
            {"name": "Wed", "value": 8},
            {"name": "Thu", "value": 20},
            {"name": "Fri", "value": 18},
            {"name": "Sat", "value": 25},
            {"name": "Sun", "value": 22},
        ])

    @staticmethod
    def get_unread_messages_count():
        return UnreadMessages(count=3)
