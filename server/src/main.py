from fastapi import FastAPI
from .database.core import engine, Base
from .users import models, router as user_router

# Create the tables automatically when the app starts
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user_router.router)

@app.get("/")
def home():
    return {"message": "Backend working ✅"}