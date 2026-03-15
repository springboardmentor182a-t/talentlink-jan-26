from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database.core import engine, Base

# Import all models so Base.metadata.create_all picks them up
import src.entities.user      # noqa: F401 - registers User table
import src.entities.todo      # noqa: F401 - registers Todo table
import src.users.models       # noqa: F401 - registers FreelancerProfile, ClientProfile tables

from src.rate_limiter import rate_limit_middleware
from src.exceptions import error_handler_middleware

from src.auth.controller import router as auth_router
from src.users.router import router as users_router
from src.todos.controller import router as todos_router

from .users import router as user_router
from .projects import router as project_router

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentLink API", version="1.0.0")

# CORS configuration (allows frontend to call backend)
origins = [
    "http://localhost:5173",  # Vite frontend
    "http://localhost:3000",  # optional fallback
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middlewares
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(error_handler_middleware)

# Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(todos_router, prefix="/api/todos", tags=["Todos"])

app.include_router(user_router.router)
app.include_router(project_router.router)

@app.get("/")
async def root():
    return {"message": "TalentLink API", "version": "1.0.0"}