from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.todos.models import TodoCreate, TodoUpdate, TodoResponse
from src.todos.service import TodoService

router = APIRouter()


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new todo for the authenticated user."""
    return TodoService.create_todo(db, todo_data, current_user.id)


@router.get("/", response_model=List[TodoResponse])
async def get_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all todos for the authenticated user."""
    return TodoService.get_todos(db, current_user.id)


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific todo — 404 if it doesn't belong to the current user."""
    return TodoService.get_todo(db, todo_id, current_user.id)


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a todo — 404 if it doesn't belong to the current user."""
    return TodoService.update_todo(db, todo_id, todo_data, current_user.id)


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a todo — 404 if it doesn't belong to the current user."""
    return TodoService.delete_todo(db, todo_id, current_user.id)