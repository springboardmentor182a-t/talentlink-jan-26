@router.get("/")
def list_projects(category: str = None, min_budget: int = 0):
    # This filters the database based on what you select in the UI
    query = db.query(models.Project)
    if category:
        query = query.filter(models.Project.category == category)
    return query.all()