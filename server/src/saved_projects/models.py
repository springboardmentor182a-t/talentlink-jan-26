from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime, timezone
from ..database.core import Base


class SavedProject(Base):
    __tablename__ = "saved_projects"
    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="uq_saved_project"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))