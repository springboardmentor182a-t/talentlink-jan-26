from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


# --- Registration & Login Schemas ---

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=72)
    role: str = Field(default="freelancer")  # freelancer | client | both


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
        
class RegisterResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str

# --- Password Reset Schemas ---

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class ResetPasswordResponse(BaseModel):
    message: str
