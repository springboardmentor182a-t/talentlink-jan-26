from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.todos.models import TodoCreate, TodoUpdate, TodoResponse
from src.todos.service import TodoService

router = APIRouter()


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(todo_data: TodoCreate, db: Session = Depends(get_db)):
    """Create a new todo"""
    user_id = 1  # TODO: Replace with actual user from JWT token
    return TodoService.create_todo(db, todo_data, user_id)


@router.get("/", response_model=List[TodoResponse])
async def get_todos(db: Session = Depends(get_db)):
    """Get all todos for current user"""
    user_id = 1  # TODO: Replace with actual user from JWT token
    return TodoService.get_todos(db, user_id)


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """Get a specific todo"""
    user_id = 1  # TODO: Replace with actual user from JWT token
    return TodoService.get_todo(db, todo_id, user_id)


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: int, todo_data: TodoUpdate, db: Session = Depends(get_db)):
    """Update a todo"""
    user_id = 1  # TODO: Replace with actual user from JWT token
    return TodoService.update_todo(db, todo_id, todo_data, user_id)


@router.delete("/{todo_id}")
async def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """Delete a todo"""
    user_id = 1  # TODO: Replace with actual user from JWT token
    return TodoService.delete_todo(db, todo_id, user_id)
