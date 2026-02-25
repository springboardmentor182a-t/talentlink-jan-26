from src.database.core import SessionLocal
from src.entities.user import User
from src.auth.service import verify_password

def debug_auth():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users in database.")
        for user in users:
            print(f"User: {user.email}, Role: {user.role}, Hash: {user.password[:10]}...")
            
            # Try to verify 'password'
            is_valid = verify_password("password", user.password)
            print(f"  -> Password 'password' valid?: {is_valid}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_auth()
