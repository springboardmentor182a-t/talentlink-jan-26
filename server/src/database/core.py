# server/src/database/core.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONFIGURATION ---

# Later, for production, we change this string to connect to PostgreSQL.
SQLALCHEMY_DATABASE_URL = "sqlite:///./talentlink.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

# --- SETUP ---
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # Needed only for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the DB session in other files
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()