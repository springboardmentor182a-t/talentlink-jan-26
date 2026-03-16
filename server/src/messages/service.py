import re

from fastapi import HTTPException, status
from sqlalchemy import or_, and_, func, case
from sqlalchemy.orm import Session

from src.entities.message import Message
from src.entities.user import User
from src.messages.models import MessageSend


def _sanitize(text: str) -> str:
    """Strip HTML tags from message content before persisting.

    React escapes output by default, but sanitizing at ingress means the
    database never holds raw HTML regardless of which client sends the message.
    This blocks stored-XSS if any future code path ever renders content as
    innerHTML, markdown, or passes it to a non-React renderer.

    NOTE (known limitation): this regex handles well-formed tags only.
    It does NOT catch malformed nesting like <scr<script>ipt>alert(1)</script>
    or HTML entities like &lt;script&gt;. For the current threat model
    (React renderer + server-side strip as defense-in-depth) this is acceptable.
    TODO (pre-staging if rich-text editor is added): replace with `nh3` or
    `bleach` for a proper allowlist-based sanitizer.
    """
    clean = re.sub(r"<[^>]+>", "", text)
    return clean.strip()


class MessageService:

    @staticmethod
    async def send_message(db: Session, sender_id: int, data: MessageSend, sender: User) -> Message:
        """Send a message from sender to receiver.

        sender is passed in from the controller (already resolved by
        get_current_user) — no second DB fetch needed.
        """
        if sender_id == data.receiver_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot send a message to yourself",
            )

        receiver = db.query(User).filter(User.id == data.receiver_id).first()
        if not receiver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

        message = Message(
            sender_id=sender_id,
            receiver_id=data.receiver_id,
            content=_sanitize(data.content),
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        # TODO (tech debt): circular import workaround.
        # Move ConnectionManager to src/ws/manager.py to allow a top-level import.
        from src.main import manager  # noqa: PLC0415

        ws_payload = {
            "type": "new_message",
            "message": {
                "id":          message.id,
                "sender_id":   message.sender_id,
                "receiver_id": message.receiver_id,
                "content":     message.content,
                "is_read":     message.is_read,
                "timestamp":   message.timestamp.isoformat(),
            },
            "sender": {
                "id":       sender.id,
                "username": sender.username,
                "role":     sender.role,
            },
        }

        await manager.send_to_user(data.receiver_id, ws_payload)
        await manager.send_to_user(sender_id, ws_payload)

        return message

    @staticmethod
    def get_conversation(
        db: Session,
        current_user_id: int,
        other_user_id: int,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Message]:
        """Return paginated messages between two users, oldest-first.

        Read receipts are NOT updated here — belongs to the explicit
        PATCH /messages/conversations/{user_id}/read endpoint.
        """
        return (
            db.query(Message)
            .filter(
                or_(
                    and_(
                        Message.sender_id == current_user_id,
                        Message.receiver_id == other_user_id,
                    ),
                    and_(
                        Message.sender_id == other_user_id,
                        Message.receiver_id == current_user_id,
                    ),
                )
            )
            .order_by(Message.timestamp.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def mark_conversation_read(db: Session, current_user_id: int, other_user_id: int) -> None:
        """Explicitly mark all messages from other_user as read."""
        db.query(Message).filter(
            Message.sender_id == other_user_id,
            Message.receiver_id == current_user_id,
            Message.is_read == False,  # noqa: E712
        ).update({"is_read": True})
        db.commit()

    @staticmethod
    def get_conversations_list(db: Session, current_user_id: int) -> list[dict]:
        """Return all conversation partners with last-message preview and unread count."""
        # TODO (tech debt): circular import workaround.
        # Move ConnectionManager to src/ws/manager.py to allow a top-level import.
        from src.main import manager  # noqa: PLC0415

        partner_ids_subq = (
            db.query(
                case(
                    (Message.sender_id == current_user_id, Message.receiver_id),
                    else_=Message.sender_id,
                ).label("partner_id")
            )
            .filter(
                or_(
                    Message.sender_id == current_user_id,
                    Message.receiver_id == current_user_id,
                )
            )
            .distinct()
            .subquery()
        )

        partners = db.query(User).join(
            partner_ids_subq, User.id == partner_ids_subq.c.partner_id
        ).all()

        if not partners:
            return []

        partner_id_list: list[int] = [p.id for p in partners]  # type: ignore[list-item]

        # group_by fix (applied): was group_by("partner_id") — string label is
        # fragile on some PostgreSQL versions where the ORM may not preserve the
        # alias, silently producing wrong results. Now uses the column expression
        # directly, unambiguous across all PostgreSQL versions.
        partner_id_expr = case(
            (Message.sender_id == current_user_id, Message.receiver_id),
            else_=Message.sender_id,
        ).label("partner_id")

        last_msg_subq = (
            db.query(
                partner_id_expr,
                func.max(Message.timestamp).label("last_ts"),
            )
            .filter(
                or_(
                    Message.sender_id == current_user_id,
                    Message.receiver_id == current_user_id,
                )
            )
            .group_by(partner_id_expr)
            .subquery()
        )

        # Timestamp collision fix: two messages in the same conversation can
        # share an identical timestamp (test fixtures, bulk imports, or two
        # near-simultaneous sends that land in the same DB second).
        # The previous join on timestamp == last_ts matched both rows and the
        # dict comprehension picked one non-deterministically.
        #
        # Fix: add a second subquery that picks the MAX(id) among all rows that
        # share the winning timestamp for each partner. Message IDs are strictly
        # ascending (serial PK), so max(id) is always the latest-inserted row.
        # This is a portable fix — works on SQLite (tests) and PostgreSQL (prod)
        # without requiring DISTINCT ON (Postgres-only) or window functions.
        last_msg_id_subq = (
            db.query(
                func.max(Message.id).label("last_id"),
            )
            .join(
                last_msg_subq,
                and_(
                    Message.timestamp == last_msg_subq.c.last_ts,
                    or_(
                        and_(
                            Message.sender_id == current_user_id,
                            Message.receiver_id == last_msg_subq.c.partner_id,
                        ),
                        and_(
                            Message.sender_id == last_msg_subq.c.partner_id,
                            Message.receiver_id == current_user_id,
                        ),
                    ),
                ),
            )
            .group_by(last_msg_subq.c.partner_id)
            .subquery()
        )

        last_msgs = {
            row.partner_id: row  # type: ignore[index]
            for row in db.query(
                last_msg_subq.c.partner_id,
                last_msg_subq.c.last_ts,
                Message.content,
            )
            .join(
                last_msg_id_subq,
                Message.id == last_msg_id_subq.c.last_id,
            )
            .all()
        }

        unread_rows = (
            db.query(
                Message.sender_id.label("partner_id"),
                func.count(Message.id).label("cnt"),
            )
            .filter(
                Message.receiver_id == current_user_id,
                Message.sender_id.in_(partner_id_list),
                Message.is_read == False,  # noqa: E712
            )
            .group_by(Message.sender_id)
            .all()
        )
        unread_map = {row.partner_id: row.cnt for row in unread_rows}  # type: ignore[index]

        partner_map = {p.id: p for p in partners}  # type: ignore[index]

        conversations = []
        for partner_id in partner_id_list:
            partner  = partner_map[partner_id]
            last_row = last_msgs.get(partner_id)

            conversations.append({
                "user_id":           partner.id,
                "username":          partner.username,
                "role":              partner.role,
                "last_message":      last_row.content if last_row else None,
                "last_message_time": last_row.last_ts if last_row else None,
                "unread_count":      unread_map.get(partner_id, 0),
                "is_online":         manager.is_online(partner_id),
            })

        conversations.sort(
            key=lambda x: x["last_message_time"] or 0,
            reverse=True,
        )
        return conversations

    @staticmethod
    def get_unread_count(db: Session, current_user_id: int) -> int:
        return (
            db.query(func.count(Message.id))
            .filter(
                Message.receiver_id == current_user_id,
                Message.is_read == False,  # noqa: E712
            )
            .scalar()
            or 0
        )

    @staticmethod
    def get_messageable_users(
        db: Session,
        current_user_id: int,
        search: str = "",
        limit: int = 20,
        offset: int = 0,
    ) -> list[User]:
        """Return users available to message, requiring at least 2 search chars."""
        if len(search.strip()) < 2:
            return []

        return (
            db.query(User)
            .filter(
                User.id != current_user_id,
                User.username.ilike(f"%{search.strip()}%"),
            )
            .order_by(User.username)
            .limit(limit)
            .offset(offset)
            .all()
        )
