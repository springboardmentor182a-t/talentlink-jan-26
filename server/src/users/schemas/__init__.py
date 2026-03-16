# server/src/users/schemas/__init__.py
# Re-exports all schema names so callers can use:
# from src.users.schemas import UserCreate
# instead of the longer split-file path.

from src.users.schemas.user import (
    UserRole,
    UserBase,
    UserCreate,
    UserResponse,
)
from src.users.schemas.freelancer import (
    FreelancerProfileBase,
    FreelancerProfileCreate,
    FreelancerProfileResponse,
)
from src.users.schemas.client import (
    ClientProfileBase,
    ClientProfileCreate,
    ClientProfileResponse,
)

# --- YOUR NEW PROPOSAL SCHEMAS ---
from .proposal import (
    ProposalBase,
    ProposalCreate,
    ProposalResponse,
)

__all__ = [
    "UserRole", "UserBase", "UserCreate", "UserResponse",
    "FreelancerProfileBase", "FreelancerProfileCreate", "FreelancerProfileResponse",
    "ClientProfileBase", "ClientProfileCreate", "ClientProfileResponse",
    "ProposalBase", "ProposalCreate", "ProposalResponse",  # <-- Added your proposals!
]