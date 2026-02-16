from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.auth import controller as auth_controller
# from src.users import controller as users_controller
from src.messages import controller as messages_controller

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_controller.router, prefix="/auth", tags=["Auth"])
# app.include_router(users_controller.router, prefix="/users", tags=["Users"])
app.include_router(messages_controller.router, prefix="/messages", tags=["Messages"])

@app.get("/")
def home():
    return {"message": "Backend working ✅"}
