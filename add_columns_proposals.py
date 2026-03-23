import sqlite3
import os

db_path = os.path.join('server', 'talentlink.db')
if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE proposals ADD COLUMN created_at DATETIME;")
    print("Added 'created_at' column to proposals table.")
except sqlite3.OperationalError as e:
    print(f"Error adding 'created_at' (might already exist): {e}")

conn.commit()
conn.close()
