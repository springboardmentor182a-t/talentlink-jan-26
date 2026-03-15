# server/src/projects/schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

# 1. Base Schema (Shared properties)
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=10, max_length=100, description="Project title must be between 10 and 100 characters")
    description: str = Field(..., min_length=50, max_length=5000, description="Project description must be at least 50 characters")
    budget: Decimal = Field(..., gt=0, description="Budget must be greater than zero")

# 2. Create Schema (What the frontend sends)
class ProjectCreate(ProjectBase):
    pass

# 3. Update Schema (For partial updates later)
class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=10, max_length=100)
    description: Optional[str] = Field(None, min_length=50, max_length=5000)
    budget: Optional[Decimal] = Field(None, gt=0)
    status: Optional[str] = None

# 4. Response Schema (What the API returns)
class ProjectResponse(ProjectBase):
    id: int
    client_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class ConfigDict:
        from_attributes = True

# 5. List Response Schema (For paginated endpoints)
class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total_count: int
    skip: int
    limit: int
