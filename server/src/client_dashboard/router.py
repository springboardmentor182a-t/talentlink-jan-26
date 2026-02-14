from fastapi import APIRouter, Depends
from .service import ClientDashboardService
from .schemas import DashboardStats, ProjectSummary, ChartData, UnreadMessages
from typing import List
from sqlalchemy.orm import Session
from src.database.core import get_db

router = APIRouter(prefix="/api/client", tags=["Client Dashboard"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return ClientDashboardService.get_dashboard_stats(db)

@router.get("/dashboard/recent-projects", response_model=List[ProjectSummary])
def get_recent_projects(db: Session = Depends(get_db)):
    return ClientDashboardService.get_recent_projects(db)

@router.get("/dashboard/charts", response_model=ChartData)
def get_chart_data():
    return ClientDashboardService.get_chart_data()

@router.get("/messages/unread-count", response_model=UnreadMessages)
def get_unread_messages_count():
    return ClientDashboardService.get_unread_messages_count()
