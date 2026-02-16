import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB_URL from env but strip the database name to connect to default 'postgres'
# Assuming format postgresql://user:pass@host:port/dbname
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found in .env")
    exit(1)

# Parse URL to get base connection info (very basic parsing)
# We want to connect to 'postgres' db to create the new db
base_url = db_url.rsplit('/', 1)[0] + '/postgres'

print(f"Connecting to {base_url} to create database...")

try:
    conn = psycopg2.connect(base_url)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Check if exists
    cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'talentlink'")
    exists = cur.fetchone()
    
    if not exists:
        print("Creating database 'talentlink'...")
        cur.execute("CREATE DATABASE talentlink")
        print("Database created successfully!")
    else:
        print("Database 'talentlink' already exists.")
        
    cur.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
    print("\nTip: Check if your .env credentials are correct for the local Postgres server.")
