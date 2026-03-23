from fastapi import Request, HTTPException, status
from cachetools import TTLCache
import threading

# TTLCache auto-expires entries after TIME_WINDOW seconds — no manual cleanup,
# no unbounded growth, no memory leak from one-time IPs.
# maxsize=10_000 caps memory: at ~100 bytes per entry that's ~1 MB worst case.
TIME_WINDOW = 60     # seconds — rolling window length
RATE_LIMIT  = 100    # max requests per IP per window
CACHE_MAX   = 10_000

# TTLCache is not thread-safe — wrap all access with a lock.
_cache: TTLCache = TTLCache(maxsize=CACHE_MAX, ttl=TIME_WINDOW)
_lock = threading.Lock()

# TRUSTED_PROXY: set to True only when your infrastructure (nginx, AWS ALB, etc.)
# guarantees it sets X-Forwarded-For and strips any client-supplied value.
# If False, falls back to the direct connection IP (safe for local/no-proxy setups).
# Set via env var so staging and production can differ without a code change:
#   TRUSTED_PROXY=true  (in your staging/.env or environment config)
import os
TRUSTED_PROXY = os.getenv("TRUSTED_PROXY", "false").lower() == "true"


def _get_client_ip(request: Request) -> str:
    """Return the real client IP.

    When running behind a trusted reverse proxy (nginx, ALB, Cloudflare),
    the real client IP is in X-Forwarded-For. Without a trusted proxy,
    that header can be spoofed by the client — so we only read it when
    TRUSTED_PROXY=true is explicitly set in the environment.
    """
    if TRUSTED_PROXY:
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        if forwarded_for:
            # X-Forwarded-For can be a comma-separated list — leftmost is the client.
            return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


async def rate_limit_middleware(request: Request, call_next):
    # WebSocket upgrade requests hold a long-lived connection, not individual
    # HTTP requests — don't count them against the per-IP rate limit.
    if request.headers.get("upgrade", "").lower() == "websocket":
        return await call_next(request)

    client_ip = _get_client_ip(request)

    with _lock:
        count = _cache.get(client_ip, 0)
        if count >= RATE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests — slow down",
            )
        _cache[client_ip] = count + 1

    response = await call_next(request)
    return response
