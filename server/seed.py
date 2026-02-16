from src.database.core import SessionLocal, engine, Base
from src.projects.models import User, Project, Contract
from datetime import datetime, timedelta

# 1. Create Tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_data():
    # Check if data exists
    if db.query(User).filter_by(id=1).first():
        print("Data already exists!")
        return

    print("Seeding data...")

    # --- 1. Create the Client (User) ---
    client = User(id=1, username="client_demo", full_name="Client User")
    freelancer = User(id=2, username="sarah_j", full_name="Sarah Johnson")
    db.add_all([client, freelancer])
    db.commit()

    # --- 2. Create Active Projects ---
    p1 = Project(
        client_id=1,
        title="Website Redesign",
        status="In Progress",
        progress=80,
        deadline=datetime.now() + timedelta(days=4),
        budget_spent=1200.00
    )
    
    p2 = Project(
        client_id=1,
        title="Mobile App Development",
        status="In Progress",
        progress=35,
        deadline=datetime.now() + timedelta(days=18),
        budget_spent=3500.00
    )
    
    p3 = Project(
        client_id=1,
        title="SEO Optimization",
        status="In Progress",
        progress=95,
        deadline=datetime.now() + timedelta(days=1),
        budget_spent=500.00
    )

    db.add_all([p1, p2, p3])
    db.commit()

    # --- 3. Create Contracts ---
    c1 = Contract(project_id=p1.id, freelancer_id=2, amount=1200.00)
    c2 = Contract(project_id=p2.id, freelancer_id=2, amount=3500.00)
    
    # Adding a "Completed" project just to boost the total spent figure
    p_old = Project(client_id=1, title="Old Project", status="Completed", budget_spent=44220.00)
    db.add(p_old)
    db.commit()
    
    c3 = Contract(project_id=p_old.id, freelancer_id=2, amount=44220.00)
    db.add(c3)
    
    db.commit()
    print("✅ Success! Database populated with Figma data.")

if __name__ == "__main__":
    seed_data()
    db.close()
