import sqlite3
import os

db_path = os.path.join('server', 'talentlink.db')
if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE jobs ADD COLUMN skills TEXT;")
    print("Added 'skills' column to jobs table.")
except sqlite3.OperationalError as e:
    print(f"Error adding 'skills' (might already exist): {e}")

try:
    cursor.execute("ALTER TABLE jobs ADD COLUMN duration TEXT;")
    print("Added 'duration' column to jobs table.")
except sqlite3.OperationalError as e:
    print(f"Error adding 'duration' (might already exist): {e}")

conn.commit()
conn.close()
