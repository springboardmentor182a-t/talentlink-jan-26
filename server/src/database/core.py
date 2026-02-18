from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# for simplicity we'll use a local SQLite file; swap URL for other databases
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# connect_args needed for SQLite to allow multiple threads
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Yield a SQLAlchemy session, closing it when finished."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create database tables based on the models."""
    # import here to avoid circular imports
    from src.users import models as user_models
    from src.messages import models as message_models

    user_models.Base.metadata.create_all(bind=engine)
    message_models.Base.metadata.create_all(bind=engine)
