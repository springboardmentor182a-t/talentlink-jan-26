# talentlink-jan-26

This repo contains a simple React frontend and a FastAPI backend. In the recent update the project was modified to store and retrieve message data from an actual database instead of using in‑memory mock arrays.

### Running Backend

* Uses SQLite + SQLAlchemy.
* Database file `test.db` is created at startup; two example users are seeded automatically.
* Key endpoints:
  * `GET /users` – return all users
  * `POST /messages/` – add a message
  * `GET /messages/{user_id}` – retrieve messages for a user (optionally supply `other_user_id` query parameter).

```bash
cd server
python3 -m uvicorn src.main:app --reload
```

### Running Frontend

Chat page fetches user list from the database instead of mock data. Messages are read/written to the backend.

```bash
cd client
npm install
npm start
```
