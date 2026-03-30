from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment (required)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please configure your database connection in the .env file. "
        "See .env.example for examples."
    )

# connect_args needed for SQLite to allow multiple threads (optional for other databases)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

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
