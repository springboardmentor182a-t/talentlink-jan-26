"""
Safe seed script — adds 1 client + 1 freelancer with full data.
Checks existing data before inserting — will NOT duplicate or delete anything.
Run: python seed.py  (from your server folder)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database.core import SessionLocal
from src.entities.user import User
from src.projects.model import Project
from src.proposals.model import Proposal
from src.entities.contract import Contract
from src.messages.model import Message
from src.reviews.model import Review
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(p): return pwd_context.hash(p)

def seed():
    db = SessionLocal()
    try:
        print("🌱 Starting safe seed...\n")

        # ── 1. Client ──────────────────────────────────────────────
        client_email = "testclient@talentlink.com"
        client = db.query(User).filter(User.email == client_email).first()
        if client:
            print(f"  ⏭  Client already exists: {client.name} (id={client.id})")
        else:
            client = User(
                name       = "Test Client",
                email      = client_email,
                password   = hash_password("password123"),
                role       = "client",
                bio        = "We build innovative digital products.",
                location   = "New York, USA",
            )
            db.add(client)
            db.commit()
            db.refresh(client)
            print(f"  ✅ Client created: {client.name} (id={client.id})")

        # ── 2. Freelancer ──────────────────────────────────────────
        freelancer_email = "testfreelancer@talentlink.com"
        freelancer = db.query(User).filter(User.email == freelancer_email).first()
        if freelancer:
            print(f"  ⏭  Freelancer already exists: {freelancer.name} (id={freelancer.id})")
        else:
            freelancer = User(
                name       = "Test Freelancer",
                email      = freelancer_email,
                password   = hash_password("password123"),
                role       = "freelancer",
                skills     = "React, Python, Django",
                experience = "2 years of full-stack development",
                bio        = "Full-stack developer specializing in React and Django.",
                location   = "London, UK",
            )
            db.add(freelancer)
            db.commit()
            db.refresh(freelancer)
            print(f"  ✅ Freelancer created: {freelancer.name} (id={freelancer.id})")

        # ── 3. Project ─────────────────────────────────────────────
        project_title = "Test E-commerce Website"
        project = db.query(Project).filter(
            Project.title     == project_title,
            Project.client_id == client.id
        ).first()
        if project:
            print(f"  ⏭  Project already exists: {project.title} (id={project.id})")
        else:
            project = Project(
                title       = project_title,
                description = "Build a simple e-commerce website with product listing, cart, and checkout using React and Django REST API.",
                skills      = "React, Django, Python",
                budget      = 3000,
                deadline    = "2025-06-30",
                status      = "in-progress",
                client_id   = client.id,
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print(f"  ✅ Project created: {project.title} (id={project.id})")

        # ── 4. Proposal ────────────────────────────────────────────
        proposal = db.query(Proposal).filter(
            Proposal.project_id    == project.id,
            Proposal.freelancer_id == freelancer.id
        ).first()
        if proposal:
            print(f"  ⏭  Proposal already exists (id={proposal.id})")
        else:
            proposal = Proposal(
                project_id      = project.id,
                freelancer_id   = freelancer.id,
                cover_letter    = "I am excited to work on this e-commerce project. I have strong React and Django skills and can deliver within the timeline.",
                proposed_budget = 2800,
                delivery_time   = "30 days",
                status          = "accepted",
            )
            db.add(proposal)
            db.commit()
            db.refresh(proposal)
            print(f"  ✅ Proposal created (id={proposal.id})")

        # ── 5. Contract ────────────────────────────────────────────
        contract = db.query(Contract).filter(
            Contract.project_id    == project.id,
            Contract.freelancer_id == freelancer.id
        ).first()
        if contract:
            print(f"  ⏭  Contract already exists (id={contract.id})")
        else:
            contract = Contract(
                project_id       = project.id,
                client_id        = client.id,
                freelancer_id    = freelancer.id,
                title            = project.title,
                freelancer_name  = freelancer.name,
                status           = "active",
                contract_value   = "2800",
                start_date       = datetime.utcnow(),
                end_date         = "2025-06-30",
                milestones_total = 2,
            )
            db.add(contract)
            db.commit()
            db.refresh(contract)
            print(f"  ✅ Contract created (id={contract.id})")

        # ── 5b. Milestones ─────────────────────────────────────────
        from src.entities.contract import Milestone
        milestone = db.query(Milestone).filter(
            Milestone.contract_id == contract.id
        ).first()
        if milestone:
            print(f"  ⏭  Milestones already exist")
        else:
            db.add(Milestone(
                contract_id = contract.id,
                title       = "Phase 1 — Frontend Setup",
                amount      = "1400",
                status      = "completed",
            ))
            db.add(Milestone(
                contract_id = contract.id,
                title       = "Phase 2 — Backend & Integration",
                amount      = "1400",
                status      = "pending",
            ))
            db.commit()
            print(f"  ✅ Milestones created (2 milestones)")

        # ── 6. Messages ────────────────────────────────────────────
        msg = db.query(Message).filter(
            Message.sender_id   == client.id,
            Message.receiver_id == freelancer.id
        ).first()
        if msg:
            print(f"  ⏭  Messages already exist")
        else:
            db.add(Message(
                sender_id   = client.id,
                receiver_id = freelancer.id,
                content     = "Hi! Looking forward to working with you on this project.",
                is_read     = True,
                created_at  = datetime.utcnow(),
            ))
            db.add(Message(
                sender_id   = freelancer.id,
                receiver_id = client.id,
                content     = "Thank you! I will start right away and keep you updated.",
                is_read     = False,
                created_at  = datetime.utcnow(),
            ))
            db.commit()
            print(f"  ✅ Messages created (2 messages)")

        # ── 7. Review ──────────────────────────────────────────────
        # Review uses project_name (string) not project_id FK
        review = db.query(Review).filter(
            Review.reviewer_id == client.id,
            Review.reviewee_id == freelancer.id,
        ).first()
        if review:
            print(f"  ⏭  Review already exists (id={review.id})")
        else:
            review = Review(
                reviewer_id  = client.id,
                reviewee_id  = freelancer.id,
                project_name = project.title,
                rating       = 5,
                comment      = "Excellent work! Delivered on time and exceeded expectations. Highly recommended.",
                created_at   = datetime.utcnow(),
            )
            db.add(review)
            db.commit()
            db.refresh(review)
            print(f"  ✅ Review created (id={review.id})")

        # ── Summary ────────────────────────────────────────────────
        print()
        print("=" * 48)
        print("🎉 Seed complete! Login credentials:")
        print("=" * 48)
        print("  CLIENT:")
        print("    Email   : testclient@talentlink.com")
        print("    Password: password123")
        print()
        print("  FREELANCER:")
        print("    Email   : testfreelancer@talentlink.com")
        print("    Password: password123")
        print("=" * 48)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()