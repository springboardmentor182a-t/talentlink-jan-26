from src.database.core import SessionLocal
from src.entities.user import User
from src.users.models import ClientProfile, FreelancerProfile, Proposal
from src.entities.project import Project
from src.entities.contract import Contract

def seed():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            print("User 1 not found!")
            return

        # 1. Create Profiles for User 1
        client_prof = db.query(ClientProfile).filter(ClientProfile.user_id == 1).first()
        if not client_prof:
            client_prof = ClientProfile(id=1, user_id=1, company_name="Mock Corp")
            db.add(client_prof)
            
        free_prof = db.query(FreelancerProfile).filter(FreelancerProfile.user_id == 1).first()
        if not free_prof:
            free_prof = FreelancerProfile(id=1, user_id=1, full_name="Mock Freelancer")
            db.add(free_prof)
            
        db.commit()

        # 2. Create Project
        project = db.query(Project).filter(Project.id == 101).first()
        if not project:
            project = Project(id=101, title="Mock Project", description="Test", budget=2000, client_id=1)
            db.add(project)
        else:
            project.client_id = 1
        db.commit()

        # 3. Create Proposal
        proposal = db.query(Proposal).filter(Proposal.id == 101).first()
        if not proposal:
            proposal = Proposal(id=101, project_id=101, freelancer_id=1, cover_letter="Test", bid_amount=2000)
            db.add(proposal)
        db.commit()

        print("Successfully seeded Golden Chain mock data! Dashboard will now show Contract 1.")

    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
