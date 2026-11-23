"""
Sentiment Scope – Standalone Demo Accounts Seeding Script
Ensures the three required accounts exist with exact roles and secure hashes:
  1. Shreya: admin@sentimentscope.com -> SUPER_ADMIN
  2. Alex Vance: alex@sentimentscope.com -> ADMIN
  3. Demo User: demo@sentimentscope.com -> USER
Plus aliases:
  - shreya@sentimentscope.com -> SUPER_ADMIN
  - user@sentimentscope.com -> USER
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import get_db_session, init_db_engine, seed_roles_and_default_users
from models import User, Role, UserRole

def main():
    print("Initializing database engine and running migrations...")
    init_db_engine()
    print("Seeding roles and demo users...")
    seed_roles_and_default_users()

    session = get_db_session()
    try:
        users = session.query(User).all()
        print("\nCurrent Users in Database:")
        print("--------------------------------------------------------------------------------")
        for u in users:
            role_names = [ur.role.name for ur in u.user_roles] if u.user_roles else ["No Role"]
            print(f"ID: {u.id:<20} | Name: {u.name:<16} | Email: {u.email:<28} | Role: {', '.join(role_names):<14} | Status: {u.status}")
        print("--------------------------------------------------------------------------------")
        print("Seed operation completed successfully.")
    finally:
        session.close()

if __name__ == "__main__":
    main()
