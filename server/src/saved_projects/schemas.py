from pydantic import BaseModel, ConfigDict
from datetime import datetime


class SavedProjectResponse(BaseModel):
    id:         int
    user_id:    int
    project_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)