from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, CheckConstraint
from sqlalchemy.sql import func
from src.database.core import Base

class Review(Base):
    __tablename__ = "reviews"

    id          = Column(Integer, primary_key=True, index=True)
    rating      = Column(Integer, nullable=False)
    comment     = Column(Text, nullable=True)
    project_id  = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"),    nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"),    nullable=False)
    created_at  = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="chk_reviews_rating"),
    )