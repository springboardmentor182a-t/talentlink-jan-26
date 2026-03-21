# server/tests/e2e/test_contracts_endpoints.py
"""
E2E tests for the /api/contracts endpoints.

Each test hits the real FastAPI router through TestClient with an isolated
SQLite DB.  The contracts service does lazy imports of Proposal, Project, and
FreelancerProfile — we patch sys.modules in the same way as the service unit
tests so those imports resolve without the proposals branch being merged.

Fixtures (from conftest.py):
    client  — TestClient with isolated SQLite DB and dependency override
    db      — raw SQLAlchemy session (same DB as client)
"""

import sys
import types
import pytest
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Text, DECIMAL
from src.database.core import Base
from src.users.models import Proposal, FreelancerProfile, ClientProfile

# ── Project stub — matches real Project model from findproject branch ─────────

class Project(Base):
    __tablename__  = "projects"
    __table_args__ = {"extend_existing": True}
    id          = Column(Integer, primary_key=True)
    title       = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    budget      = Column(DECIMAL(10, 2), nullable=False)
    client_id   = Column(Integer, nullable=False)   # FK to profiles_client.id
    status      = Column(String(50), default="open")


# Patch src.projects.models — real module doesn't exist until findproject merges
_projects_mod = types.ModuleType("src.projects")
sys.modules.setdefault("src.projects", _projects_mod)

_projects_models_mod = types.ModuleType("src.projects.models")
_projects_models_mod.Project = Project
sys.modules.setdefault("src.projects.models", _projects_models_mod)


# ── Auth helpers ──────────────────────────────────────────────────────────────

CLIENT_USER = {
    "email": "client@example.com",
    "username": "clientuser",
    "password": "securepass123",
    "role": "client",
}

FREELANCER_USER = {
    "email": "freelancer@example.com",
    "username": "freelanceruser",
    "password": "securepass456",
    "role": "freelancer",
}

OUTSIDER_USER = {
    "email": "outsider@example.com",
    "username": "outsideruser",
    "password": "securepass789",
    "role": "client",
}


def _register_and_token(client, payload):
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    user_id = resp.json()["user"]["id"]
    token   = resp.json()["access_token"]
    return user_id, {"Authorization": f"Bearer {token}"}


def _setup_world(client, db, *, client_user=CLIENT_USER, freelancer_user=FREELANCER_USER):
    """Register client + freelancer, build DB fixtures, return ids and headers."""
    client_id,     client_headers     = _register_and_token(client, client_user)
    freelancer_id, freelancer_headers = _register_and_token(client, freelancer_user)

    # FreelancerProfile — needed by _resolve_parties (freelancer_id → users.id)
    profile = FreelancerProfile(user_id=freelancer_id)
    db.add(profile)
    db.flush()

    # ClientProfile — needed by _resolve_parties (project.client_id → users.id)
    # Project.client_id is profiles_client.id, not users.id directly.
    client_profile = ClientProfile(user_id=client_id)
    db.add(client_profile)
    db.flush()

    # Project owned by the client — client_id is ClientProfile.id (not users.id)
    project = Project(id=client_id * 100, client_id=client_profile.id, title="Test Project", description="A test project for contract testing purposes", budget=10000)
    db.add(project)
    db.flush()

    # Proposal — freelancer_id is profiles_freelancer.id (profile.id)
    proposal = Proposal(
        project_id=project.id,
        freelancer_id=profile.id,
        cover_letter="Cover",
        bid_amount=5000.0,
        estimated_days=30,
    )
    db.add(proposal)
    db.commit()

    return {
        "client_id":        client_id,
        "freelancer_id":    freelancer_id,
        "proposal_id":      proposal.id,
        "client_headers":   client_headers,
        "freelancer_headers": freelancer_headers,
    }


BASE = "/api/contracts"

CONTRACT_PAYLOAD = {
    "title":  "Website Redesign",
    "budget": 5000,
    "terms":  "Standard terms apply.",
}


# ═════════════════════════════════════════════════════════════════════════════
# CREATE
# ═════════════════════════════════════════════════════════════════════════════

class TestCreateContract:

    def test_client_can_create_contract(self, client, db):
        w = _setup_world(client, db)
        resp = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                           headers=w["client_headers"])
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "draft"
        assert data["title"] == "Website Redesign"
        assert float(data["budget"]) == 5000.0

    def test_create_response_shape(self, client, db):
        w = _setup_world(client, db)
        data = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                           headers=w["client_headers"]).json()
        for key in ("id", "proposal_id", "title", "budget", "terms",
                    "start_date", "end_date", "status", "milestones", "progress", "created_at"):
            assert key in data, f"Missing key: {key}"

    def test_create_with_milestones(self, client, db):
        w = _setup_world(client, db)
        payload = {**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"],
                   "milestones": [{"title": "Design"}, {"title": "Dev"}]}
        data = client.post(BASE + "/", json=payload, headers=w["client_headers"]).json()
        assert len(data["milestones"]) == 2

    def test_freelancer_cannot_create_contract(self, client, db):
        w = _setup_world(client, db)
        resp = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                           headers=w["freelancer_headers"])
        assert resp.status_code == 403

    def test_unauthenticated_cannot_create(self, client, db):
        w = _setup_world(client, db)
        resp = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]})
        assert resp.status_code == 403

    def test_duplicate_proposal_returns_400(self, client, db):
        w = _setup_world(client, db)
        payload = {**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]}
        client.post(BASE + "/", json=payload, headers=w["client_headers"])
        resp = client.post(BASE + "/", json=payload, headers=w["client_headers"])
        assert resp.status_code == 400

    def test_nonexistent_proposal_returns_404(self, client, db):
        _, client_headers = _register_and_token(client, CLIENT_USER)
        resp = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": 9999},
                           headers=client_headers)
        assert resp.status_code == 404

    def test_zero_budget_returns_422(self, client, db):
        w = _setup_world(client, db)
        resp = client.post(BASE + "/",
                           json={"proposal_id": w["proposal_id"], "title": "T", "budget": 0},
                           headers=w["client_headers"])
        assert resp.status_code == 422

    def test_missing_title_returns_422(self, client, db):
        w = _setup_world(client, db)
        resp = client.post(BASE + "/",
                           json={"proposal_id": w["proposal_id"], "budget": 100},
                           headers=w["client_headers"])
        assert resp.status_code == 422


# ═════════════════════════════════════════════════════════════════════════════
# LIST & GET
# ═════════════════════════════════════════════════════════════════════════════

class TestReadContracts:

    def _create(self, client, w):
        return client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                           headers=w["client_headers"]).json()

    def test_client_sees_own_contract(self, client, db):
        w = _setup_world(client, db)
        self._create(client, w)
        resp = client.get(BASE + "/", headers=w["client_headers"])
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_freelancer_sees_own_contract(self, client, db):
        w = _setup_world(client, db)
        self._create(client, w)
        resp = client.get(BASE + "/", headers=w["freelancer_headers"])
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_outsider_sees_no_contracts(self, client, db):
        w = _setup_world(client, db)
        self._create(client, w)
        _, outsider_headers = _register_and_token(client, OUTSIDER_USER)
        resp = client.get(BASE + "/", headers=outsider_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_single_contract(self, client, db):
        w = _setup_world(client, db)
        created = self._create(client, w)
        resp = client.get(f"{BASE}/{created['id']}", headers=w["client_headers"])
        assert resp.status_code == 200
        assert resp.json()["id"] == created["id"]

    def test_get_single_contract_404(self, client, db):
        w = _setup_world(client, db)
        resp = client.get(f"{BASE}/9999", headers=w["client_headers"])
        assert resp.status_code == 404

    def test_get_single_contract_outsider_403(self, client, db):
        w = _setup_world(client, db)
        created = self._create(client, w)
        _, outsider_headers = _register_and_token(client, OUTSIDER_USER)
        resp = client.get(f"{BASE}/{created['id']}", headers=outsider_headers)
        assert resp.status_code == 403


# ═════════════════════════════════════════════════════════════════════════════
# SEND
# ═════════════════════════════════════════════════════════════════════════════

class TestSendContract:

    def _draft(self, client, w):
        return client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                           headers=w["client_headers"]).json()

    def test_client_can_send_draft(self, client, db):
        w = _setup_world(client, db)
        c = self._draft(client, w)
        resp = client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "pending_sign"

    def test_freelancer_cannot_send(self, client, db):
        w = _setup_world(client, db)
        c = self._draft(client, w)
        resp = client.post(f"{BASE}/{c['id']}/send", headers=w["freelancer_headers"])
        assert resp.status_code == 403

    def test_cannot_send_twice(self, client, db):
        w = _setup_world(client, db)
        c = self._draft(client, w)
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        resp = client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        assert resp.status_code == 400


# ═════════════════════════════════════════════════════════════════════════════
# SIGN
# ═════════════════════════════════════════════════════════════════════════════

class TestSignContract:

    def _pending(self, client, w):
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        return c

    def test_freelancer_can_sign(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        resp = client.post(f"{BASE}/{c['id']}/sign", headers=w["freelancer_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "active"

    def test_client_cannot_sign(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        resp = client.post(f"{BASE}/{c['id']}/sign", headers=w["client_headers"])
        assert resp.status_code == 403

    def test_cannot_sign_draft(self, client, db):
        w = _setup_world(client, db)
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        resp = client.post(f"{BASE}/{c['id']}/sign", headers=w["freelancer_headers"])
        assert resp.status_code == 400


# ═════════════════════════════════════════════════════════════════════════════
# CANCEL
# ═════════════════════════════════════════════════════════════════════════════

class TestCancelContract:

    def _pending(self, client, w):
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        return c

    def _active(self, client, w):
        c = self._pending(client, w)
        client.post(f"{BASE}/{c['id']}/sign", headers=w["freelancer_headers"])
        return c

    def test_client_can_cancel_active(self, client, db):
        w = _setup_world(client, db)
        c = self._active(client, w)
        resp = client.post(f"{BASE}/{c['id']}/cancel", headers=w["client_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    def test_freelancer_cannot_cancel_active(self, client, db):
        w = _setup_world(client, db)
        c = self._active(client, w)
        resp = client.post(f"{BASE}/{c['id']}/cancel", headers=w["freelancer_headers"])
        assert resp.status_code == 403

    def test_freelancer_can_cancel_pending_sign(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        resp = client.post(f"{BASE}/{c['id']}/cancel", headers=w["freelancer_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    def test_client_can_cancel_pending_sign(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        resp = client.post(f"{BASE}/{c['id']}/cancel", headers=w["client_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

    def test_cannot_cancel_draft(self, client, db):
        w = _setup_world(client, db)
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        resp = client.post(f"{BASE}/{c['id']}/cancel", headers=w["client_headers"])
        assert resp.status_code == 400

    def test_outsider_cannot_cancel(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        _, outsider_headers = _register_and_token(client, OUTSIDER_USER)
        resp = client.post(f"{BASE}/{c['id']}/cancel", headers=outsider_headers)
        assert resp.status_code == 403


# ═════════════════════════════════════════════════════════════════════════════
# EDIT TERMS (freelancer proposes edits)
# ═════════════════════════════════════════════════════════════════════════════

class TestEditTerms:

    def _pending(self, client, w):
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        return c

    def test_freelancer_can_edit_terms(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/terms",
                            json={"terms": "New terms proposed"},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "rejected"
        assert data["terms"] == "New terms proposed"

    def test_client_cannot_edit_terms(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/terms",
                            json={"terms": "sneaky edit"},
                            headers=w["client_headers"])
        assert resp.status_code == 403

    def test_cannot_edit_terms_on_draft(self, client, db):
        w = _setup_world(client, db)
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        resp = client.patch(f"{BASE}/{c['id']}/terms",
                            json={"terms": "edit on draft"},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 400

    def test_empty_terms_returns_422(self, client, db):
        w = _setup_world(client, db)
        c = self._pending(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/terms",
                            json={"terms": ""},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 422


# ═════════════════════════════════════════════════════════════════════════════
# RENEGOTIATE (client counter-proposes after freelancer rejects)
# ═════════════════════════════════════════════════════════════════════════════

class TestRenegotiate:

    def _rejected(self, client, w):
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        client.patch(f"{BASE}/{c['id']}/terms",
                     json={"terms": "Freelancer edits"},
                     headers=w["freelancer_headers"])
        return c

    def test_client_can_renegotiate_terms(self, client, db):
        w = _setup_world(client, db)
        c = self._rejected(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/renegotiate",
                            json={"terms": "Counter terms"},
                            headers=w["client_headers"])
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending_sign"
        assert data["terms"] == "Counter terms"

    def test_client_can_renegotiate_budget(self, client, db):
        w = _setup_world(client, db)
        c = self._rejected(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/renegotiate",
                            json={"budget": 3500},
                            headers=w["client_headers"])
        assert resp.status_code == 200
        assert float(resp.json()["budget"]) == 3500.0

    def test_client_can_renegotiate_both(self, client, db):
        w = _setup_world(client, db)
        c = self._rejected(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/renegotiate",
                            json={"terms": "Updated", "budget": 4200},
                            headers=w["client_headers"])
        assert resp.status_code == 200
        data = resp.json()
        assert data["terms"] == "Updated"
        assert float(data["budget"]) == 4200.0

    def test_freelancer_cannot_renegotiate(self, client, db):
        w = _setup_world(client, db)
        c = self._rejected(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/renegotiate",
                            json={"terms": "Hijack"},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 403

    def test_cannot_renegotiate_without_changes(self, client, db):
        w = _setup_world(client, db)
        c = self._rejected(client, w)
        resp = client.patch(f"{BASE}/{c['id']}/renegotiate",
                            json={},
                            headers=w["client_headers"])
        assert resp.status_code == 400

    def test_cannot_renegotiate_pending_contract(self, client, db):
        w = _setup_world(client, db)
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        resp = client.patch(f"{BASE}/{c['id']}/renegotiate",
                            json={"terms": "too early"},
                            headers=w["client_headers"])
        assert resp.status_code == 400

    def test_freelancer_can_sign_after_renegotiation(self, client, db):
        w = _setup_world(client, db)
        c = self._rejected(client, w)
        client.patch(f"{BASE}/{c['id']}/renegotiate",
                     json={"terms": "agreed"},
                     headers=w["client_headers"])
        resp = client.post(f"{BASE}/{c['id']}/sign", headers=w["freelancer_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "active"

    def test_multiple_renegotiation_rounds(self, client, db):
        """Full back-and-forth: send → edit → renegotiate → edit → renegotiate → sign."""
        w = _setup_world(client, db)
        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        cid = c["id"]

        client.post(f"{BASE}/{cid}/send", headers=w["client_headers"])
        client.patch(f"{BASE}/{cid}/terms", json={"terms": "v2"}, headers=w["freelancer_headers"])
        client.patch(f"{BASE}/{cid}/renegotiate", json={"terms": "v3"}, headers=w["client_headers"])
        client.patch(f"{BASE}/{cid}/terms", json={"terms": "v4"}, headers=w["freelancer_headers"])
        client.patch(f"{BASE}/{cid}/renegotiate", json={"terms": "v5 final"}, headers=w["client_headers"])
        resp = client.post(f"{BASE}/{cid}/sign", headers=w["freelancer_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "active"
        assert resp.json()["terms"] == "v5 final"


# ═════════════════════════════════════════════════════════════════════════════
# MILESTONES
# ═════════════════════════════════════════════════════════════════════════════

class TestMilestones:

    def _active_with_milestones(self, client, w, n=2):
        payload = {
            **CONTRACT_PAYLOAD,
            "proposal_id": w["proposal_id"],
            "milestones": [{"title": f"M{i}"} for i in range(n)],
        }
        c = client.post(BASE + "/", json=payload, headers=w["client_headers"]).json()
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        client.post(f"{BASE}/{c['id']}/sign", headers=w["freelancer_headers"])
        return c

    def test_freelancer_can_complete_milestone(self, client, db):
        w = _setup_world(client, db)
        c = self._active_with_milestones(client, w)
        mid = c["milestones"][0]["id"]
        resp = client.patch(f"{BASE}/milestones/{mid}",
                            json={"is_completed": True},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 200
        updated = resp.json()
        assert updated["milestones"][0]["is_completed"] is True

    def test_freelancer_can_uncheck_milestone(self, client, db):
        w = _setup_world(client, db)
        c = self._active_with_milestones(client, w)
        mid = c["milestones"][0]["id"]
        client.patch(f"{BASE}/milestones/{mid}", json={"is_completed": True},
                     headers=w["freelancer_headers"])
        resp = client.patch(f"{BASE}/milestones/{mid}", json={"is_completed": False},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 200
        assert resp.json()["milestones"][0]["is_completed"] is False
        assert resp.json()["status"] == "active"

    def test_all_milestones_done_autocompletes_contract(self, client, db):
        w = _setup_world(client, db)
        c = self._active_with_milestones(client, w, n=2)
        m0 = c["milestones"][0]["id"]
        m1 = c["milestones"][1]["id"]
        client.patch(f"{BASE}/milestones/{m0}", json={"is_completed": True},
                     headers=w["freelancer_headers"])
        resp = client.patch(f"{BASE}/milestones/{m1}", json={"is_completed": True},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 200
        assert resp.json()["status"] == "completed"

    def test_partial_milestones_stay_active(self, client, db):
        w = _setup_world(client, db)
        c = self._active_with_milestones(client, w, n=3)
        mid = c["milestones"][0]["id"]
        resp = client.patch(f"{BASE}/milestones/{mid}", json={"is_completed": True},
                            headers=w["freelancer_headers"])
        assert resp.json()["status"] == "active"

    def test_progress_updates_correctly(self, client, db):
        w = _setup_world(client, db)
        c = self._active_with_milestones(client, w, n=4)
        mid = c["milestones"][0]["id"]
        resp = client.patch(f"{BASE}/milestones/{mid}", json={"is_completed": True},
                            headers=w["freelancer_headers"])
        assert resp.json()["progress"] == 25

    def test_client_cannot_update_milestone(self, client, db):
        w = _setup_world(client, db)
        c = self._active_with_milestones(client, w)
        mid = c["milestones"][0]["id"]
        resp = client.patch(f"{BASE}/milestones/{mid}", json={"is_completed": True},
                            headers=w["client_headers"])
        assert resp.status_code == 403

    def test_outsider_cannot_update_milestone(self, client, db):
        w = _setup_world(client, db)
        c = self._active_with_milestones(client, w)
        mid = c["milestones"][0]["id"]
        _, outsider_headers = _register_and_token(client, OUTSIDER_USER)
        resp = client.patch(f"{BASE}/milestones/{mid}", json={"is_completed": True},
                            headers=outsider_headers)
        assert resp.status_code == 403

    def test_cannot_update_milestone_on_pending_contract(self, client, db):
        w = _setup_world(client, db)
        payload = {
            **CONTRACT_PAYLOAD,
            "proposal_id": w["proposal_id"],
            "milestones": [{"title": "M1"}],
        }
        c = client.post(BASE + "/", json=payload, headers=w["client_headers"]).json()
        client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"])
        # Contract is pending_sign — not active
        mid = c["milestones"][0]["id"]
        resp = client.patch(f"{BASE}/milestones/{mid}", json={"is_completed": True},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 400

    def test_milestone_not_found_returns_404(self, client, db):
        w = _setup_world(client, db)
        resp = client.patch(f"{BASE}/milestones/9999", json={"is_completed": True},
                            headers=w["freelancer_headers"])
        assert resp.status_code == 404


# ═════════════════════════════════════════════════════════════════════════════
# FULL LIFECYCLE INTEGRATION
# ═════════════════════════════════════════════════════════════════════════════

class TestFullLifecycle:

    def test_create_send_sign_milestone_complete(self, client, db):
        """Happy path: draft → pending_sign → active → milestones → completed."""
        w = _setup_world(client, db)
        payload = {
            "proposal_id": w["proposal_id"],
            "title": "Full Project",
            "budget": 8000,
            "milestones": [{"title": "Phase 1"}, {"title": "Phase 2"}],
        }

        # Create draft
        c = client.post(BASE + "/", json=payload, headers=w["client_headers"]).json()
        assert c["status"] == "draft"

        # Send to freelancer
        c = client.post(f"{BASE}/{c['id']}/send", headers=w["client_headers"]).json()
        assert c["status"] == "pending_sign"

        # Freelancer signs
        c = client.post(f"{BASE}/{c['id']}/sign", headers=w["freelancer_headers"]).json()
        assert c["status"] == "active"

        # Complete both milestones
        m0, m1 = c["milestones"][0]["id"], c["milestones"][1]["id"]
        c = client.patch(f"{BASE}/milestones/{m0}", json={"is_completed": True},
                         headers=w["freelancer_headers"]).json()
        assert c["status"] == "active"
        assert c["progress"] == 50

        c = client.patch(f"{BASE}/milestones/{m1}", json={"is_completed": True},
                         headers=w["freelancer_headers"]).json()
        assert c["status"] == "completed"
        assert c["progress"] == 100

    def test_create_send_reject_renegotiate_sign(self, client, db):
        """Renegotiation path: send → edit terms → renegotiate → sign."""
        w = _setup_world(client, db)

        c = client.post(BASE + "/", json={**CONTRACT_PAYLOAD, "proposal_id": w["proposal_id"]},
                        headers=w["client_headers"]).json()
        cid = c["id"]

        client.post(f"{BASE}/{cid}/send", headers=w["client_headers"])

        r = client.patch(f"{BASE}/{cid}/terms",
                         json={"terms": "I want 20% more"},
                         headers=w["freelancer_headers"]).json()
        assert r["status"] == "rejected"

        r = client.patch(f"{BASE}/{cid}/renegotiate",
                         json={"budget": 5500},
                         headers=w["client_headers"]).json()
        assert r["status"] == "pending_sign"
        assert float(r["budget"]) == 5500.0

        r = client.post(f"{BASE}/{cid}/sign", headers=w["freelancer_headers"]).json()
        assert r["status"] == "active"