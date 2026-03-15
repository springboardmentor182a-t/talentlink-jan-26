# TalentLink

TalentLink is a platform connecting clients and freelancers.

## Prerequisites
- Python 3.8+
- Node.js & npm

## Getting Started

### 1. Backend Setup

The backend is built with FastAPI and uses SQLite.

1.  **Navigate to the project root.**
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r server/requirements.txt
    ```
4.  **Start the server:**
    ```bash
    cd server
    uvicorn src.main:app --reload
    ```
    The API will be available at [http://localhost:8000](http://localhost:8000).
    API Documentation (Swagger UI) is at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup

The frontend is built with React.

1.  **Open a new terminal.**
2.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the development server:**
    ```bash
    npm start
    ```
    The application will open at [http://localhost:3000](http://localhost:3000).

## Usage Flow

1.  **Register a Client:**
    - Go to the Sign Up page.
    - Choose "Client".
    - Create an account.
2.  **Post a Job (Client):**
    - Currently, job posting is available via API docs: [http://localhost:8000/docs#/Jobs/create_new_job_jobs__post](http://localhost:8000/docs#/Jobs/create_new_job_jobs__post).
    - Use the "Authorize" button in Swagger with your client credentials to get a token.
    - Use access token to Post a new job.
3.  **Register a Freelancer:**
    - Go to the Sign Up page.
    - Choose "Freelancer".
    - Create an account.
    - You will be redirected to the Dashboard where you can see available jobs and submit proposals.