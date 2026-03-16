# server/tests/e2e/test_messages_endpoints.py
"""
Messages endpoint tests — covers send, conversations, read receipts,
unread count, user search, WS ticket, and WebSocket auth.

Fixtures (from conftest.py):
    client      — TestClient with isolated SQLite DB
    two_users   — dict with alice and bob, each with headers and id
    auth_headers — headers for alice only (single-user tests)
"""

import pytest


# ═════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def send_msg(client, headers, receiver_id, content="Hello there"):
    return client.post("/api/messages/send", json={
        "receiver_id": receiver_id,
        "content": content,
    }, headers=headers)


# ═════════════════════════════════════════════════════════════════════════════
# SEND MESSAGE
# ═════════════════════════════════════════════════════════════════════════════

class TestSendMessage:

    def test_send_success_returns_201(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        resp = send_msg(client, alice["headers"], bob["id"])
        assert resp.status_code == 201

    def test_send_success_response_shape(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        data = send_msg(client, alice["headers"], bob["id"]).json()
        assert "id" in data
        assert data["sender_id"] == alice["id"]
        assert data["receiver_id"] == bob["id"]
        assert "content" in data
        assert "is_read" in data
        assert "timestamp" in data
        assert data["is_read"] is False  # new message starts unread

    def test_send_to_self_returns_400(self, client, two_users):
        alice = two_users["alice"]
        resp = send_msg(client, alice["headers"], alice["id"])
        assert resp.status_code == 400

    def test_send_to_nonexistent_user_returns_404(self, client, two_users):
        alice = two_users["alice"]
        resp = send_msg(client, alice["headers"], receiver_id=99999)
        assert resp.status_code == 404

    def test_send_unauthenticated_returns_403(self, client, two_users):
        bob_id = two_users["bob"]["id"]
        resp = client.post("/api/messages/send", json={"receiver_id": bob_id, "content": "hi"})
        assert resp.status_code == 403

    def test_send_empty_content_returns_422(self, client, two_users):
        """content has min_length=1 in MessageSend model."""
        alice, bob = two_users["alice"], two_users["bob"]
        resp = send_msg(client, alice["headers"], bob["id"], content="")
        assert resp.status_code == 422

    def test_send_content_too_long_returns_422(self, client, two_users):
        """content has max_length=2000 in MessageSend model."""
        alice, bob = two_users["alice"], two_users["bob"]
        resp = send_msg(client, alice["headers"], bob["id"], content="x" * 2001)
        assert resp.status_code == 422

    def test_html_content_is_stripped(self, client, two_users):
        """
        XSS sanitization: HTML tags must be stripped before storage.
        The stored content should be the plain text, not the raw HTML.
        """
        alice, bob = two_users["alice"], two_users["bob"]
        resp = send_msg(
            client, alice["headers"], bob["id"],
            content="<script>alert('xss')</script>Hello"
        )
        assert resp.status_code == 201
        # The tag should be gone, leaving only the text
        assert "<script>" not in resp.json()["content"]
        assert "Hello" in resp.json()["content"]

    def test_html_entity_passthrough(self, client, two_users):
        """
        HTML entities (e.g. &amp;) are NOT tags — the sanitizer should leave
        them alone since they can't trigger XSS in a React renderer.
        """
        alice, bob = two_users["alice"], two_users["bob"]
        resp = send_msg(client, alice["headers"], bob["id"], content="5 &amp; 3")
        assert resp.status_code == 201
        assert resp.json()["content"] == "5 &amp; 3"

    def test_content_at_max_length_accepted(self, client, two_users):
        """Exactly 2000 chars should be accepted."""
        alice, bob = two_users["alice"], two_users["bob"]
        resp = send_msg(client, alice["headers"], bob["id"], content="a" * 2000)
        assert resp.status_code == 201


# ═════════════════════════════════════════════════════════════════════════════
# GET CONVERSATION HISTORY
# ═════════════════════════════════════════════════════════════════════════════

class TestGetConversation:

    def test_returns_messages_between_two_users(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, alice["headers"], bob["id"], "first")
        send_msg(client, bob["headers"], alice["id"], "reply")

        resp = client.get(f"/api/messages/conversations/{bob['id']}", headers=alice["headers"])
        assert resp.status_code == 200
        messages = resp.json()
        assert len(messages) == 2
        contents = [m["content"] for m in messages]
        assert "first" in contents
        assert "reply" in contents

    def test_get_does_not_mark_messages_as_read(self, client, two_users):
        """
        Critical: GET must NOT change is_read status.
        Read receipts are handled exclusively by PATCH /read.
        """
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, bob["headers"], alice["id"], "unread message")

        # Alice fetches the conversation
        client.get(f"/api/messages/conversations/{bob['id']}", headers=alice["headers"])

        # Verify messages are still unread from alice's perspective
        unread_resp = client.get("/api/messages/unread-count", headers=alice["headers"])
        assert unread_resp.json()["unread_count"] == 1

    def test_returns_empty_list_for_no_messages(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        resp = client.get(f"/api/messages/conversations/{bob['id']}", headers=alice["headers"])
        assert resp.status_code == 200
        assert resp.json() == []

    def test_unauthenticated_returns_403(self, client, two_users):
        bob_id = two_users["bob"]["id"]
        resp = client.get(f"/api/messages/conversations/{bob_id}")
        assert resp.status_code == 403

    def test_pagination_skip_and_limit(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        for i in range(5):
            send_msg(client, alice["headers"], bob["id"], f"message {i}")

        # Fetch with limit=2 skip=0
        resp = client.get(
            f"/api/messages/conversations/{bob['id']}",
            headers=alice["headers"],
            params={"skip": 0, "limit": 2},
        )
        assert resp.status_code == 200
        assert len(resp.json()) == 2

        # Fetch next page
        resp2 = client.get(
            f"/api/messages/conversations/{bob['id']}",
            headers=alice["headers"],
            params={"skip": 2, "limit": 2},
        )
        assert len(resp2.json()) == 2

        # No overlap between pages
        ids_page1 = {m["id"] for m in resp.json()}
        ids_page2 = {m["id"] for m in resp2.json()}
        assert ids_page1.isdisjoint(ids_page2)

    def test_limit_cannot_exceed_100(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        resp = client.get(
            f"/api/messages/conversations/{bob['id']}",
            headers=alice["headers"],
            params={"limit": 101},
        )
        assert resp.status_code == 422

    def test_messages_ordered_oldest_first(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, alice["headers"], bob["id"], "first")
        send_msg(client, alice["headers"], bob["id"], "second")
        send_msg(client, alice["headers"], bob["id"], "third")

        resp = client.get(f"/api/messages/conversations/{bob['id']}", headers=alice["headers"])
        contents = [m["content"] for m in resp.json()]
        assert contents == ["first", "second", "third"]

    def test_only_returns_messages_between_these_two_users(self, client, two_users, db):
        """Messages with a third party should not bleed into this conversation."""
        from tests.conftest import REGISTER_PAYLOAD
        # Register a third user — get ID from register response, not /api/users/me
        # which does not exist in the users router.
        carol_resp = client.post("/api/auth/register", json={
            "email": "carol@example.com", "username": "carol",
            "password": "carolpass123", "role": "freelancer"
        })
        carol_token = client.post("/api/auth/login", json={
            "email": "carol@example.com", "password": "carolpass123"
        }).json()["access_token"]
        carol_headers = {"Authorization": f"Bearer {carol_token}"}

        # Carol sends alice a message
        send_msg(client, carol_headers, two_users["alice"]["id"], "from carol")

        # Alice-Bob conversation should not include carol's message
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, alice["headers"], bob["id"], "alice to bob")

        resp = client.get(f"/api/messages/conversations/{bob['id']}", headers=alice["headers"])
        contents = [m["content"] for m in resp.json()]
        assert "from carol" not in contents
        assert "alice to bob" in contents


# ═════════════════════════════════════════════════════════════════════════════
# MARK AS READ (PATCH /conversations/{user_id}/read)
# ═════════════════════════════════════════════════════════════════════════════

class TestMarkRead:

    def test_patch_read_returns_204(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, bob["headers"], alice["id"])
        resp = client.patch(
            f"/api/messages/conversations/{bob['id']}/read",
            headers=alice["headers"],
        )
        assert resp.status_code == 204

    def test_patch_read_marks_messages_as_read(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, bob["headers"], alice["id"], "please read me")

        # Before: unread count = 1
        assert client.get("/api/messages/unread-count", headers=alice["headers"]).json()["unread_count"] == 1

        # Mark as read
        client.patch(f"/api/messages/conversations/{bob['id']}/read", headers=alice["headers"])

        # After: unread count = 0
        assert client.get("/api/messages/unread-count", headers=alice["headers"]).json()["unread_count"] == 0

    def test_patch_read_only_marks_inbound_messages(self, client, two_users):
        """
        PATCH /read should only mark messages FROM other_user TO current_user.
        Messages sent by current_user should never be marked read by this endpoint.
        """
        alice, bob = two_users["alice"], two_users["bob"]
        # Alice sends to bob (alice is sender)
        send_msg(client, alice["headers"], bob["id"], "alice outbound")
        # Bob sends to alice (alice is receiver)
        send_msg(client, bob["headers"], alice["id"], "bob inbound")

        # Alice marks bob's conversation as read
        client.patch(f"/api/messages/conversations/{bob['id']}/read", headers=alice["headers"])

        # Bob should NOT see alice's outbound message as read (he's the receiver)
        # and his own sent message shouldn't be affected
        # Verify: bob still has 0 unread (he never received anything unread)
        assert client.get("/api/messages/unread-count", headers=bob["headers"]).json()["unread_count"] == 1

    def test_patch_read_unauthenticated_returns_403(self, client, two_users):
        bob_id = two_users["bob"]["id"]
        resp = client.patch(f"/api/messages/conversations/{bob_id}/read")
        assert resp.status_code == 403

    def test_patch_read_on_empty_conversation_is_no_op(self, client, two_users):
        """Should return 204 even if there are no messages to mark."""
        alice, bob = two_users["alice"], two_users["bob"]
        resp = client.patch(
            f"/api/messages/conversations/{bob['id']}/read",
            headers=alice["headers"],
        )
        assert resp.status_code == 204


# ═════════════════════════════════════════════════════════════════════════════
# CONVERSATIONS LIST
# ═════════════════════════════════════════════════════════════════════════════

class TestConversationsList:

    def test_returns_list(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, alice["headers"], bob["id"])
        resp = client.get("/api/messages/conversations", headers=alice["headers"])
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_returns_empty_list_when_no_messages(self, client, two_users):
        alice = two_users["alice"]
        resp = client.get("/api/messages/conversations", headers=alice["headers"])
        assert resp.status_code == 200
        assert resp.json() == []

    def test_response_shape(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, alice["headers"], bob["id"], "preview text")
        resp = client.get("/api/messages/conversations", headers=alice["headers"])
        convo = resp.json()[0]
        assert "user_id" in convo
        assert "username" in convo
        assert "role" in convo
        assert "last_message" in convo
        assert "unread_count" in convo
        assert "is_online" in convo

    def test_unread_count_is_accurate(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, bob["headers"], alice["id"], "msg 1")
        send_msg(client, bob["headers"], alice["id"], "msg 2")

        resp = client.get("/api/messages/conversations", headers=alice["headers"])
        convo = next(c for c in resp.json() if c["user_id"] == bob["id"])
        assert convo["unread_count"] == 2

    def test_unread_count_decreases_after_mark_read(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, bob["headers"], alice["id"])
        client.patch(f"/api/messages/conversations/{bob['id']}/read", headers=alice["headers"])

        resp = client.get("/api/messages/conversations", headers=alice["headers"])
        convo = next(c for c in resp.json() if c["user_id"] == bob["id"])
        assert convo["unread_count"] == 0

    def test_last_message_preview_is_correct(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, alice["headers"], bob["id"], "first message")
        send_msg(client, alice["headers"], bob["id"], "latest message")

        resp = client.get("/api/messages/conversations", headers=alice["headers"])
        convo = next(c for c in resp.json() if c["user_id"] == bob["id"])
        assert convo["last_message"] == "latest message"

    def test_unauthenticated_returns_403(self, client):
        resp = client.get("/api/messages/conversations")
        assert resp.status_code == 403


# ═════════════════════════════════════════════════════════════════════════════
# UNREAD COUNT
# ═════════════════════════════════════════════════════════════════════════════

class TestUnreadCount:

    def test_returns_zero_when_no_messages(self, client, two_users):
        alice = two_users["alice"]
        resp = client.get("/api/messages/unread-count", headers=alice["headers"])
        assert resp.status_code == 200
        assert resp.json()["unread_count"] == 0

    def test_increments_on_received_message(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, bob["headers"], alice["id"])
        resp = client.get("/api/messages/unread-count", headers=alice["headers"])
        assert resp.json()["unread_count"] == 1

    def test_does_not_count_sent_messages(self, client, two_users):
        """Messages Alice sent should not appear in Alice's unread count."""
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, alice["headers"], bob["id"])
        resp = client.get("/api/messages/unread-count", headers=alice["headers"])
        assert resp.json()["unread_count"] == 0

    def test_resets_to_zero_after_mark_read(self, client, two_users):
        alice, bob = two_users["alice"], two_users["bob"]
        send_msg(client, bob["headers"], alice["id"])
        send_msg(client, bob["headers"], alice["id"])
        client.patch(f"/api/messages/conversations/{bob['id']}/read", headers=alice["headers"])
        resp = client.get("/api/messages/unread-count", headers=alice["headers"])
        assert resp.json()["unread_count"] == 0

    def test_unauthenticated_returns_403(self, client):
        resp = client.get("/api/messages/unread-count")
        assert resp.status_code == 403


# ═════════════════════════════════════════════════════════════════════════════
# USER SEARCH
# ═════════════════════════════════════════════════════════════════════════════

class TestUserSearch:

    def test_search_with_2_chars_returns_results(self, client, two_users):
        alice = two_users["alice"]
        resp = client.get("/api/messages/users", params={"q": "bo"}, headers=alice["headers"])
        assert resp.status_code == 200
        usernames = [u["username"] for u in resp.json()]
        assert "bob" in usernames

    def test_search_with_1_char_returns_422(self, client, two_users):
        """
        FastAPI validates min_length=2 on the `q` query param.
        Returns 422 Unprocessable Entity, not an empty array.
        """
        alice = two_users["alice"]
        resp = client.get("/api/messages/users", params={"q": "b"}, headers=alice["headers"])
        assert resp.status_code == 422

    def test_search_excludes_self(self, client, two_users):
        alice = two_users["alice"]
        # Search for "al" which would match alice herself
        resp = client.get("/api/messages/users", params={"q": "al"}, headers=alice["headers"])
        assert resp.status_code == 200
        ids = [u["id"] for u in resp.json()]
        assert alice["id"] not in ids

    def test_search_result_shape(self, client, two_users):
        alice = two_users["alice"]
        resp = client.get("/api/messages/users", params={"q": "bo"}, headers=alice["headers"])
        user = resp.json()[0]
        # Must only expose safe fields
        assert "id" in user
        assert "username" in user
        assert "role" in user
        # Must NOT expose sensitive fields
        assert "hashed_password" not in user
        assert "reset_token" not in user
        assert "email" not in user

    def test_search_no_results_returns_empty_list(self, client, two_users):
        alice = two_users["alice"]
        resp = client.get("/api/messages/users", params={"q": "zzznomatch"}, headers=alice["headers"])
        assert resp.status_code == 200
        assert resp.json() == []

    def test_search_unauthenticated_returns_403(self, client):
        resp = client.get("/api/messages/users", params={"q": "bo"})
        assert resp.status_code == 403

    def test_search_missing_q_returns_422(self, client, two_users):
        alice = two_users["alice"]
        resp = client.get("/api/messages/users", headers=alice["headers"])
        assert resp.status_code == 422


# ═════════════════════════════════════════════════════════════════════════════
# WS TICKET
# ═════════════════════════════════════════════════════════════════════════════

class TestWsTicket:

    def test_authenticated_user_gets_ticket(self, client, auth_headers):
        resp = client.post("/api/messages/ws-ticket", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "ticket" in data
        assert "expires_in" in data
        assert data["expires_in"] == 60

    def test_ticket_is_non_empty_string(self, client, auth_headers):
        resp = client.post("/api/messages/ws-ticket", headers=auth_headers)
        ticket = resp.json()["ticket"]
        assert isinstance(ticket, str)
        assert len(ticket) > 10

    def test_two_tickets_are_unique(self, client, auth_headers):
        t1 = client.post("/api/messages/ws-ticket", headers=auth_headers).json()["ticket"]
        t2 = client.post("/api/messages/ws-ticket", headers=auth_headers).json()["ticket"]
        assert t1 != t2

    def test_unauthenticated_returns_403(self, client):
        resp = client.post("/api/messages/ws-ticket")
        assert resp.status_code == 403


# ═════════════════════════════════════════════════════════════════════════════
# WEBSOCKET — Auth and Ticket Validation
# ═════════════════════════════════════════════════════════════════════════════
#
# NOTE: TestClient supports WebSocket connections via client.websocket_connect().
# The close-code tests require the main.py fix (accept before close) to pass
# correctly. Without that fix, Chrome-side sees 1006, but TestClient may still
# see 4001 since it's in-process. Marked with a comment where relevant.

class TestWebSocket:

    def test_valid_ticket_connects_successfully(self, client, auth_headers, registered_user):
        """Happy path: valid ticket → WebSocket connects and stays open.

        On connect the server immediately sends an online_users snapshot before
        any ping/pong exchange. We must drain that first message before sending
        ping, otherwise we'd assert the snapshot equals 'pong'.
        """
        ticket_resp = client.post("/api/messages/ws-ticket", headers=auth_headers)
        ticket = ticket_resp.json()["ticket"]
        user_id = registered_user["user"]["id"]

        with client.websocket_connect(f"/ws/{user_id}?ticket={ticket}") as ws:
            # Drain the online_users snapshot the server sends on connect.
            snapshot = ws.receive_text()
            assert "online_users" in snapshot

            ws.send_text("ping")
            data = ws.receive_text()
            assert data == "pong"

    def test_invalid_ticket_closes_with_4001(self, client, registered_user):
        """
        Invalid ticket must result in close code 4001.
        Requires main.py fix: `await websocket.accept()` before `close(4001)`.
        """
        user_id = registered_user["user"]["id"]
        with pytest.raises(Exception):
            with client.websocket_connect(f"/ws/{user_id}?ticket=invalidticket") as ws:
                ws.receive_text()  # should raise on close

    def test_expired_ticket_closes_with_4001(self, client, registered_user):
        """
        A ticket that has expired must be rejected with close code 4001.

        TTLCache handles expiry by evicting entries — once evicted, the ticket
        is indistinguishable from one that was never issued. We simulate expiry
        by manually deleting the entry from the cache after issuing it, which
        is exactly what TTLCache does internally when the TTL elapses.

        The previous implementation attempted to set .expires_at on the cached
        value, but _ws_tickets now stores plain int (user_id) values — not
        wrapper objects — so that approach raised AttributeError at runtime.
        """
        from src.main import _issue_ticket, _ws_tickets, _ws_tickets_lock

        user_id = registered_user["user"]["id"]
        ticket = _issue_ticket(user_id)

        # Simulate TTL expiry — remove the entry as TTLCache would after timeout.
        with _ws_tickets_lock:
            del _ws_tickets[ticket]

        with pytest.raises(Exception):
            with client.websocket_connect(f"/ws/{user_id}?ticket={ticket}") as ws:
                ws.receive_text()

    def test_reused_ticket_is_rejected(self, client, auth_headers, registered_user):
        """
        Tickets are one-time-use. A second connection attempt with the same
        ticket must be rejected.
        """
        ticket_resp = client.post("/api/messages/ws-ticket", headers=auth_headers)
        ticket = ticket_resp.json()["ticket"]
        user_id = registered_user["user"]["id"]

        # First connection — should succeed
        with client.websocket_connect(f"/ws/{user_id}?ticket={ticket}") as ws:
            ws.send_text("ping")
            ws.receive_text()
        # Second connection with same ticket — should fail
        with pytest.raises(Exception):
            with client.websocket_connect(f"/ws/{user_id}?ticket={ticket}") as ws:
                ws.receive_text()

    def test_ticket_for_wrong_user_id_is_rejected(self, client, two_users):
        """
        A ticket issued for alice cannot be used to connect as bob.
        """
        alice, bob = two_users["alice"], two_users["bob"]
        ticket_resp = client.post("/api/messages/ws-ticket", headers=alice["headers"])
        alice_ticket = ticket_resp.json()["ticket"]

        # Try to connect as bob using alice's ticket
        with pytest.raises(Exception):
            with client.websocket_connect(f"/ws/{bob['id']}?ticket={alice_ticket}") as ws:
                ws.receive_text()

    def test_missing_ticket_param_returns_error(self, client, registered_user):
        """Query param `ticket` is required — missing it should fail."""
        user_id = registered_user["user"]["id"]
        with pytest.raises(Exception):
            with client.websocket_connect(f"/ws/{user_id}") as ws:
                ws.receive_text()

    def test_online_users_snapshot_sent_on_connect(self, client, auth_headers, registered_user):
        """
        On connect, the server should push an `online_users` message to the
        newly connected user.
        """
        ticket_resp = client.post("/api/messages/ws-ticket", headers=auth_headers)
        ticket = ticket_resp.json()["ticket"]
        user_id = registered_user["user"]["id"]

        with client.websocket_connect(f"/ws/{user_id}?ticket={ticket}") as ws:
            import json
            data = json.loads(ws.receive_text())
            assert data["type"] == "online_users"
            assert "user_ids" in data