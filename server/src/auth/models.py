from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, Literal


# ── Registration & Login ──────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=72)
    # MUST FIX (applied): was `str` with no validation — any value including
    # "admin" was silently written to the DB. Literal enforces the allowed set
    # at the Pydantic layer before the service is ever called.
    role: Literal["freelancer", "client", "both"] = "freelancer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    created_at: datetime
    # TODO (low priority, pre-staging): add `last_login: Optional[datetime] = None`
    # once the frontend has a "last active" display. The DB column already exists.

    class Config:
        from_attributes = True


class RegisterResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str


# Login returns a deliberately slimmer user object than register.
# created_at is omitted — the frontend has no use for it at login time,
# and trimming the surface area reduces accidental data exposure if a
# response_model is ever accidentally loosened in future.
class LoginUserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: LoginUserResponse
    access_token: str
    token_type: str


# ── Password Reset ────────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    # reset_token is intentionally excluded from this response model so the
    # typed API contract never exposes it. The service layer returns it only
    # for local dev convenience; remove that too before going to production.


class ResetPasswordRequest(BaseModel):
    token: str
    # MUST FIX (applied): was `min_length=8` only. passlib bcrypt silently
    # truncates passwords over 72 bytes — a 200-char password becomes a shorter
    # effective password with no warning to the user. Cap matches UserRegister.
    new_password: str = Field(..., min_length=8, max_length=72)


class ResetPasswordResponse(BaseModel):
    message: str
