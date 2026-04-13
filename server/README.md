# Server (Backend)

This folder contains the FastAPI backend.

## Tech Stack
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- WebSockets (real-time messaging)
- Groq AI (AI features)

## Features
- User registration & login
- Google & GitHub OAuth
- JWT token authentication
- Password hashing with bcrypt
- Real-time messaging via WebSockets
- Real-time notifications
- AI-powered features

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

5. Create .env file:
   DATABASE_URL=postgresql://user:password@localhost:5432/talentlink
   SECRET_KEY=your_secret_key
   GROQ_API_KEY=your_groq_key
   FRONTEND_URL=http://localhost:3000

## Running the Server

uvicorn src.main:app --reload

Backend runs at:   http://localhost:8000
API docs at:       http://localhost:8000/docs