from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List

from src.entities.todo import Todo
from src.todos.models import TodoCreate, TodoUpdate


class TodoService:

    @staticmethod
    def create_todo(db: Session, todo_data: TodoCreate, user_id: int) -> Todo:
        db_todo = Todo(**todo_data.model_dump(), user_id=user_id)
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        return db_todo

    @staticmethod
    def get_todos(db: Session, user_id: int) -> List[Todo]:
        return db.query(Todo).filter(Todo.user_id == user_id).all()

    @staticmethod
    def get_todo(db: Session, todo_id: int, user_id: int) -> Todo:
        todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()
        if not todo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
        return todo

    @staticmethod
    def update_todo(db: Session, todo_id: int, todo_data: TodoUpdate, user_id: int) -> Todo:
        todo = TodoService.get_todo(db, todo_id, user_id)
        for key, value in todo_data.model_dump(exclude_unset=True).items():
            setattr(todo, key, value)
        db.commit()
        db.refresh(todo)
        return todo

    @staticmethod
    def delete_todo(db: Session, todo_id: int, user_id: int) -> dict:
        todo = TodoService.get_todo(db, todo_id, user_id)
        db.delete(todo)
        db.commit()
        return {"message": "Todo deleted successfully"}
