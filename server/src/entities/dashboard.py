from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

# --- 1. Top Stats Cards ---
class DashboardStats(BaseModel):
    total_spent: Decimal          
    total_spent_growth: float     
    active_projects: int          
    active_projects_growth: int   
    hired_freelancers: int        
    hired_freelancers_growth: int 
    avg_rating: float             
    avg_rating_growth: float      

# --- 2. Spending Graph (Blue Line) ---
class SpendingChartData(BaseModel):
    months: List[str]             
    spending: List[float]         

# --- 3. Projects Timeline (Purple Bars) ---
class ProjectTimelineData(BaseModel):
    months: List[str]
    projects_count: List[int]

# --- 4. Active Projects List ---
class ActiveProjectItem(BaseModel):
    id: int
    title: str                    
    freelancer_name: str          
    status_label: str             
    progress: int                 
    days_left: int                

# --- 5. Recent Activity Feed ---
class ActivityItem(BaseModel):
    id: int
    description: str              
    time_ago: str                 
    type: str                     

# --- MAIN RESPONSE ---
class DashboardResponse(BaseModel):
    stats: DashboardStats
    spending_chart: SpendingChartData
    project_timeline: ProjectTimelineData
    active_projects: List[ActiveProjectItem]
    recent_activity: List[ActivityItem]