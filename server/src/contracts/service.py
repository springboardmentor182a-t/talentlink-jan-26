from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.entities.contract import Contract, ContractMilestone
from src.contracts.models import ContractCreate, ContractEditTerms


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _calc_progress(contract: Contract) -> int:
    """Return milestone completion as 0-100 integer. 0 if no milestones."""
    total = len(contract.milestones)
    if total == 0:
        return 0
    done = sum(1 for m in contract.milestones if m.is_completed)
    return round(done / total * 100)


def _resolve_parties(db: Session, contract: Contract) -> tuple[int, int]:
    """Return (client_user_id, freelancer_user_id) — both in the users.id space.

    Two FK translation steps are required:

    1. Proposal.freelancer_id is profiles_freelancer.id, NOT users.id.
       FreelancerProfile lookup translates it to FreelancerProfile.user_id.

    2. Project.client_id is profiles_client.id, NOT users.id.
       ClientProfile lookup translates it to ClientProfile.user_id.

    Without both lookups every permission check silently compares the wrong
    ID space and produces incorrect 403/200 responses.
    """
    from src.users.models import Proposal      # noqa: PLC0415
    from src.projects.models import Project        # noqa: PLC0415
    from src.users.models import FreelancerProfile  # noqa: PLC0415
    from src.users.models import ClientProfile      # noqa: PLC0415

    proposal = db.query(Proposal).filter(Proposal.id == contract.proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Contract is linked to a missing proposal -- data integrity error",
        )
    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proposal is linked to a missing project -- data integrity error",
        )

    # project.client_id is profiles_client.id — resolve to users.id
    client_profile = db.query(ClientProfile).filter(
        ClientProfile.id == project.client_id
    ).first()
    if not client_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Project linked to missing client profile -- data integrity error",
        )

    # proposal.freelancer_id is profiles_freelancer.id — resolve to users.id
    freelancer_profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.id == proposal.freelancer_id
    ).first()
    if not freelancer_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proposal linked to missing freelancer profile -- data integrity error",
        )

    return client_profile.user_id, freelancer_profile.user_id


def _assert_party(db: Session, contract: Contract, user_id: int) -> None:
    """Raise 403 if user_id is neither the client nor the freelancer on this contract."""
    client_id, freelancer_id = _resolve_parties(db, contract)
    if user_id not in (client_id, freelancer_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this contract",
        )


class ContractService:

    # ── Create ─────────────────────────────────────────────────────────────────

    @staticmethod
    def create_contract(db: Session, data: ContractCreate, client_id: int) -> dict:
        """Client only. Validates proposal ownership, creates contract in draft."""
        from src.users.models import Proposal  # noqa: PLC0415
        from src.projects.models import Project    # noqa: PLC0415

        proposal = db.query(Proposal).filter(Proposal.id == data.proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

        project = db.query(Project).filter(Project.id == proposal.project_id).first()
        if not project or project.client_id != client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This proposal does not belong to one of your projects",
            )

        if hasattr(proposal, "contract") and proposal.contract is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contract already exists for this proposal",
            )

        # Belt-and-suspenders: also check directly in case the ORM relationship
        # isn't wired yet (proposal→contract back-ref is commented out pending merge).
        existing = db.query(Contract).filter(Contract.proposal_id == data.proposal_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contract already exists for this proposal",
            )

        contract = Contract(
            proposal_id=data.proposal_id,
            title=data.title,
            budget=data.budget,
            terms=data.terms,
            start_date=data.start_date,
            end_date=data.end_date,
            status="draft",
        )
        db.add(contract)
        db.flush()  # get contract.id before adding milestones

        for m in (data.milestones or []):
            db.add(ContractMilestone(
                contract_id=contract.id,
                title=m.title,
                due_date=m.due_date,
            ))

        db.commit()
        db.refresh(contract)
        return ContractService._to_response_dict(contract)

    # ── Read ───────────────────────────────────────────────────────────────────

    @staticmethod
    def get_contracts(db: Session, user_id: int, role: str) -> list[dict]:
        """Return all contracts where user is the client or freelancer.

        Joins through proposal to identify both parties without storing
        client_id/freelancer_id directly on the contract.

        For the freelancer branch we must join through FreelancerProfile because
        Proposal.freelancer_id is profiles_freelancer.id, not users.id.
        """
        from src.users.models import Proposal      # noqa: PLC0415
        from src.projects.models import Project        # noqa: PLC0415
        from src.users.models import FreelancerProfile  # noqa: PLC0415

        if role == "client":
            contracts = (
                db.query(Contract)
                .join(Proposal, Proposal.id == Contract.proposal_id)
                .join(Project, Project.id == Proposal.project_id)
                .filter(Project.client_id == user_id)
                .all()
            )
        else:
            # Proposal.freelancer_id -> FreelancerProfile.id -> FreelancerProfile.user_id
            contracts = (
                db.query(Contract)
                .join(Proposal, Proposal.id == Contract.proposal_id)
                .join(FreelancerProfile, FreelancerProfile.id == Proposal.freelancer_id)
                .filter(FreelancerProfile.user_id == user_id)
                .all()
            )

        return [ContractService._to_response_dict(c) for c in contracts]

    @staticmethod
    def get_contract(db: Session, contract_id: int, user_id: int) -> dict:
        """Return a single contract. Raises 403 if user is not a party."""
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
        _assert_party(db, contract, user_id)
        return ContractService._to_response_dict(contract)

    # ── Status transitions ─────────────────────────────────────────────────────

    @staticmethod
    def send_contract(db: Session, contract_id: int, client_id: int) -> dict:
        """Client only. Transitions draft → pending_sign."""
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        owner_client_id, _ = _resolve_parties(db, contract)
        if owner_client_id != client_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your contract")

        if contract.status != "draft":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot send a contract with status '{contract.status}' — must be 'draft'",
            )

        contract.status = "pending_sign"
        db.commit()
        db.refresh(contract)
        return ContractService._to_response_dict(contract)

    @staticmethod
    def sign_contract(db: Session, contract_id: int, freelancer_id: int) -> dict:
        """Freelancer only. Transitions pending_sign → active. Sets start_date if unset."""
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        _, owner_freelancer_id = _resolve_parties(db, contract)
        if owner_freelancer_id != freelancer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your contract")

        if contract.status != "pending_sign":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot sign a contract with status '{contract.status}' — must be 'pending_sign'",
            )

        contract.status = "active"
        if contract.start_date is None:
            contract.start_date = _utcnow()

        db.commit()
        db.refresh(contract)
        return ContractService._to_response_dict(contract)

    @staticmethod
    def edit_terms(db: Session, contract_id: int, data: ContractEditTerms, freelancer_id: int) -> dict:
        """Freelancer only. Updates terms and transitions to rejected (back to client)."""
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        _, owner_freelancer_id = _resolve_parties(db, contract)
        if owner_freelancer_id != freelancer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your contract")

        if contract.status != "pending_sign":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Terms can only be edited when status is 'pending_sign', not '{contract.status}'",
            )

        contract.terms  = data.terms
        contract.status = "rejected"
        db.commit()
        db.refresh(contract)
        return ContractService._to_response_dict(contract)

    @staticmethod
    def renegotiate_contract(
        db: Session, contract_id: int, data, client_id: int
    ) -> dict:
        """Client only. Counter-proposes updated terms/budget on a rejected contract.

        Transitions rejected → pending_sign, giving the ball back to the freelancer.
        Requires at least one of terms or budget to be set — an empty renegotiation
        is rejected with 400 to prevent the client from re-sending without changes.
        """
        from src.contracts.models import ContractRenegotiate  # noqa: PLC0415

        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        owner_client_id, _ = _resolve_parties(db, contract)
        if owner_client_id != client_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your contract")

        if contract.status != "rejected":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Can only renegotiate a contract with status 'rejected', not '{contract.status}'",
            )

        if data.terms is None and data.budget is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provide at least one of 'terms' or 'budget' to renegotiate",
            )

        if data.terms is not None:
            contract.terms = data.terms
        if data.budget is not None:
            contract.budget = data.budget

        contract.status = "pending_sign"
        db.commit()
        db.refresh(contract)
        return ContractService._to_response_dict(contract)

    @staticmethod
    def cancel_contract(db: Session, contract_id: int, user_id: int) -> dict:
        """Cancel a contract. Role-restricted by status:

        - pending_sign: either party can cancel (freelancer hasn't signed yet,
          client may have changed their mind).
        - active: client only. A freelancer cannot unilaterally walk out of a
          signed contract — they must request cancellation through the client.
        """
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

        _assert_party(db, contract, user_id)

        if contract.status not in ("active", "pending_sign"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel a contract with status '{contract.status}'",
            )

        # Active contracts: client-only cancellation.
        # Freelancers can cancel pending_sign (before signing) but not active.
        if contract.status == "active":
            client_id, _ = _resolve_parties(db, contract)
            if user_id != client_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the client can cancel an active contract",
                )

        contract.status = "cancelled"
        db.commit()
        db.refresh(contract)
        return ContractService._to_response_dict(contract)

    # ── Milestones ─────────────────────────────────────────────────────────────

    @staticmethod
    def update_milestone(
        db: Session,
        milestone_id: int,
        is_completed: bool,
        freelancer_id: int,
    ) -> dict:
        """Freelancer only. Marks milestone complete/incomplete.
        Auto-completes the contract when all milestones are done.
        """
        milestone = db.query(ContractMilestone).filter(ContractMilestone.id == milestone_id).first()
        if not milestone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

        contract = milestone.contract
        _, owner_freelancer_id = _resolve_parties(db, contract)
        if owner_freelancer_id != freelancer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the freelancer on this contract",
            )

        if contract.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Milestones can only be updated on active contracts",
            )

        milestone.is_completed = is_completed
        db.flush()

        # Auto-complete: only when there is at least one milestone and all are done.
        # all([]) returns True for an empty list — without the length guard a contract
        # with no milestones would auto-complete on the first milestone update call,
        # which is unreachable in practice but would be a silent logic bug if it ever ran.
        if contract.milestones and all(m.is_completed for m in contract.milestones):
            contract.status = "completed"

        db.commit()
        db.refresh(contract)
        return ContractService._to_response_dict(contract)

    # ── Internal ───────────────────────────────────────────────────────────────

    @staticmethod
    def _to_response_dict(contract: Contract) -> dict:
        """Serialize a Contract ORM object to a dict matching ContractResponse.

        progress is computed here — it is never stored as a DB column.
        """
        return {
            "id":          contract.id,
            "proposal_id": contract.proposal_id,
            "title":       contract.title,
            "budget":      contract.budget,
            "terms":       contract.terms,
            "start_date":  contract.start_date,
            "end_date":    contract.end_date,
            "status":      contract.status,
            "milestones":  contract.milestones,
            "progress":    _calc_progress(contract),
            "created_at":  contract.created_at,
        }