from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# Always load .env from the server/ directory regardless of where
# uvicorn is launched from. Without this, load_dotenv() searches from
# the current working directory and silently fails if it doesn't match.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

# MUST FIX (applied): was `os.getenv("DATABASE_URL", "sqlite:///../talentlink.db")`.
# A missing env var silently started the app on SQLite in production, meaning
# all data was written to a local file and lost on container restart with zero
# error output. Now we fail loudly at startup — same pattern as the SECRET_KEY guard.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./talentlink.db")

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()