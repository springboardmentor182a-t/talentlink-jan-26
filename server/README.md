# Server (Backend)

This folder contains the backend API.

## Tech Stack
- FastAPI
- SQLAlchemy
- SQLite (default database)
- JWT Authentication

## Features
- User registration
- User login
- Password hashing
- Token-based authentication
- Database integration

## Installation

1. Navigate to server folder:
   cd server

2. Create virtual environment:
   python -m venv venv

3. Activate environment:

   Windows:
   venv\Scripts\activate

   Linux/Mac:
   source venv/bin/activate

4. Install dependencies:
   pip install -r requirements.txt

## Running the Server

Start the server with:

uvicorn src.main:app --reload

The backend runs on:
http://localhost:8000

API documentation:
http://localhost:8000/docs
