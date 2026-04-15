import sqlite3
import os

db_path = os.path.join('server', 'talentlink.db')
if not os.path.exists(db_path):
    db_path = 'talentlink.db'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT id, name, email, role FROM users")
results = cursor.fetchall()
for r in results:
    print(r)
conn.close()
