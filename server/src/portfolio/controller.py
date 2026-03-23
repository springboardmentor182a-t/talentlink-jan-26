from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.portfolio.models import PortfolioCreate, PortfolioResponse
from src.portfolio.service import get_portfolios_by_user, create_portfolio_item, delete_portfolio_item
from src.auth.service import get_current_user
from src.entities.user import User

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/", response_model=List[PortfolioResponse])
def read_portfolios(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_portfolios_by_user(db, current_user.id)

@router.post("/", response_model=PortfolioResponse)
def add_portfolio_item(item: PortfolioCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_portfolio_item(db, item, current_user.id)

@router.delete("/{item_id}")
def remove_portfolio_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = delete_portfolio_item(db, item_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return {"message": "Item deleted successfully"}
