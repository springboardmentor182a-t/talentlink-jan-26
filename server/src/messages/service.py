from sqlalchemy.orm import Session
from sqlalchemy import or_
from src.entities.message import Message
from src.entities.user import User
from src.messages.models import MessageCreate

def get_messages_between_users(db: Session, user1_id: int, user2_id: int):
    return db.query(Message).filter(
        or_(
            (Message.sender_id == user1_id) & (Message.receiver_id == user2_id),
            (Message.sender_id == user2_id) & (Message.receiver_id == user1_id)
        )
    ).order_by(Message.timestamp.asc()).all()

def create_message(db: Session, message: MessageCreate, sender_id: int):
    db_message = Message(
        sender_id=sender_id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_conversations(db: Session, user_id: int):
    # This is a simplified version to get unique users the person has chatted with
    sent_to = db.query(Message.receiver_id).filter(Message.sender_id == user_id).distinct().all()
    received_from = db.query(Message.sender_id).filter(Message.receiver_id == user_id).distinct().all()
    
    other_user_ids = set([u[0] for u in sent_to] + [u[0] for u in received_from])
    
    conversations = []
    for other_id in other_user_ids:
        other_user = db.query(User).filter(User.id == other_id).first()
        last_msg = db.query(Message).filter(
            or_(
                (Message.sender_id == user_id) & (Message.receiver_id == other_id),
                (Message.sender_id == other_id) & (Message.receiver_id == user_id)
            )
        ).order_by(Message.timestamp.desc()).first()
        
        if other_user and last_msg:
            conversations.append({
                "other_user_id": other_id,
                "other_user_name": other_user.name,
                "last_message": last_msg.content,
                "timestamp": last_msg.timestamp
            })
            
    return sorted(conversations, key=lambda x: x["timestamp"], reverse=True)
