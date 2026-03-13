# server/tests/test_contracts_service.py
"""
Tests for the contracts feature — service layer.

The contracts service does lazy imports:
    from src.entities.proposal import Proposal
    from src.entities.project import Project

Neither module exists yet (blocked on the proposals branch). We patch
sys.modules so those imports resolve to:
  - Proposal  ->  src.users.models.Proposal  (already in the codebase)
  - Project   ->  a minimal SQLAlchemy model defined here

Proposal.freelancer_id is an int FK to profiles_freelancer.id in production,
but the service only reads the integer value, so we store plain user IDs there.
SQLite doesn't enforce FKs, so no real FreelancerProfile rows are needed.
"""

import sys
import types
import pytest
from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy import Column, Integer

from src.database.core import Base
from src.users.models import Proposal, FreelancerProfile  # already in the codebase
from src.entities.contract import Contract, ContractMilestone
from src.contracts.service import ContractService
from src.contracts.models import ContractCreate, ContractEditTerms, MilestoneCreate
from fastapi import HTTPException


# ── Project stub (defined once, extend_existing guards re-import) ─────────────

class Project(Base):
    __tablename__  = "projects"
    __table_args__ = {"extend_existing": True}
    id        = Column(Integer, primary_key=True)
    client_id = Column(Integer, nullable=False)


# ── Patch sys.modules so the service lazy imports resolve ─────────────────────

_proposal_mod = types.ModuleType("src.entities.proposal")
_proposal_mod.Proposal = Proposal
sys.modules.setdefault("src.entities.proposal", _proposal_mod)

_project_mod = types.ModuleType("src.entities.project")
_project_mod.Project = Project
sys.modules.setdefault("src.entities.project", _project_mod)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_world(db, *, client_id=1, freelancer_id=2):
    """Insert a Project, FreelancerProfile, and Proposal. Return (project_id, proposal_id).

    freelancer_id is used as users.id for the freelancer.  We create a
    FreelancerProfile with that user_id so _resolve_parties can look it up.
    The Proposal stores the FreelancerProfile.id (not the user id) to match
    production schema — _resolve_parties translates back to user_id.
    SQLite does not enforce FKs, so we don't need real User rows.
    """
    project = Project(id=client_id * 100, client_id=client_id)
    db.add(project)
    db.flush()

    # Create a FreelancerProfile whose user_id IS the freelancer_id we care about
    profile = FreelancerProfile(user_id=freelancer_id)
    db.add(profile)
    db.flush()  # profile.id is now set (auto-increment)

    # Proposal.freelancer_id is a FK to profiles_freelancer.id
    proposal = Proposal(
        project_id=project.id,
        freelancer_id=profile.id,
        cover_letter="Cover",
        bid_amount=1000.0,
        estimated_days=30,
    )
    db.add(proposal)
    db.flush()
    return project.id, proposal.id


def _create_contract(db, proposal_id, *, title="Test Contract", budget=5000,
                     terms="Standard terms", milestones=None):
    proposal  = db.query(Proposal).filter_by(id=proposal_id).first()
    project   = db.query(Project).filter_by(id=proposal.project_id).first()
    data = ContractCreate(
        proposal_id=proposal_id,
        title=title,
        budget=Decimal(budget),
        terms=terms,
        milestones=milestones or [],
    )
    result = ContractService.create_contract(db, data, project.client_id)
    return db.query(Contract).filter_by(id=result["id"]).first()


# ── Happy path ────────────────────────────────────────────────────────────────

class TestContractLifecycle:

    def test_create_returns_draft(self, db):
        _, proposal_id = _make_world(db)
        contract = _create_contract(db, proposal_id)
        assert contract.status == "draft"
        assert contract.title == "Test Contract"
        assert contract.budget == Decimal("5000")

    def test_create_with_milestones(self, db):
        _, proposal_id = _make_world(db)
        milestones = [MilestoneCreate(title="Design"), MilestoneCreate(title="Dev")]
        proposal = db.query(Proposal).filter_by(id=proposal_id).first()
        project  = db.query(Project).filter_by(id=proposal.project_id).first()
        data = ContractCreate(proposal_id=proposal_id, title="W", budget=Decimal("3000"), milestones=milestones)
        result = ContractService.create_contract(db, data, project.client_id)
        assert len(result["milestones"]) == 2

    def test_send_transitions_to_pending_sign(self, db):
        _, proposal_id = _make_world(db, client_id=1)
        contract = _create_contract(db, proposal_id)
        result = ContractService.send_contract(db, contract.id, client_id=1)
        assert result["status"] == "pending_sign"

    def test_sign_transitions_to_active(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        result = ContractService.sign_contract(db, contract.id, freelancer_id=2)
        assert result["status"] == "active"

    def test_sign_sets_start_date_if_unset(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        result = ContractService.sign_contract(db, contract.id, freelancer_id=2)
        assert result["start_date"] is not None

    def test_sign_preserves_explicit_start_date(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        proposal = db.query(Proposal).filter_by(id=proposal_id).first()
        project  = db.query(Project).filter_by(id=proposal.project_id).first()
        data = ContractCreate(
            proposal_id=proposal_id, title="D", budget=Decimal("1000"),
            start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )
        r = ContractService.create_contract(db, data, project.client_id)
        contract = db.query(Contract).filter_by(id=r["id"]).first()
        ContractService.send_contract(db, contract.id, client_id=1)
        signed = ContractService.sign_contract(db, contract.id, freelancer_id=2)
        assert signed["start_date"].year == 2026

    def test_cancel_active_contract(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        result = ContractService.cancel_contract(db, contract.id, user_id=1)
        assert result["status"] == "cancelled"

    def test_cancel_pending_sign_contract(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        result = ContractService.cancel_contract(db, contract.id, user_id=2)
        assert result["status"] == "cancelled"


# ── Milestones ────────────────────────────────────────────────────────────────

class TestMilestones:

    def _active_with_milestones(self, db, n=2):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        proposal = db.query(Proposal).filter_by(id=proposal_id).first()
        project  = db.query(Project).filter_by(id=proposal.project_id).first()
        data = ContractCreate(
            proposal_id=proposal_id, title="M", budget=Decimal("4000"),
            milestones=[MilestoneCreate(title=f"M{i}") for i in range(n)],
        )
        r = ContractService.create_contract(db, data, project.client_id)
        contract = db.query(Contract).filter_by(id=r["id"]).first()
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        db.refresh(contract)
        return contract

    def test_mark_complete(self, db):
        contract = self._active_with_milestones(db, n=2)
        result = ContractService.update_milestone(db, contract.milestones[0].id, True, freelancer_id=2)
        assert result["milestones"][0].is_completed is True

    def test_mark_incomplete(self, db):
        contract = self._active_with_milestones(db, n=2)
        m_id = contract.milestones[0].id
        ContractService.update_milestone(db, m_id, True, freelancer_id=2)
        result = ContractService.update_milestone(db, m_id, False, freelancer_id=2)
        assert result["milestones"][0].is_completed is False
        assert result["status"] == "active"

    def test_auto_complete_when_all_done(self, db):
        contract = self._active_with_milestones(db, n=2)
        m0, m1 = contract.milestones[0].id, contract.milestones[1].id
        ContractService.update_milestone(db, m0, True, freelancer_id=2)
        result = ContractService.update_milestone(db, m1, True, freelancer_id=2)
        assert result["status"] == "completed"

    def test_no_auto_complete_when_partial(self, db):
        contract = self._active_with_milestones(db, n=3)
        result = ContractService.update_milestone(db, contract.milestones[0].id, True, freelancer_id=2)
        assert result["status"] == "active"

    def test_progress_calculation(self, db):
        contract = self._active_with_milestones(db, n=4)
        result = ContractService.update_milestone(db, contract.milestones[0].id, True, freelancer_id=2)
        assert result["progress"] == 25

    def test_progress_zero_on_no_milestones(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        result = ContractService.get_contract(db, contract.id, user_id=1)
        assert result["progress"] == 0


# ── Read / list ───────────────────────────────────────────────────────────────

class TestReadContracts:

    def test_get_returns_correct_data(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id, title="Unique")
        result = ContractService.get_contract(db, contract.id, user_id=1)
        assert result["title"] == "Unique"

    def test_list_for_client(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        _create_contract(db, proposal_id, title="C1")
        results = ContractService.get_contracts(db, user_id=1, role="client")
        assert len(results) == 1
        assert results[0]["title"] == "C1"

    def test_list_for_freelancer(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        _create_contract(db, proposal_id)
        results = ContractService.get_contracts(db, user_id=2, role="freelancer")
        assert len(results) == 1

    def test_list_empty_for_unrelated_user(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        _create_contract(db, proposal_id)
        results = ContractService.get_contracts(db, user_id=99, role="client")
        assert results == []

    def test_get_404_for_missing(self, db):
        with pytest.raises(HTTPException) as exc:
            ContractService.get_contract(db, contract_id=9999, user_id=1)
        assert exc.value.status_code == 404

    def test_response_has_required_keys(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        result = ContractService.get_contract(db, contract.id, user_id=1)
        for key in ("id", "proposal_id", "title", "budget", "terms",
                    "start_date", "end_date", "status", "milestones",
                    "progress", "created_at"):
            assert key in result, f"Missing key: {key}"


# ── Edit terms ────────────────────────────────────────────────────────────────

class TestEditTerms:

    def test_freelancer_can_propose_edits(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        result = ContractService.edit_terms(
            db, contract.id, ContractEditTerms(terms="New terms"), freelancer_id=2
        )
        assert result["status"] == "rejected"
        assert result["terms"] == "New terms"

    def test_cannot_resend_rejected_contract(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.edit_terms(db, contract.id, ContractEditTerms(terms="New"), freelancer_id=2)
        with pytest.raises(HTTPException) as exc:
            ContractService.send_contract(db, contract.id, client_id=1)
        assert exc.value.status_code == 400


# ── Permissions ───────────────────────────────────────────────────────────────

class TestPermissions:

    def test_wrong_client_cannot_send(self, db):
        _, proposal_id = _make_world(db, client_id=1)
        contract = _create_contract(db, proposal_id)
        with pytest.raises(HTTPException) as exc:
            ContractService.send_contract(db, contract.id, client_id=99)
        assert exc.value.status_code == 403

    def test_wrong_freelancer_cannot_sign(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        with pytest.raises(HTTPException) as exc:
            ContractService.sign_contract(db, contract.id, freelancer_id=99)
        assert exc.value.status_code == 403

    def test_unrelated_user_cannot_view(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        with pytest.raises(HTTPException) as exc:
            ContractService.get_contract(db, contract.id, user_id=99)
        assert exc.value.status_code == 403

    def test_unrelated_user_cannot_cancel(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        with pytest.raises(HTTPException) as exc:
            ContractService.cancel_contract(db, contract.id, user_id=99)
        assert exc.value.status_code == 403

    def test_wrong_freelancer_cannot_update_milestone(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        proposal = db.query(Proposal).filter_by(id=proposal_id).first()
        project  = db.query(Project).filter_by(id=proposal.project_id).first()
        data = ContractCreate(proposal_id=proposal_id, title="T", budget=Decimal("1"),
                              milestones=[MilestoneCreate(title="M1")])
        r = ContractService.create_contract(db, data, project.client_id)
        contract = db.query(Contract).filter_by(id=r["id"]).first()
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        db.refresh(contract)
        with pytest.raises(HTTPException) as exc:
            ContractService.update_milestone(db, contract.milestones[0].id, True, freelancer_id=99)
        assert exc.value.status_code == 403

    def test_other_client_cannot_create_contract(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        data = ContractCreate(proposal_id=proposal_id, title="X", budget=Decimal("1"))
        with pytest.raises(HTTPException) as exc:
            ContractService.create_contract(db, data, client_id=99)
        assert exc.value.status_code == 403


# ── Invalid transitions ───────────────────────────────────────────────────────

class TestInvalidTransitions:

    def test_cannot_send_pending_contract(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        with pytest.raises(HTTPException) as exc:
            ContractService.send_contract(db, contract.id, client_id=1)
        assert exc.value.status_code == 400

    def test_cannot_sign_draft(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        with pytest.raises(HTTPException) as exc:
            ContractService.sign_contract(db, contract.id, freelancer_id=2)
        assert exc.value.status_code == 400

    def test_cannot_sign_active(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        with pytest.raises(HTTPException) as exc:
            ContractService.sign_contract(db, contract.id, freelancer_id=2)
        assert exc.value.status_code == 400

    def test_cannot_cancel_draft(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        with pytest.raises(HTTPException) as exc:
            ContractService.cancel_contract(db, contract.id, user_id=1)
        assert exc.value.status_code == 400

    def test_cannot_cancel_completed(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        proposal = db.query(Proposal).filter_by(id=proposal_id).first()
        project  = db.query(Project).filter_by(id=proposal.project_id).first()
        data = ContractCreate(proposal_id=proposal_id, title="T", budget=Decimal("1"),
                              milestones=[MilestoneCreate(title="M1")])
        r = ContractService.create_contract(db, data, project.client_id)
        contract = db.query(Contract).filter_by(id=r["id"]).first()
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        db.refresh(contract)
        ContractService.update_milestone(db, contract.milestones[0].id, True, freelancer_id=2)
        with pytest.raises(HTTPException) as exc:
            ContractService.cancel_contract(db, contract.id, user_id=1)
        assert exc.value.status_code == 400

    def test_cannot_edit_terms_on_active(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        with pytest.raises(HTTPException) as exc:
            ContractService.edit_terms(db, contract.id, ContractEditTerms(terms="X"), freelancer_id=2)
        assert exc.value.status_code == 400

    def test_cannot_update_milestone_on_pending(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        proposal = db.query(Proposal).filter_by(id=proposal_id).first()
        project  = db.query(Project).filter_by(id=proposal.project_id).first()
        data = ContractCreate(proposal_id=proposal_id, title="T", budget=Decimal("1"),
                              milestones=[MilestoneCreate(title="M1")])
        r = ContractService.create_contract(db, data, project.client_id)
        contract = db.query(Contract).filter_by(id=r["id"]).first()
        ContractService.send_contract(db, contract.id, client_id=1)
        db.refresh(contract)
        with pytest.raises(HTTPException) as exc:
            ContractService.update_milestone(db, contract.milestones[0].id, True, freelancer_id=2)
        assert exc.value.status_code == 400

    def test_duplicate_proposal_raises_400(self, db):
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        _create_contract(db, proposal_id)
        with pytest.raises(HTTPException) as exc:
            _create_contract(db, proposal_id)
        assert exc.value.status_code == 400

    def test_nonexistent_proposal_raises_404(self, db):
        data = ContractCreate(proposal_id=9999, title="Ghost", budget=Decimal("1"))
        with pytest.raises(HTTPException) as exc:
            ContractService.create_contract(db, data, client_id=1)
        assert exc.value.status_code == 404


# ── Renegotiation ─────────────────────────────────────────────────────────────

class TestRenegotiate:

    def _rejected_contract(self, db):
        """Create a contract that is in the rejected state (freelancer proposed edits)."""
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id, terms="Original terms", budget=5000)
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.edit_terms(db, contract.id, ContractEditTerms(terms="Freelancer edits"), freelancer_id=2)
        db.refresh(contract)
        return contract

    def test_client_can_renegotiate_terms(self, db):
        from src.contracts.models import ContractRenegotiate
        contract = self._rejected_contract(db)
        result = ContractService.renegotiate_contract(
            db, contract.id, ContractRenegotiate(terms="Counter terms"), client_id=1
        )
        assert result["status"] == "pending_sign"
        assert result["terms"] == "Counter terms"

    def test_client_can_renegotiate_budget(self, db):
        from src.contracts.models import ContractRenegotiate
        contract = self._rejected_contract(db)
        result = ContractService.renegotiate_contract(
            db, contract.id, ContractRenegotiate(budget=Decimal("3500")), client_id=1
        )
        assert result["status"] == "pending_sign"
        assert result["budget"] == Decimal("3500")

    def test_client_can_renegotiate_both(self, db):
        from src.contracts.models import ContractRenegotiate
        contract = self._rejected_contract(db)
        result = ContractService.renegotiate_contract(
            db, contract.id,
            ContractRenegotiate(terms="Counter terms", budget=Decimal("4000")),
            client_id=1,
        )
        assert result["status"] == "pending_sign"
        assert result["terms"] == "Counter terms"
        assert result["budget"] == Decimal("4000")

    def test_freelancer_can_sign_after_renegotiation(self, db):
        """Full back-and-forth: send → edit → renegotiate → sign."""
        from src.contracts.models import ContractRenegotiate
        contract = self._rejected_contract(db)
        ContractService.renegotiate_contract(
            db, contract.id, ContractRenegotiate(terms="Agreed terms"), client_id=1
        )
        result = ContractService.sign_contract(db, contract.id, freelancer_id=2)
        assert result["status"] == "active"

    def test_cannot_renegotiate_with_no_changes(self, db):
        from src.contracts.models import ContractRenegotiate
        contract = self._rejected_contract(db)
        with pytest.raises(HTTPException) as exc:
            ContractService.renegotiate_contract(
                db, contract.id, ContractRenegotiate(), client_id=1
            )
        assert exc.value.status_code == 400

    def test_cannot_renegotiate_pending_contract(self, db):
        from src.contracts.models import ContractRenegotiate
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        # still pending_sign, not rejected
        with pytest.raises(HTTPException) as exc:
            ContractService.renegotiate_contract(
                db, contract.id, ContractRenegotiate(terms="X"), client_id=1
            )
        assert exc.value.status_code == 400

    def test_cannot_renegotiate_active_contract(self, db):
        from src.contracts.models import ContractRenegotiate
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id)
        ContractService.send_contract(db, contract.id, client_id=1)
        ContractService.sign_contract(db, contract.id, freelancer_id=2)
        with pytest.raises(HTTPException) as exc:
            ContractService.renegotiate_contract(
                db, contract.id, ContractRenegotiate(terms="X"), client_id=1
            )
        assert exc.value.status_code == 400

    def test_wrong_client_cannot_renegotiate(self, db):
        from src.contracts.models import ContractRenegotiate
        contract = self._rejected_contract(db)
        with pytest.raises(HTTPException) as exc:
            ContractService.renegotiate_contract(
                db, contract.id, ContractRenegotiate(terms="Hijack"), client_id=99
            )
        assert exc.value.status_code == 403

    def test_freelancer_cannot_renegotiate(self, db):
        """Freelancer uses edit_terms, not renegotiate — controller enforces this,
        but service also checks ownership (freelancer_id != client_id)."""
        from src.contracts.models import ContractRenegotiate
        contract = self._rejected_contract(db)
        # freelancer_id=2 is not the client (client_id=1)
        with pytest.raises(HTTPException) as exc:
            ContractService.renegotiate_contract(
                db, contract.id, ContractRenegotiate(terms="X"), client_id=2
            )
        assert exc.value.status_code == 403

    def test_multiple_renegotiation_rounds(self, db):
        """Full back-and-forth cycle: send → edit → renegotiate → edit → renegotiate → sign."""
        from src.contracts.models import ContractRenegotiate
        _, proposal_id = _make_world(db, client_id=1, freelancer_id=2)
        contract = _create_contract(db, proposal_id, terms="v1")
        ContractService.send_contract(db, contract.id, client_id=1)

        ContractService.edit_terms(db, contract.id, ContractEditTerms(terms="v2"), freelancer_id=2)
        assert db.query(Contract).filter_by(id=contract.id).first().status == "rejected"

        ContractService.renegotiate_contract(
            db, contract.id, ContractRenegotiate(terms="v3"), client_id=1
        )
        assert db.query(Contract).filter_by(id=contract.id).first().status == "pending_sign"

        ContractService.edit_terms(db, contract.id, ContractEditTerms(terms="v4"), freelancer_id=2)
        assert db.query(Contract).filter_by(id=contract.id).first().status == "rejected"

        ContractService.renegotiate_contract(
            db, contract.id, ContractRenegotiate(terms="v5 - final"), client_id=1
        )
        result = ContractService.sign_contract(db, contract.id, freelancer_id=2)
        assert result["status"] == "active"
        assert result["terms"] == "v5 - final"