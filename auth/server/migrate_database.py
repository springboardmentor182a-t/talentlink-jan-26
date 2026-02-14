"""
Database Migration Script - Add Password Reset Fields
Run this ONCE to add reset_token fields to existing database
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./talentlink.db")

def migrate_database():
    """Add reset_token and reset_token_expires columns to users table"""
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
    
    try:
        with engine.connect() as connection:
            # Check if columns already exist
            result = connection.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if 'reset_token' not in columns:
                print("Adding reset_token column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
                connection.commit()
                print("✓ reset_token column added")
            else:
                print("✓ reset_token column already exists")
            
            if 'reset_token_expires' not in columns:
                print("Adding reset_token_expires column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME"))
                connection.commit()
                print("✓ reset_token_expires column added")
            else:
                print("✓ reset_token_expires column already exists")
        
        print("\n✅ Database migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration - Add Password Reset Fields")
    print("=" * 60)
    print()
    
    response = input("This will modify your database. Continue? (yes/no): ").strip().lower()
    
    if response == 'yes':
        migrate_database()
    else:
        print("Migration cancelled.")
