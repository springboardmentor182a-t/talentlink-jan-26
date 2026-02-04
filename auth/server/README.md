# TalentLink Backend

## Project Structure (Feature-Based MVC)

```
server/
├── src/
│   ├── auth/                 # Authentication feature
│   │   ├── __init__.py
│   │   ├── controller.py     # Auth routes/endpoints
│   │   ├── service.py        # Business logic
│   │   ├── models.py         # Database models
│   │   └── schemas.py        # Pydantic schemas
│   ├── users/                # Users feature
│   ├── todos/                # Todos feature
│   ├── database/             # Database configuration
│   ├── middleware/           # Custom middleware
│   ├── utils/                # Shared utilities
│   └── main.py               # FastAPI application
└── tests/                    # Test suite
```

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Edit `.env` file with your settings

### 4. Run Server
```bash
uvicorn src.main:app --reload
```

Server will start at: http://localhost:8000
API Documentation: http://localhost:8000/docs

## Running Tests
```bash
pytest
```

## Features
- Feature-based MVC architecture
- JWT Authentication
- User Management
- Todo CRUD operations
- Rate limiting
- Comprehensive error handling
- Unit tests for all features
