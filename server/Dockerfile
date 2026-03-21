# ── Stage 1: build dependencies ───────────────────────────────────────────────
FROM python:3.10-slim AS deps

WORKDIR /app

# libpq-dev + gcc needed to compile psycopg2-binary at install time only.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create venv and install into it — isolated, no system Python pollution.
RUN python -m venv /app/venv
COPY requirements.txt .
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt


# ── Stage 2: runtime image ────────────────────────────────────────────────────
FROM python:3.10-slim AS runtime

# Non-root user — never run app servers as root inside a container.
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy only the venv from the build stage — no gcc, no libpq-dev in final image.
COPY --from=deps /app/venv /app/venv

# Copy application source.
COPY src/ ./src/

EXPOSE 8000

USER appuser

# Use the venv's uvicorn directly.
# Single worker — ConnectionManager is in-memory, breaks with --workers > 1.
# Fix: add Redis pub/sub (REMAINING_ISSUES.md #9) then increase workers.
CMD ["/app/venv/bin/uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
