import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load .env from project root
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

from src.database.core import engine, Base, SessionLocal
from src.projects.models import User, Project, Contract, Payment, ActivityLog, Proposal
from src.auth.service import get_password_hash

LOGIN_USERS = {
    "freelancer": {"email": "aarav.sharma@talentlink.app", "password": "Aarav@2026"},
    "client": {"email": "maria.garcia@northstar.io", "password": "Maria@2026"},
}


def current_year_date(month: int, day: int = 12) -> datetime:
    now = datetime.now()
    return datetime(now.year, month, day, 10, 30, 0)


def seed_all_data():
    db = SessionLocal()
    try:
        user_records = [
            {
                "key": "client_maria",
                "email": "maria.garcia@northstar.io",
                "first_name": "Maria",
                "last_name": "Garcia",
                "role": "Client",
                "rating": 0.0,
                "password": "Maria@2026",
            },
            {
                "key": "client_ethan",
                "email": "ethan.parker@cloudforge.ai",
                "first_name": "Ethan",
                "last_name": "Parker",
                "role": "Client",
                "rating": 0.0,
                "password": "Ethan@2026",
            },
            {
                "key": "freelancer_aarav",
                "email": "aarav.sharma@talentlink.app",
                "first_name": "Aarav",
                "last_name": "Sharma",
                "role": "Freelancer",
                "rating": 4.8,
                "password": "Aarav@2026",
            },
            {
                "key": "freelancer_lina",
                "email": "lina.choi@talentlink.app",
                "first_name": "Lina",
                "last_name": "Choi",
                "role": "Freelancer",
                "rating": 4.6,
                "password": "Lina@2026",
            },
            {
                "key": "freelancer_noah",
                "email": "noah.reed@talentlink.app",
                "first_name": "Noah",
                "last_name": "Reed",
                "role": "Freelancer",
                "rating": 4.7,
                "password": "Noah@2026",
            },
        ]

        users = {}
        for record in user_records:
            user = User(
                email=record["email"],
                first_name=record["first_name"],
                last_name=record["last_name"],
                role=record["role"],
                rating=record["rating"],
                password_hash=get_password_hash(record["password"]),
            )
            db.add(user)
            db.flush()
            users[record["key"]] = user

        project_records = [
            {
                "key": "northstar_brand_refresh",
                "title": "Northstar Website Brand Refresh",
                "description": "Modernize landing pages and conversion funnels for Q2 growth campaign.",
                "budget": 7200,
                "status": "In Progress",
                "progress": 68,
                "deadline": datetime.now() + timedelta(days=14),
                "created_at": current_year_date(1, 9),
                "client_key": "client_maria",
            },
            {
                "key": "northstar_admin_panel",
                "title": "Customer Success Admin Panel",
                "description": "Build operations dashboard for account health, retention alerts, and churn risk.",
                "budget": 9800,
                "status": "In Progress",
                "progress": 42,
                "deadline": datetime.now() + timedelta(days=23),
                "created_at": current_year_date(2, 18),
                "client_key": "client_maria",
            },
            {
                "key": "northstar_analytics",
                "title": "Product Analytics Integration",
                "description": "Instrument events and reporting pipelines for feature adoption insights.",
                "budget": 5600,
                "status": "Completed",
                "progress": 100,
                "deadline": datetime.now() - timedelta(days=22),
                "created_at": current_year_date(3, 5),
                "client_key": "client_maria",
            },
            {
                "key": "cloudforge_mobile",
                "title": "CloudForge Mobile MVP",
                "description": "Launch cross-platform MVP for field users with secure offline sync.",
                "budget": 12400,
                "status": "Open",
                "progress": 0,
                "deadline": datetime.now() + timedelta(days=40),
                "created_at": current_year_date(3, 20),
                "client_key": "client_ethan",
            },
        ]

        projects = {}
        for record in project_records:
            project = Project(
                title=record["title"],
                description=record["description"],
                budget=record["budget"],
                status=record["status"],
                progress=record["progress"],
                deadline=record["deadline"],
                budget_spent=0.0,
                created_at=record["created_at"],
                client_id=users[record["client_key"]].id,
            )
            db.add(project)
            db.flush()
            projects[record["key"]] = project

        contract_records = [
            {
                "key": "contract_brand_refresh",
                "project_key": "northstar_brand_refresh",
                "freelancer_key": "freelancer_aarav",
                "amount": 7200,
                "status": "Active",
                "created_at": current_year_date(1, 12),
            },
            {
                "key": "contract_admin_panel",
                "project_key": "northstar_admin_panel",
                "freelancer_key": "freelancer_lina",
                "amount": 9800,
                "status": "Active",
                "created_at": current_year_date(2, 21),
            },
            {
                "key": "contract_analytics",
                "project_key": "northstar_analytics",
                "freelancer_key": "freelancer_aarav",
                "amount": 5600,
                "status": "Completed",
                "created_at": current_year_date(3, 8),
            },
        ]

        contracts = {}
        for record in contract_records:
            contract = Contract(
                project_id=projects[record["project_key"]].id,
                freelancer_id=users[record["freelancer_key"]].id,
                amount=record["amount"],
                status=record["status"],
                created_at=record["created_at"],
            )
            db.add(contract)
            db.flush()
            contracts[record["key"]] = contract

        payment_records = [
            {
                "contract_key": "contract_brand_refresh",
                "project_key": "northstar_brand_refresh",
                "amount": 1800,
                "status": "Completed",
                "payment_date": current_year_date(1, 28),
            },
            {
                "contract_key": "contract_brand_refresh",
                "project_key": "northstar_brand_refresh",
                "amount": 2200,
                "status": "Completed",
                "payment_date": current_year_date(2, 26),
            },
            {
                "contract_key": "contract_admin_panel",
                "project_key": "northstar_admin_panel",
                "amount": 2500,
                "status": "Completed",
                "payment_date": current_year_date(3, 14),
            },
            {
                "contract_key": "contract_analytics",
                "project_key": "northstar_analytics",
                "amount": 5600,
                "status": "Completed",
                "payment_date": current_year_date(3, 24),
            },
        ]

        for record in payment_records:
            payment = Payment(
                contract_id=contracts[record["contract_key"]].id,
                project_id=projects[record["project_key"]].id,
                amount=record["amount"],
                status=record["status"],
                payment_date=record["payment_date"],
            )
            db.add(payment)

        proposal_records = [
            {
                "title": "Conversion-Focused Frontend Rebuild",
                "description": "Revamp navigation and landing modules with measurable funnel improvements.",
                "amount": 6400,
                "rate": 64,
                "status": "Under Review",
                "timeline": "5 weeks",
                "project_key": "northstar_brand_refresh",
                "client_key": "client_maria",
                "freelancer_key": "freelancer_aarav",
                "created_at": current_year_date(3, 9),
            },
            {
                "title": "Retention Analytics Dashboard Delivery",
                "description": "Implement role-based insights dashboard for customer success managers.",
                "amount": 7200,
                "rate": 72,
                "status": "Pending",
                "timeline": "6 weeks",
                "project_key": "northstar_admin_panel",
                "client_key": "client_maria",
                "freelancer_key": "freelancer_aarav",
                "created_at": current_year_date(3, 18),
            },
            {
                "title": "CloudForge Offline Sync Foundations",
                "description": "Design and implement resilient sync architecture for the mobile MVP.",
                "amount": 8800,
                "rate": 82,
                "status": "Accepted",
                "timeline": "7 weeks",
                "project_key": "cloudforge_mobile",
                "client_key": "client_ethan",
                "freelancer_key": "freelancer_aarav",
                "created_at": current_year_date(3, 25),
            },
            {
                "title": "UI Micro-Interactions Polish Pass",
                "description": "High-fidelity interaction polish for admin workflows and onboarding.",
                "amount": 3100,
                "rate": 55,
                "status": "Rejected",
                "timeline": "3 weeks",
                "project_key": "northstar_admin_panel",
                "client_key": "client_maria",
                "freelancer_key": "freelancer_aarav",
                "created_at": current_year_date(2, 27),
            },
            {
                "title": "Lead Scoring Automation",
                "description": "Build qualification workflow with CRM webhooks and scoring rules.",
                "amount": 5100,
                "rate": 58,
                "status": "Under Review",
                "timeline": "4 weeks",
                "project_key": "northstar_brand_refresh",
                "client_key": "client_maria",
                "freelancer_key": "freelancer_noah",
                "created_at": current_year_date(3, 19),
            },
        ]

        for record in proposal_records:
            proposal = Proposal(
                title=record["title"],
                description=record["description"],
                amount=record["amount"],
                rate=record["rate"],
                status=record["status"],
                timeline=record["timeline"],
                project_id=projects[record["project_key"]].id,
                client_id=users[record["client_key"]].id,
                freelancer_id=users[record["freelancer_key"]].id,
                created_at=record["created_at"],
            )
            db.add(proposal)

        activity_records = [
            {
                "user_key": "client_maria",
                "project_key": "northstar_brand_refresh",
                "description": "Posted milestone update for Northstar Website Brand Refresh.",
                "activity_type": "job_post",
                "created_at": datetime.now() - timedelta(hours=3),
            },
            {
                "user_key": "client_maria",
                "project_key": "northstar_admin_panel",
                "description": "Reviewed 2 incoming freelancer proposals.",
                "activity_type": "proposal",
                "created_at": datetime.now() - timedelta(hours=18),
            },
            {
                "user_key": "client_maria",
                "project_key": "northstar_analytics",
                "description": "Released final payment for Product Analytics Integration.",
                "activity_type": "payment",
                "created_at": datetime.now() - timedelta(days=2),
            },
            {
                "user_key": "freelancer_aarav",
                "project_key": "northstar_brand_refresh",
                "description": "Submitted sprint demo and QA report.",
                "activity_type": "contract",
                "created_at": datetime.now() - timedelta(hours=6),
            },
            {
                "user_key": "freelancer_aarav",
                "project_key": "northstar_admin_panel",
                "description": "Proposal moved to pending client review.",
                "activity_type": "proposal",
                "created_at": datetime.now() - timedelta(days=1),
            },
            {
                "user_key": "freelancer_aarav",
                "project_key": "northstar_brand_refresh",
                "description": "Client viewed profile details.",
                "activity_type": "profile_view",
                "created_at": datetime.now() - timedelta(days=1, hours=2),
            },
            {
                "user_key": "freelancer_aarav",
                "project_key": "northstar_analytics",
                "description": "Client viewed profile portfolio samples.",
                "activity_type": "profile_view",
                "created_at": datetime.now() - timedelta(days=4),
            },
        ]

        for record in activity_records:
            activity = ActivityLog(
                user_id=users[record["user_key"]].id,
                project_id=projects[record["project_key"]].id,
                description=record["description"],
                activity_type=record["activity_type"],
                created_at=record["created_at"],
            )
            db.add(activity)

        db.commit()

        print("Database seeded with realistic dashboard and proposal data.")
        print("Client login:", LOGIN_USERS["client"]["email"], "/", LOGIN_USERS["client"]["password"])
        print("Freelancer login:", LOGIN_USERS["freelancer"]["email"], "/", LOGIN_USERS["freelancer"]["password"])
    except Exception as e:
        db.rollback()
        print("Error while seeding data:", e)
        raise
    finally:
        db.close()


def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Seeding data...")
    seed_all_data()
    print("Database reset complete.")


if __name__ == "__main__":
    reset_db()
