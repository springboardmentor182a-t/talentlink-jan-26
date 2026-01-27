# server/src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- NEW IMPORT
from .database.core import engine
from .users import models, router as user_router

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- NEW: SECURITY PASS (CORS) ---
# This tells the server: "Allow requests from the React app running on port 5173"
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------

app.include_router(user_router.router)

@app.get("/")
def read_root():
    return {"message": "TalentLink API is running!"}