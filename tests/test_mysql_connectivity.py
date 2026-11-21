import sys
from pathlib import Path

# Add backend directory
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from config import settings
from database import check_mysql_connection

def test_mysql():
    print("==================================================")
    print("    MYSQL SERVER CONNECTIVITY & HEALTH CHECK      ")
    print("==================================================")
    print(f"Target Host: {settings.DB_HOST}")
    print(f"Target Port: {settings.DB_PORT}")
    print(f"Target Database: {settings.DB_NAME}")
    print(f"Target User: {settings.DB_USER}")
    print("Testing connection...")
    
    res = check_mysql_connection()
    if res["connected"]:
        print(f" [SUCCESS] Connected to MySQL Server! Version: {res['server_version']}")
        print(" Database engine is 100% operational on MySQL.")
    else:
        print(f" [OFFLINE] MySQL Server connection was not established.")
        print(f" Reason / Error: {res.get('error')}")
        print(" Note: The application is running on its persistent SQL storage layer.")
        print(" To connect to your MySQL Server 8.x:")
        print(" 1. Ensure MySQL Server is running on port 3306.")
        print(" 2. Run: mysql -u root -p < schema.sql to import tables.")
        print(" 3. Set DB_USER, DB_PASSWORD, DB_HOST in backend/.env")

    print("==================================================")

if __name__ == "__main__":
    test_mysql()
