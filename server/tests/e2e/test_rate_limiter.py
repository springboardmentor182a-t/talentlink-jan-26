# server/tests/e2e/test_rate_limiter.py
"""
Rate limiter tests.

The TTLCache resets between test functions because the module-level `_cache`
object persists for the process lifetime. We clear it manually in a fixture
to get a clean slate per test.
"""

import pytest
from unittest.mock import patch


@pytest.fixture(autouse=True)
def clear_rate_limiter_cache():
    """Reset the TTLCache before each test so counts don't bleed between tests."""
    from src.rate_limiter import _cache, _lock
    with _lock:
        _cache.clear()
    yield
    with _lock:
        _cache.clear()


class TestRateLimiter:

    def test_100_requests_all_succeed(self, client):
        """Exactly at the limit — all should pass."""
        for i in range(100):
            resp = client.get("/")
            assert resp.status_code == 200, f"Request {i+1} unexpectedly failed"

    def test_101st_request_returns_429(self, client):
        """One over the limit — the 101st must be rejected."""
        for _ in range(100):
            client.get("/")
        resp = client.get("/")
        assert resp.status_code == 429

    def test_429_response_has_detail(self, client):
        for _ in range(100):
            client.get("/")
        resp = client.get("/")
        assert "detail" in resp.json()

    def test_rate_limit_is_per_ip(self, client):
        """
        Different IPs must have independent counters — exhausting IP A must
        not affect IP B.

        The previous test cleared the entire cache between IPs, which meant
        it was testing cache-clear behaviour, not IP isolation. That gave
        false confidence — the rate limiter could have been keying on a
        constant and the test would still pass.

        We patch _get_client_ip at the source so the middleware sees two
        distinct IPs without clearing the cache between them. IP A is
        exhausted first; IP B's first request must still return 200.
        """
        with patch("src.rate_limiter._get_client_ip", return_value="10.0.0.1"):
            for _ in range(100):
                client.get("/")
            assert client.get("/").status_code == 429, "IP A should be rate-limited after 100 requests"

        # Cache is NOT cleared — we switch IPs only.
        with patch("src.rate_limiter._get_client_ip", return_value="10.0.0.2"):
            resp = client.get("/")
            assert resp.status_code == 200, "IP B should be unaffected by IP A's exhausted limit"

    def test_ws_upgrade_not_rate_limited(self, client):
        """
        WebSocket upgrade requests (Upgrade: websocket header) must not be
        counted against the rate limit — they hold long-lived connections,
        not individual request slots.
        """
        # Exhaust the rate limit
        for _ in range(100):
            client.get("/")
        assert client.get("/").status_code == 429

        # But a WS upgrade should still pass through the middleware
        # (it will fail later at ticket validation, not at the rate limiter)
        # We verify by checking that the rate limiter's cache does NOT
        # increment for WS requests
        from src.rate_limiter import _cache, _lock
        with _lock:
            count_before = dict(_cache)

        # Attempt a WS connection (will fail at ticket validation, not rate limit)
        try:
            with client.websocket_connect("/ws/1?ticket=fake"):
                pass
        except Exception:
            pass  # expected — bad ticket

        with _lock:
            count_after = dict(_cache)

        # The cache should not have a new entry or incremented count from WS
        assert count_before == count_after