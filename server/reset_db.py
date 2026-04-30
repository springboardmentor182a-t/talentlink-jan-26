import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from src.database.core import Base, engine
from sqlalchemy import text

print("Nuking public schema to forcefully drop ALL tables...")
with engine.begin() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))

print("Recreating clean tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
