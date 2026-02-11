from pydantic import BaseModel, EmailStr

# Base Schema
class UserBase(BaseModel):
    email: EmailStr

# For Registration
class UserCreate(UserBase):
    password: str
    role: str

# For Responses
class UserResponse(UserBase):
    id: int
    role: str
    
    class Config:
        from_attributes = True