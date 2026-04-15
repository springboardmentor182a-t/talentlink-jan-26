import sqlite3
import os

db_path = 'talentlink.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT email, role FROM users WHERE email = 'john12@example.com'")
    result = cursor.fetchone()
    if result:
        print(f"Email: '{result[0]}'")
        print(f"Role: '{result[1]}'")
    else:
        print("User not found in root DB.")
    conn.close()
else:
    print("Root DB not found.")
