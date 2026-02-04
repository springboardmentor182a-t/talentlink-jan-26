from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from collections import defaultdict

# Simple in-memory rate limiter
request_counts = defaultdict(list)
RATE_LIMIT = 100  # requests
TIME_WINDOW = 60  # seconds

async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = datetime.now()
    
    # Clean old requests
    request_counts[client_ip] = [
        req_time for req_time in request_counts[client_ip]
        if now - req_time < timedelta(seconds=TIME_WINDOW)
    ]
    
    # Check rate limit
    if len(request_counts[client_ip]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests"
        )
    
    # Add current request
    request_counts[client_ip].append(now)
    
    response = await call_next(request)
    return response
