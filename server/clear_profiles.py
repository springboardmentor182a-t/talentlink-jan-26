from src.database.core import SessionLocal
from src.entities.user import User  # noqa: F401 — needed for SQLAlchemy relationship resolution
from src.users.models import FreelancerProfile, ClientProfile, Proposal

db = SessionLocal()
db.query(Proposal).delete()
db.query(FreelancerProfile).delete()
db.query(ClientProfile).delete()
db.commit()
db.close()
print("Proposals and profiles cleared")
