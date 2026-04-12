# ── Stage 1: Build React Frontend ─────────────────────────
FROM node:18-alpine AS frontend

WORKDIR /app/client

COPY client/package.json .
RUN npm install

COPY client/ .
RUN npm run build

# ── Stage 2: Build Python Backend ─────────────────────────
FROM python:3.11-slim AS backend

WORKDIR /app

# Install PostgreSQL dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY server/src/ ./src/

# Copy built React frontend into backend static folder
COPY --from=frontend /app/client/build ./static

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]