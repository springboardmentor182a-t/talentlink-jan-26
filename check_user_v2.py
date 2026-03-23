import sqlite3
import os

db_path = os.path.join('server', 'talentlink.db')
if not os.path.exists(db_path):
    db_path = 'talentlink.db'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT email, role FROM users WHERE email = 'john12@example.com'")
result = cursor.fetchone()
if result:
    print(f"Email: '{result[0]}'")
    print(f"Role: '{result[1]}'")
else:
    print("User not found.")
conn.close()
