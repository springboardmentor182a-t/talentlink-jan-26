from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.client_dashboard.router import router as client_dashboard_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(client_dashboard_router)

@app.get("/")
def home():
    return {"message": "Backend working ✅"}