from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import core
from .users import models as user_models, router as user_router
# I am importing your projects router here so the "Find Projects" page works
#from .projects import models as project_models, router as project_router 

# 1. Create Tables (For both Users and Projects)
user_models.Base.metadata.create_all(bind=core.engine)
#project_models.Base.metadata.create_all(bind=core.engine)

app = FastAPI()

# 2. SECURITY PASS (CORS) - "Nuclear Fix"
# We allow ["*"] which means "Everyone". 
# This fixes the specific error you saw in the console.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register Routes
# This enables URLs like /users/...
app.include_router(user_router.router, tags=["Users"])
# This enables URLs like /projects/...
#app.include_router(project_router.router, prefix="/projects", tags=["Projects"])

@app.get("/")
def read_root():
    return {"message": "TalentLink API is running!"}