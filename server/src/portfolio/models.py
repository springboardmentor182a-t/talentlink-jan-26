from pydantic import BaseModel
from typing import Optional

class PortfolioBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
