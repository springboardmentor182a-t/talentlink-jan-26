import sqlite3
import os

db_path = os.path.join('server', 'talentlink.db')
if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(proposals);")
columns = cursor.fetchall()
for col in columns:
    print(col)

conn.close()
