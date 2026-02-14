from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database.connection import engine, Base
from src.middleware.rate_limiter import rate_limit_middleware
from src.middleware.error_handler import error_handler_middleware
from src.auth import controller as auth_controller
from src.users import controller as users_controller
from src.todos import controller as todos_controller

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TalentLink API",
    description="Feature-based MVC Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(error_handler_middleware)

# Include routers
app.include_router(auth_controller.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_controller.router, prefix="/api/users", tags=["Users"])
app.include_router(todos_controller.router, prefix="/api/todos", tags=["Todos"])

@app.get("/")
async def root():
    return {
        "message": "TalentLink API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
