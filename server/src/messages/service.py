from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from fastapi import HTTPException, status

from src.entities.message import Message
from src.entities.user import User
from src.messages.models import MessageSend


class MessageService:

    @staticmethod
    def send_message(db: Session, sender_id: int, data: MessageSend) -> Message:
        # Prevent messaging yourself
        if sender_id == data.receiver_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot send a message to yourself"
            )

        # Check receiver exists
        receiver = db.query(User).filter(User.id == data.receiver_id).first()
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient not found"
            )

        message = Message(
            sender_id=sender_id,
            receiver_id=data.receiver_id,
            content=data.content,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_conversation(
        db: Session,
        current_user_id: int,
        other_user_id: int,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Message]:
        """Get all messages between two users, oldest first."""
        messages = (
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

        # Mark incoming messages as read
        db.query(Message).filter(
            Message.sender_id == other_user_id,
            Message.receiver_id == current_user_id,
            Message.is_read == False,  # noqa: E712
        ).update({"is_read": True})
        db.commit()

        return messages

    @staticmethod
    def get_conversations_list(db: Session, current_user_id: int) -> list[dict]:
        """
        Get list of all unique conversation partners for the current user,
        with last message preview and unread count.
        """
        # Find all users this person has exchanged messages with
        sent_to = (
            db.query(Message.receiver_id)
            .filter(Message.sender_id == current_user_id)
            .distinct()
            .subquery()
        )
        received_from = (
            db.query(Message.sender_id)
            .filter(Message.receiver_id == current_user_id)
            .distinct()
            .subquery()
        )

        # Get unique partner IDs
        partner_ids_sent     = {row[0] for row in db.query(sent_to).all()}
        partner_ids_received = {row[0] for row in db.query(received_from).all()}
        partner_ids          = partner_ids_sent | partner_ids_received

        conversations = []
        for partner_id in partner_ids:
            partner = db.query(User).filter(User.id == partner_id).first()
            if not partner:
                continue

            # Last message in this thread
            last_msg = (
                db.query(Message)
                .filter(
                    or_(
                        and_(
                            Message.sender_id == current_user_id,
                            Message.receiver_id == partner_id,
                        ),
                        and_(
                            Message.sender_id == partner_id,
                            Message.receiver_id == current_user_id,
                        ),
                    )
                )
                .order_by(Message.timestamp.desc())
                .first()
            )

            # Unread count
            unread = (
                db.query(func.count(Message.id))
                .filter(
                    Message.sender_id == partner_id,
                    Message.receiver_id == current_user_id,
                    Message.is_read == False,  # noqa: E712
                )
                .scalar()
            )

            conversations.append({
                "user_id":           partner.id,
                "username":          partner.username,
                "role":              partner.role,
                "last_message":      last_msg.content if last_msg else None,
                "last_message_time": last_msg.timestamp if last_msg else None,
                "unread_count":      unread or 0,
            })

        # Sort by last message time descending
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
    def get_messageable_users(db: Session, current_user_id: int) -> list[User]:
        """Return all users except the current user (simplified for MVP)."""
        return (
            db.query(User)
            .filter(User.id != current_user_id)
            .all()
        )
