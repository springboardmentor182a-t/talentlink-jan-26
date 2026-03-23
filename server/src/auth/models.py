from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token: str
    token_type: str = "bearer"
    role: str
    user: dict


class ProfileResponse(BaseModel):
    fullName: str
    professionalTitle: str | None = None
    hourlyRate: str | None = None
    location: str | None = None
    experience: str | None = None
    email: EmailStr
    bio: str | None = None
    skills: list[str] = []

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    fullName: str | None = None
    professionalTitle: str | None = None
    hourlyRate: str | None = None
    location: str | None = None
    experience: str | None = None
    bio: str | None = None
    skills: list[str] = []
