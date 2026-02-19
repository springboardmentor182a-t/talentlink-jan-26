from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_stats():
    return {
        "user": "John",
        "stats": {
            "active_projects": 3,
            "pending_proposals": 12,
            "total_earnings": "$4.5k",
            "profile_views": 247
        },
        "active_contract": {
            "title": "Website Redesign",
            "due": "5 days",
            "progress": 75
        }
    }