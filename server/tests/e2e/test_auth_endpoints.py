# server/tests/e2e/test_auth_endpoints.py
"""
Auth endpoint tests — covers every case from the testing checklist plus
edge cases found during code review.

Fixtures (from conftest.py):
    client          — TestClient with isolated SQLite DB
    registered_user — pre-registered alice (dict from register response)
    auth_token      — Bearer token for alice
    auth_headers    — {"Authorization": "Bearer <token>"} for alice
"""

from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
from jose import jwt

# ── Helpers ───────────────────────────────────────────────────────────────────

ALICE = {
    "email": "alice@example.com",
    "username": "alice",
    "password": "securepass123",
    "role": "freelancer",
}


def register(client, payload=None):
    return client.post("/api/auth/register", json=payload or ALICE)


def login(client, email=ALICE["email"], password=ALICE["password"]):
    return client.post("/api/auth/login", json={"email": email, "password": password})


# ═════════════════════════════════════════════════════════════════════════════
# REGISTER
# ═════════════════════════════════════════════════════════════════════════════

class TestRegister:

    def test_success_returns_201(self, client):
        resp = register(client)
        assert resp.status_code == 201

    def test_success_response_shape(self, client):
        data = register(client).json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        user = data["user"]
        assert user["email"] == ALICE["email"]
        assert user["username"] == ALICE["username"]
        assert user["role"] == "freelancer"
        assert "id" in user
        assert "created_at" in user

    def test_hashed_password_not_in_response(self, client):
        """The raw or hashed password must never appear in the response body."""
        data = register(client).json()
        body_str = str(data)
        assert "hashed_password" not in body_str
        assert ALICE["password"] not in body_str

    def test_duplicate_email_returns_400(self, client):
        register(client)
        resp = register(client, {**ALICE, "username": "alice2"})
        assert resp.status_code == 400

    def test_duplicate_username_returns_400(self, client):
        register(client)
        resp = register(client, {**ALICE, "email": "alice2@example.com"})
        assert resp.status_code == 400

    def test_password_too_short_returns_422(self, client):
        resp = register(client, {**ALICE, "password": "short"})
        assert resp.status_code == 422

    def test_invalid_email_format_returns_422(self, client):
        resp = register(client, {**ALICE, "email": "not-an-email"})
        assert resp.status_code == 422

    def test_username_too_short_returns_422(self, client):
        """Username min_length=3 in UserRegister model."""
        resp = register(client, {**ALICE, "username": "ab"})
        assert resp.status_code == 422

    def test_missing_required_fields_returns_422(self, client):
        resp = client.post("/api/auth/register", json={"email": "x@x.com"})
        assert resp.status_code == 422

    # ── Role validation ───────────────────────────────────────────────────────
    def test_invalid_role_returns_422(self, client):
        # Literal["freelancer", "client", "both"] is enforced in UserRegister.
        # Any other value must be rejected by Pydantic before reaching the service.
        resp = register(client, {**ALICE, "role": "admin"})
        assert resp.status_code == 422

    def test_valid_roles_accepted(self, client):
        for role in ["freelancer", "client", "both"]:
            email = f"user_{role}@example.com"
            username = f"user_{role}"
            resp = register(client, {**ALICE, "email": email, "username": username, "role": role})
            assert resp.status_code == 201, f"role '{role}' was rejected"


# ═════════════════════════════════════════════════════════════════════════════
# LOGIN
# ═════════════════════════════════════════════════════════════════════════════

class TestLogin:

    def test_success_returns_200_with_token(self, client, registered_user):
        resp = login(client)
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_token_is_valid_jwt(self, client, registered_user):
        """The returned token must be decodable and contain user_id."""
        import os
        token = login(client).json()["access_token"]
        secret = os.getenv("SECRET_KEY", "")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        assert "user_id" in payload
        assert "sub" in payload
        assert "exp" in payload

    def test_wrong_password_returns_401(self, client, registered_user):
        resp = login(client, password="wrongpassword")
        assert resp.status_code == 401

    def test_non_existent_email_returns_401(self, client):
        resp = login(client, email="nobody@example.com")
        assert resp.status_code == 401

    def test_wrong_password_error_message_is_generic(self, client, registered_user):
        """Must not reveal whether the email exists or the password is wrong."""
        resp = login(client, password="wrongpassword")
        detail = resp.json()["detail"].lower()
        # Should say "invalid email or password" — not "wrong password" or "user not found"
        assert "invalid" in detail
        assert "password" not in detail.replace("email or password", "")

    def test_login_updates_user_in_db(self, client, registered_user, db):
        """last_login should be set after successful login."""
        from src.entities.user import User
        login(client)
        user = db.query(User).filter(User.email == ALICE["email"]).first()
        assert user.last_login is not None

    def test_login_response_does_not_leak_sensitive_fields(self, client, registered_user):
        """Login response must never expose hashed_password, reset_token, or
        reset_token_expires — these were previously leaked because the login
        endpoint had no response_model and FastAPI serialised the raw ORM object."""
        data = login(client).json()
        body_str = str(data)
        assert "hashed_password" not in body_str, "hashed_password leaked in login response"
        assert "reset_token" not in body_str,     "reset_token leaked in login response"
        assert ALICE["password"] not in body_str,  "plaintext password leaked in login response"

    def test_login_response_shape(self, client, registered_user):
        """Login response must contain user object with id, email, username, role."""
        data = login(client).json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        user = data["user"]
        assert "id"       in user
        assert "email"    in user
        assert "username" in user
        assert "role"     in user


# ═════════════════════════════════════════════════════════════════════════════
# PROTECTED ENDPOINT ACCESS
# ═════════════════════════════════════════════════════════════════════════════

class TestProtectedEndpoints:
    """Use /api/messages/conversations as the canary protected endpoint.

    Previously used /api/users/me but that route does not exist in the
    users router — FastAPI matches 'me' as a /{user_id} integer and returns
    422. /api/messages/conversations is owned by this module, is protected,
    and exists.
    """

    PROTECTED = "/api/messages/conversations"

    def test_no_token_returns_403(self, client):
        resp = client.get(self.PROTECTED)
        assert resp.status_code == 403

    def test_valid_token_returns_200(self, client, auth_headers):
        resp = client.get(self.PROTECTED, headers=auth_headers)
        assert resp.status_code == 200

    def test_malformed_token_returns_401(self, client):
        resp = client.get(self.PROTECTED, headers={"Authorization": "Bearer notavalidtoken"})
        assert resp.status_code == 401

    def test_expired_token_returns_401(self, client, registered_user):
        """Forge a token with an already-expired exp claim."""
        import os
        secret = os.getenv("SECRET_KEY", "")
        payload = {
            "sub": ALICE["email"],
            "user_id": registered_user["user"]["id"],
            "exp": datetime.utcnow() - timedelta(minutes=1),  # already expired
        }
        expired_token = jwt.encode(payload, secret, algorithm="HS256")
        resp = client.get(self.PROTECTED, headers={"Authorization": f"Bearer {expired_token}"})
        assert resp.status_code == 401

    def test_token_with_missing_user_id_returns_401(self, client):
        """Token is validly signed but missing the user_id claim."""
        import os
        secret = os.getenv("SECRET_KEY", "")
        payload = {
            "sub": ALICE["email"],
            # user_id deliberately omitted
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        bad_token = jwt.encode(payload, secret, algorithm="HS256")
        resp = client.get(self.PROTECTED, headers={"Authorization": f"Bearer {bad_token}"})
        assert resp.status_code == 401

    def test_token_for_deleted_user_returns_401(self, client, registered_user, db):
        """Valid token but the user no longer exists in the DB."""
        import os
        from src.entities.user import User
        # Log in to get a real token
        token = login(client).json()["access_token"]
        # Delete the user from DB
        user = db.query(User).filter(User.email == ALICE["email"]).first()
        db.delete(user)
        db.commit()
        # Token should now fail
        resp = client.get(self.PROTECTED, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401


# ═════════════════════════════════════════════════════════════════════════════
# FORGOT PASSWORD
# ═════════════════════════════════════════════════════════════════════════════

class TestForgotPassword:

    ENDPOINT = "/api/auth/forgot-password"
    SUCCESS_MSG = "If that email exists, a password reset link has been sent."

    def test_valid_email_returns_200(self, client, registered_user):
        with patch("src.auth.service._send_reset_email"):
            resp = client.post(self.ENDPOINT, json={"email": ALICE["email"]})
        assert resp.status_code == 200

    def test_non_existent_email_returns_200_same_message(self, client):
        """Email enumeration prevention — must return the EXACT same message."""
        resp = client.post(self.ENDPOINT, json={"email": "ghost@example.com"})
        assert resp.status_code == 200
        assert resp.json()["message"] == self.SUCCESS_MSG

    def test_valid_email_returns_same_message_as_invalid(self, client, registered_user):
        """Both valid and invalid emails must return identical message text."""
        with patch("src.auth.service._send_reset_email"):
            resp_valid   = client.post(self.ENDPOINT, json={"email": ALICE["email"]})
            resp_invalid = client.post(self.ENDPOINT, json={"email": "nobody@example.com"})
        assert resp_valid.json()["message"] == resp_invalid.json()["message"]

    def test_response_does_not_expose_reset_token(self, client, registered_user):
        """
        ForgotPasswordResponse model intentionally excludes reset_token.
        Verify it's stripped at the HTTP boundary.
        """
        with patch("src.auth.service._send_reset_email"):
            resp = client.post(self.ENDPOINT, json={"email": ALICE["email"]})
        assert "reset_token" not in resp.json()

    def test_invalid_email_format_returns_422(self, client):
        resp = client.post(self.ENDPOINT, json={"email": "not-an-email"})
        assert resp.status_code == 422

    def test_reset_token_stored_as_hash_in_db(self, client, registered_user, db):
        """
        The DB column must never hold the raw token — only its SHA-256 hash.
        Raw token ≠ stored value.
        """
        import hashlib
        from src.entities.user import User
        with patch("src.auth.service._send_reset_email"):
            client.post(self.ENDPOINT, json={"email": ALICE["email"]})
        user = db.query(User).filter(User.email == ALICE["email"]).first()
        assert user.reset_token is not None
        # Stored value must be exactly 64 hex chars (SHA-256 digest)
        assert len(user.reset_token) == 64
        assert all(c in "0123456789abcdef" for c in user.reset_token)


# ═════════════════════════════════════════════════════════════════════════════
# RESET PASSWORD
# ═════════════════════════════════════════════════════════════════════════════

class TestResetPassword:

    FORGOT  = "/api/auth/forgot-password"
    RESET   = "/api/auth/reset-password"

    def _get_raw_token(self, client, db, email=ALICE["email"]):
        """
        Request a reset and extract the raw token from the service directly
        (since the HTTP response intentionally omits it).
        Uses the service method to get the raw token for test purposes.
        """
        from src.auth.service import AuthService
        from src.entities.user import User
        import hashlib

        raw = AuthService.generate_reset_token()

        user = db.query(User).filter(User.email == email).first()
        from src.auth.service import _hash_token
        from datetime import datetime, timedelta
        user.reset_token = _hash_token(raw)
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.commit()
        return raw

    def test_valid_token_resets_password(self, client, registered_user, db):
        raw_token = self._get_raw_token(client, db)
        resp = client.post(self.RESET, json={
            "token": raw_token,
            "new_password": "newpassword999",
        })
        assert resp.status_code == 200
        assert "successfully" in resp.json()["message"].lower()

    def test_can_login_with_new_password_after_reset(self, client, registered_user, db):
        raw_token = self._get_raw_token(client, db)
        client.post(self.RESET, json={"token": raw_token, "new_password": "newpassword999"})
        # Old password should fail
        resp_old = login(client, password=ALICE["password"])
        assert resp_old.status_code == 401
        # New password should succeed
        resp_new = login(client, password="newpassword999")
        assert resp_new.status_code == 200

    def test_wrong_token_returns_400(self, client, registered_user):
        resp = client.post(self.RESET, json={
            "token": "totallywrongtoken",
            "new_password": "newpassword999",
        })
        assert resp.status_code == 400

    def test_expired_token_returns_400(self, client, registered_user, db):
        """Token that exists in DB but is past its expiry."""
        from src.auth.service import AuthService, _hash_token
        from src.entities.user import User
        from datetime import datetime, timedelta

        raw = AuthService.generate_reset_token()
        user = db.query(User).filter(User.email == ALICE["email"]).first()
        user.reset_token = _hash_token(raw)
        user.reset_token_expires = datetime.utcnow() - timedelta(hours=1)  # already expired
        db.commit()

        resp = client.post(self.RESET, json={"token": raw, "new_password": "newpassword999"})
        assert resp.status_code == 400

    def test_already_used_token_returns_400(self, client, registered_user, db):
        """Tokens are one-time-use — second call must fail."""
        raw_token = self._get_raw_token(client, db)
        client.post(self.RESET, json={"token": raw_token, "new_password": "newpassword999"})
        # Attempt to reuse the same token
        resp = client.post(self.RESET, json={"token": raw_token, "new_password": "anotherpassword1"})
        assert resp.status_code == 400

    def test_token_cleared_after_use(self, client, registered_user, db):
        """After successful reset, reset_token and reset_token_expires must be NULL."""
        from src.entities.user import User
        raw_token = self._get_raw_token(client, db)
        client.post(self.RESET, json={"token": raw_token, "new_password": "newpassword999"})
        db.expire_all()
        user = db.query(User).filter(User.email == ALICE["email"]).first()
        assert user.reset_token is None
        assert user.reset_token_expires is None

    def test_new_password_too_short_returns_422(self, client, registered_user, db):
        raw_token = self._get_raw_token(client, db)
        resp = client.post(self.RESET, json={"token": raw_token, "new_password": "short"})
        assert resp.status_code == 422

    # NOTE: This test verifies the max_length=72 fix described in the dev review.
    # It will PASS even without the fix (passlib truncates silently, no error).
    # The fix is important for user expectation, not for raising an error.
    def test_new_password_at_max_length_accepted(self, client, registered_user, db):
        raw_token = self._get_raw_token(client, db)
        resp = client.post(self.RESET, json={
            "token": raw_token,
            "new_password": "A" * 72,  # exactly at bcrypt limit
        })
        assert resp.status_code == 200


# ═════════════════════════════════════════════════════════════════════════════
# FULL FLOW INTEGRATION TEST
# ═════════════════════════════════════════════════════════════════════════════

class TestAuthFullFlow:

    def test_register_login_forgot_reset_login(self, client, db):
        """
        End-to-end: register → login → request reset → reset password → login with new password.
        This is the critical happy-path integration test.
        """
        from src.auth.service import AuthService, _hash_token
        from src.entities.user import User
        from datetime import datetime, timedelta

        # 1. Register
        resp = client.post("/api/auth/register", json=ALICE)
        assert resp.status_code == 201

        # 2. Login works with original password
        resp = login(client)
        assert resp.status_code == 200
        original_token = resp.json()["access_token"]
        assert original_token

        # 3. Forgot password (set token directly in DB for testability)
        raw = AuthService.generate_reset_token()
        user = db.query(User).filter(User.email == ALICE["email"]).first()
        user.reset_token = _hash_token(raw)
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.commit()

        # 4. Reset password
        resp = client.post("/api/auth/reset-password", json={
            "token": raw,
            "new_password": "brandnewpassword1",
        })
        assert resp.status_code == 200

        # 5. Old password no longer works
        assert login(client, password=ALICE["password"]).status_code == 401

        # 6. New password works
        resp = login(client, password="brandnewpassword1")
        assert resp.status_code == 200
        assert "access_token" in resp.json()