from src.database.core import SessionLocal, engine, Base
from src.entities.project import Project
from src.entities.user import User
from src.entities.contract import Contract, Milestone
from src.entities.proposal import Proposal
from src.auth.service import hash_password

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data(clear=False):
    db = SessionLocal()
    
    if clear:
        db.query(Milestone).delete()
        db.query(Contract).delete()
        db.query(Project).delete()
        db.query(User).delete()
        db.commit()

    # Check if data exists
    if not clear and (db.query(Project).count() > 0 or db.query(User).count() > 0):
        print("Data already exists. Use clear=True to re-seed.")
        return

    # Seed User
    sample_user = User(
        name="Intern User",
        email="intern@example.com",
        password="$2b$12$6p/4FGy8i5kr2YBDh.F0Picbqx4m5v6", # Pre-hashed 'password123'
        role="client"
    )
    db.add(sample_user)

    projects = [
        Project(
            title="Build a React E-commerce Platform",
            category="React, TypeScript, Node.js, Stripe",
            budget="$8,000",
            status="open"
        ),
        Project(
            title="Mobile App UI/UX Design",
            category="Figma, UI Design, UX Research, Mobile Design",
            budget="$3,500",
            status="in progress"
        ),
        Project(
            title="WordPress Blog Development",
            category="WordPress, PHP, SEO, CSS",
            budget="$2,000",
            status="completed"
        ),
         Project(
            title="Python Data Scraping Script",
            category="Python, BeautifulSoup, Selenium",
            budget="$500",
            status="open"
        ),
         Project(
            title="Corporate Branding Identity",
            category="Graphic Design, Branding, Illustrator",
            budget="$4,000",
            status="in progress"
        )
    ]

    for project in projects:
        db.add(project)
    
    # Seed Contracts
    contract1 = Contract(
        title="Mobile App UI/UX Design",
        freelancer_name="David Kim",
        status="active",
        contract_value="$3,200",
        milestones_total=3
    )
    db.add(contract1)
    db.flush() # Get ID

    milestones1 = [
        Milestone(contract_id=contract1.id, title="User Research & Wireframes", amount="$1,000", status="completed"),
        Milestone(contract_id=contract1.id, title="High-Fidelity Mockups", amount="$1,200", status="in-progress"),
        Milestone(contract_id=contract1.id, title="Final Deliverables & Handoff", amount="$1,000", status="pending"),
    ]
    for m in milestones1:
        db.add(m)

    contract2 = Contract(
        title="WordPress Blog Development",
        freelancer_name="Lisa Martinez",
        status="completed",
        contract_value="$2,000",
        milestones_total=1,
        end_date="1/15/2026"
    )
    db.add(contract2)
    db.flush()

    milestone2 = Milestone(contract_id=contract2.id, title="Full Site Delivery", amount="$2,000", status="completed")
    db.add(milestone2)

    # Add more Project data
    project3 = Project(title="AI Chatbot Integration", category="Python, OpenAI, API", budget="$12,000", status="open")
    db.add(project3)
    db.flush()

    extra_projects = [
        Project(title="SEO Optimization for SaaS", category="SEO, Content, Marketing", budget="$1,500", status="completed"),
    ]
    for p in extra_projects:
        db.add(p)
    
    # Seed Proposals
    proposals = [
        Proposal(
            project_id=project3.id,
            freelancer_name="Sarah Jenkins",
            amount="$10,000",
            cover_letter="I have extensive experience with OpenAI API and building scalable chatbots.",
            status="pending"
        ),
        Proposal(
            project_id=project3.id,
            freelancer_name="Michael Chen",
            amount="$11,500",
            cover_letter="Senior Python developer specialized in LLM integrations.",
            status="pending"
        )
    ]
    for prop in proposals:
        db.add(prop)

    db.commit()
    print("Database (PostgreSQL) enriched with dummy data!")
    db.close()

if __name__ == "__main__":
    import sys
    clear = "--clear" in sys.argv
    seed_data(clear=clear)
