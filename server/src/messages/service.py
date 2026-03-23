from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from src.entities.message import Message
from src.entities.user import User
from .models import MessageCreate

class MessageService:
    @staticmethod
    def get_conversations_for_user(db: Session, user_id: int):
        # Fetch all messages where the user is sender or receiver
        messages = db.query(Message).filter(
            or_(Message.sender_id == user_id, Message.receiver_id == user_id)
        ).order_by(Message.timestamp.asc()).all()

        conversations_dict = {}

        for msg in messages:
            # Determine the other user in the chat
            other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
            
            if other_user_id not in conversations_dict:
                other_user = db.query(User).filter(User.id == other_user_id).first()
                if not other_user:
                    continue
                
                conversations_dict[other_user_id] = {
                    "contact": other_user,
                    "messages": [],
                    "has_unread": False
                }
            
            # Format time
            msg_time = msg.timestamp.strftime("%H:%M")
            sender_str = "me" if msg.sender_id == user_id else "client"

            conversations_dict[other_user_id]["messages"].append({
                "id": msg.id,
                "sender": sender_str,
                "text": msg.content,
                "time": msg_time
            })

            if not msg.is_read and msg.receiver_id == user_id:
                conversations_dict[other_user_id]["has_unread"] = True
        
        result = []
        for contact_id, data in conversations_dict.items():
            contact = data["contact"]
            msgs = data["messages"]
            last_msg = msgs[-1]
            
            initial = contact.name[0].upper() if contact.name else "?"
            
            result.append({
                "id": contact.id,
                "name": contact.name,
                "project": "Direct Message", # Placeholder
                "lastMessage": last_msg["text"],
                "initial": initial,
                "timestamp": last_msg["time"], # Could be formatted better, but time is fine
                "unread": data["has_unread"],
                "messages": msgs
            })
            
        return result

    @staticmethod
    def send_message(db: Session, sender_id: int, message_data: MessageCreate):
        new_msg = Message(
            sender_id=sender_id,
            receiver_id=message_data.receiver_id,
            content=message_data.content
        )
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)
        return new_msg

    @staticmethod
    def mark_as_read(db: Session, user_id: int, other_user_id: int):
        db.query(Message).filter(
            and_(
                Message.receiver_id == user_id, 
                Message.sender_id == other_user_id, 
                Message.is_read == False
            )
        ).update({"is_read": True})
        db.commit()
        return {"status": "success"}

    @staticmethod
    def get_unread_count(db: Session, user_id: int):
        return db.query(Message).filter(
            and_(Message.receiver_id == user_id, Message.is_read == False)
        ).count()
