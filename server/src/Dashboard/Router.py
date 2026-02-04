@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return {
        "active_projects": 3,
        "pending_proposals": 12,
        "total_earnings": 4500,
        "profile_views": 247
    }