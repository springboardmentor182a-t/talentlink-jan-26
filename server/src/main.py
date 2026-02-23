from fastapi import FastAPI
from src.database.core import Base, engine
from src.auth.controller import router as auth_router
from src.proposals.controller import router as proposal_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)
app.include_router(proposal_router)
