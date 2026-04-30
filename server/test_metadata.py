import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from src.database.core import Base, engine
from src.entities.user import User
from src.projects.model import Project

print("Tables in metadata:", list(Base.metadata.tables.keys()))
Base.metadata.create_all(bind=engine)
print("Finished create_all.")
