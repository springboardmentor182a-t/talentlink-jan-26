from pydantic import BaseModel, ConfigDict


# ---------------------------
# Freelancer Profile Schema
# ---------------------------
class FreelancerProfileBase(BaseModel):
    fullName: str
    skills: str
    hourlyRate: float
    experience: int
    location: str
    availability: str


class FreelancerProfileCreate(FreelancerProfileBase):
    pass


class FreelancerProfileResponse(FreelancerProfileBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ---------------------------
# Client Profile Schema
# ---------------------------
class ClientProfileBase(BaseModel):
    companyName: str
    about: str
    location: str
    website: str
    industry: str


class ClientProfileCreate(ClientProfileBase):
    pass


class ClientProfileResponse(ClientProfileBase):
    id: int

    model_config = ConfigDict(from_attributes=True)