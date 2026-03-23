from sqlalchemy.orm import Session
from src.entities.portfolio import Portfolio
from src.portfolio.models import PortfolioCreate

def get_portfolios_by_user(db: Session, user_id: int):
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

def create_portfolio_item(db: Session, item: PortfolioCreate, user_id: int):
    db_item = Portfolio(
        **item.dict(),
        user_id=user_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_portfolio_item(db: Session, item_id: int, user_id: int):
    db_item = db.query(Portfolio).filter(Portfolio.id == item_id, Portfolio.user_id == user_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False
