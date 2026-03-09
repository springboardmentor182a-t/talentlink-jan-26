# server/tests/test_auth_service.py
"""
Unit tests for AuthService -- test the service layer directly with a DB session,
independent of HTTP routing.
"""

import hashlib
import os
import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from unittest.mock import patch

from src.auth.service import AuthService, _hash_token
from src.auth.models import UserRegister, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from src.entities.user import User


# -- Fixtures -----------------------------------------------------------------

@pytest.fixture
def user_data():
    return UserRegister(
        email="alice@example.com",
        username="alice",
        password="securepass123",
        role="freelancer",
    )


@pytest.fixture
def existing_user(db, user_data):
    """Register alice in the DB and return the result dict."""
    return AuthService.register_user(db, user_data)


# -- Password hashing ---------------------------------------------------------

class TestPasswordHashing:

    def test_hash_is_not_plaintext(self):
        h = AuthService.hash_password("mypassword")
        assert h != "mypassword"

    def test_verify_correct_password(self):
        h = AuthService.hash_password("mypassword")
        assert AuthService.verify_password("mypassword", h) is True

    def test_verify_wrong_password(self):
        h = AuthService.hash_password("mypassword")
        assert AuthService.verify_password("wrongpassword", h) is False

    def test_hash_is_bcrypt(self):
        h = AuthService.hash_password("mypassword")
        assert h.startswith("$2b$")


# -- Token hash ---------------------------------------------------------------

class TestHashToken:

    def test_hash_is_sha256(self):
        raw = "sometoken"
        result = _hash_token(raw)
        expected = hashlib.sha256(raw.encode()).hexdigest()
        assert result == expected

    def test_hash_length_is_64_chars(self):
        result = _hash_token("sometoken")
        assert len(result) == 64

    def test_hash_is_deterministic(self):
        assert _hash_token("abc") == _hash_token("abc")

    def test_different_tokens_produce_different_hashes(self):
        assert _hash_token("token1") != _hash_token("token2")


# -- Register -----------------------------------------------------------------

class TestRegisterUser:

    def test_register_returns_user_and_token(self, db, user_data):
        result = AuthService.register_user(db, user_data)
        assert result["user"].email == user_data.email
        assert result["user"].username == user_data.username
        assert "access_token" in result
        assert result["token_type"] == "bearer"

    def test_password_is_hashed_in_db(self, db, user_data):
        AuthService.register_user(db, user_data)
        user = db.query(User).filter(User.email == user_data.email).first()
        assert user.hashed_password != user_data.password
        assert user.hashed_password.startswith("$2b$")

    def test_duplicate_email_raises_400(self, db, user_data):
        AuthService.register_user(db, user_data)
        duplicate = UserRegister(
            email=user_data.email,
            username="alice2",
            password="securepass123",
            role="freelancer",
        )
        with pytest.raises(HTTPException) as exc:
            AuthService.register_user(db, duplicate)
        assert exc.value.status_code == 400

    def test_duplicate_username_raises_400(self, db, user_data):
        AuthService.register_user(db, user_data)
        duplicate = UserRegister(
            email="alice2@example.com",
            username=user_data.username,
            password="securepass123",
            role="freelancer",
        )
        with pytest.raises(HTTPException) as exc:
            AuthService.register_user(db, duplicate)
        assert exc.value.status_code == 400


# -- Authenticate -------------------------------------------------------------

class TestAuthenticateUser:

    def test_valid_credentials_returns_token(self, db, user_data, existing_user):
        login = UserLogin(email=user_data.email, password=user_data.password)
        result = AuthService.authenticate_user(db, login)
        assert "access_token" in result

    def test_wrong_password_raises_401(self, db, user_data, existing_user):
        login = UserLogin(email=user_data.email, password="wrongpassword")
        with pytest.raises(HTTPException) as exc:
            AuthService.authenticate_user(db, login)
        assert exc.value.status_code == 401

    def test_non_existent_email_raises_401(self, db):
        login = UserLogin(email="ghost@example.com", password="password123")
        with pytest.raises(HTTPException) as exc:
            AuthService.authenticate_user(db, login)
        assert exc.value.status_code == 401

    def test_last_login_updated_on_success(self, db, user_data, existing_user):
        login = UserLogin(email=user_data.email, password=user_data.password)
        AuthService.authenticate_user(db, login)
        user = db.query(User).filter(User.email == user_data.email).first()
        assert user.last_login is not None


# -- Password Reset -----------------------------------------------------------

class TestPasswordReset:

    def _request_reset(self, db, email: str) -> str:
        """Issue a reset token and return the raw value.

        Patches _send_reset_email so tests never open an SMTP connection, and
        sets APP_ENV=development so the service includes the raw token in the
        return value. This is the only correct way to obtain the token in unit
        tests -- do not call request_password_reset without these patches, as
        the result["reset_token"] key will be absent when APP_ENV is unset,
        causing assertions to fail silently on None.
        """
        with patch("src.auth.service._send_reset_email"), \
             patch.dict(os.environ, {"APP_ENV": "development"}):
            result = AuthService.request_password_reset(
                db, ForgotPasswordRequest(email=email)
            )
        raw_token = result.get("reset_token")
        assert raw_token is not None, (
            "reset_token absent from service response -- APP_ENV patch may have failed"
        )
        return raw_token

    def test_request_reset_returns_message(self, db, user_data, existing_user):
        with patch("src.auth.service._send_reset_email"), \
             patch.dict(os.environ, {"APP_ENV": "development"}):
            result = AuthService.request_password_reset(
                db, ForgotPasswordRequest(email=user_data.email)
            )
        assert "message" in result

    def test_request_reset_non_existent_email_returns_same_message(self, db):
        # No user exists -- _send_reset_email is never called, patch not needed.
        result = AuthService.request_password_reset(
            db, ForgotPasswordRequest(email="ghost@example.com")
        )
        assert "message" in result
        assert "If that email exists" in result["message"]

    def test_reset_token_stored_hashed(self, db, user_data, existing_user):
        # Read the token directly from the DB rather than from the service
        # response. This makes the assertion independent of APP_ENV: the test
        # cannot silently pass with raw_token=None when APP_ENV is unset.
        with patch("src.auth.service._send_reset_email"):
            AuthService.request_password_reset(
                db, ForgotPasswordRequest(email=user_data.email)
            )

        user = db.query(User).filter(User.email == user_data.email).first()

        # The stored value must be a 64-char SHA-256 hex digest, not the raw token.
        assert user.reset_token is not None, "reset_token was not written to the DB"
        assert len(user.reset_token) == 64, "reset_token is not a SHA-256 hex digest"
        assert all(c in "0123456789abcdef" for c in user.reset_token), (
            "reset_token contains non-hex characters -- raw token may have been stored"
        )

    def test_send_reset_email_is_called_in_production(self, db, user_data, existing_user):
        """Verify _send_reset_email is called when APP_ENV != 'development'."""
        with patch("src.auth.service._send_reset_email") as mock_send, \
             patch.dict(os.environ, {"APP_ENV": "production"}):
            AuthService.request_password_reset(
                db, ForgotPasswordRequest(email=user_data.email)
            )
        mock_send.assert_called_once()
        # First positional arg is the email address
        assert mock_send.call_args[0][0] == user_data.email

    def test_send_reset_email_not_called_in_development(self, db, user_data, existing_user):
        """In development mode the token is returned in the response; no email is sent."""
        with patch("src.auth.service._send_reset_email") as mock_send, \
             patch.dict(os.environ, {"APP_ENV": "development"}):
            AuthService.request_password_reset(
                db, ForgotPasswordRequest(email=user_data.email)
            )
        mock_send.assert_not_called()

    def test_reset_with_valid_token_succeeds(self, db, user_data, existing_user):
        raw_token = self._request_reset(db, user_data.email)
        result = AuthService.reset_password(
            db, ResetPasswordRequest(token=raw_token, new_password="newpassword999")
        )
        assert "successfully" in result["message"].lower()

    def test_reset_clears_token_from_db(self, db, user_data, existing_user):
        raw_token = self._request_reset(db, user_data.email)
        AuthService.reset_password(db, ResetPasswordRequest(
            token=raw_token, new_password="newpassword999"
        ))

        db.expire_all()
        user = db.query(User).filter(User.email == user_data.email).first()
        assert user.reset_token is None
        assert user.reset_token_expires is None

    def test_expired_token_raises_400(self, db, user_data, existing_user):
        raw_token = self._request_reset(db, user_data.email)

        user = db.query(User).filter(User.email == user_data.email).first()
        user.reset_token_expires = datetime.utcnow() - timedelta(hours=1)
        db.commit()

        with pytest.raises(HTTPException) as exc:
            AuthService.reset_password(db, ResetPasswordRequest(
                token=raw_token, new_password="newpassword999"
            ))
        assert exc.value.status_code == 400

    def test_wrong_token_raises_400(self, db, user_data, existing_user):
        with pytest.raises(HTTPException) as exc:
            AuthService.reset_password(db, ResetPasswordRequest(
                token="completelyinvalidtoken", new_password="newpassword999"
            ))
        assert exc.value.status_code == 400

    def test_reused_token_raises_400(self, db, user_data, existing_user):
        raw_token = self._request_reset(db, user_data.email)
        AuthService.reset_password(db, ResetPasswordRequest(
            token=raw_token, new_password="newpassword999"
        ))

        with pytest.raises(HTTPException) as exc:
            AuthService.reset_password(db, ResetPasswordRequest(
                token=raw_token, new_password="anotherpassword1"
            ))
        assert exc.value.status_code == 400

    def test_new_password_is_hashed_after_reset(self, db, user_data, existing_user):
        raw_token = self._request_reset(db, user_data.email)
        AuthService.reset_password(db, ResetPasswordRequest(
            token=raw_token, new_password="newpassword999"
        ))

        db.expire_all()
        user = db.query(User).filter(User.email == user_data.email).first()
        assert user.hashed_password != "newpassword999"
        assert user.hashed_password.startswith("$2b$")
        assert AuthService.verify_password("newpassword999", user.hashed_password)