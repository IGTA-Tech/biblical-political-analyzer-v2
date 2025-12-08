#!/usr/bin/env python3
"""
Historical Faith Tracker - Execute SQL via Supabase Pooler with JWT

This script attempts to connect to Supabase PostgreSQL using the service role JWT.
Supabase pooler supports JWT authentication.
"""

import os
import sys
import base64
import json

# Load environment variables
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print(f"[INFO] Loaded environment from {env_path}")
        return True
    return False

load_env()

# Try to import pg8000
try:
    import pg8000
    print("[OK] pg8000 is available")
except ImportError:
    print("[ERROR] pg8000 is not installed")
    sys.exit(1)

# Supabase connection details
PROJECT_REF = 'dmuhzumkxnastwdghdfg'
SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

# Pooler connection (supports JWT auth)
POOLER_HOST = f'aws-0-us-east-1.pooler.supabase.com'  # Adjust region as needed
DB_PORT = 6543  # Transaction mode pooler
DB_NAME = 'postgres'

# Decode JWT to get the role
def decode_jwt(token):
    """Decode JWT to inspect payload."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        # Add padding if needed
        payload = parts[1]
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except:
        return None


def get_sql_statements():
    """Read SQL from the generated schema file."""
    sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')
    with open(sql_file, 'r') as f:
        return f.read()


def try_connect_with_jwt():
    """Try to connect using JWT authentication via pooler."""
    print("[INFO] Attempting JWT authentication via pooler...")

    # Decode JWT to get ref
    payload = decode_jwt(SERVICE_ROLE_KEY)
    if payload:
        print(f"[INFO] JWT ref: {payload.get('ref')}")
        print(f"[INFO] JWT role: {payload.get('role')}")

    # The pooler username format is: postgres.PROJECT_REF
    db_user = f'postgres.{PROJECT_REF}'

    # Try different pooler hosts
    pooler_hosts = [
        f'aws-0-us-east-1.pooler.supabase.com',
        f'aws-0-us-west-1.pooler.supabase.com',
        f'{PROJECT_REF}.pooler.supabase.com',
    ]

    for host in pooler_hosts:
        print(f"[INFO] Trying {host}...")
        try:
            conn = pg8000.connect(
                host=host,
                port=DB_PORT,
                database=DB_NAME,
                user=db_user,
                password=SERVICE_ROLE_KEY,
                ssl_context=True,
                timeout=10
            )
            print(f"[OK] Connected to {host}")
            return conn
        except Exception as e:
            print(f"[FAILED] {host}: {str(e)[:80]}")

    return None


def try_connect_direct():
    """Try direct connection (requires password)."""
    print("[INFO] Attempting direct connection...")

    db_host = f'db.{PROJECT_REF}.supabase.co'
    db_password = os.environ.get('SUPABASE_DB_PASSWORD', '')

    if not db_password:
        print("[SKIP] No SUPABASE_DB_PASSWORD in environment")
        return None

    try:
        conn = pg8000.connect(
            host=db_host,
            port=5432,
            database='postgres',
            user='postgres',
            password=db_password,
            ssl_context=True,
            timeout=10
        )
        print(f"[OK] Connected to {db_host}")
        return conn
    except Exception as e:
        print(f"[FAILED] {str(e)[:80]}")
        return None


def execute_schema(conn):
    """Execute the SQL schema."""
    cursor = conn.cursor()

    # Read SQL
    sql_content = get_sql_statements()
    print(f"[INFO] SQL content loaded ({len(sql_content)} characters)")

    # Split by statement
    statements = []
    current = []
    in_function = False

    for line in sql_content.split('\n'):
        if line.strip().startswith('--') and not current:
            continue
        current.append(line)
        if '$$' in line:
            in_function = not in_function
        if line.rstrip().endswith(';') and not in_function:
            stmt = '\n'.join(current).strip()
            if stmt and not stmt.startswith('--'):
                statements.append(stmt)
            current = []

    print(f"[INFO] Found {len(statements)} statements")

    success = 0
    failed = 0

    for i, stmt in enumerate(statements, 1):
        desc = stmt.split('\n')[0][:50]
        try:
            cursor.execute(stmt)
            conn.commit()
            print(f"  [{i}] OK: {desc}...")
            success += 1
        except Exception as e:
            print(f"  [{i}] FAILED: {desc}... - {str(e)[:60]}")
            failed += 1
            conn.rollback()

    print()
    print(f"[SUMMARY] Success: {success}, Failed: {failed}")

    cursor.close()
    conn.close()

    return failed == 0


def main():
    print("=" * 70)
    print("HISTORICAL FAITH TRACKER - SQL EXECUTION")
    print("=" * 70)
    print()

    # Try different connection methods
    conn = try_connect_with_jwt()

    if not conn:
        conn = try_connect_direct()

    if not conn:
        print()
        print("[ERROR] Could not establish connection")
        print()
        print("Please try one of these methods:")
        print()
        print("1. Add SUPABASE_DB_PASSWORD to .env and run again")
        print()
        print("2. Use the Supabase SQL Editor:")
        print(f"   https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new")
        print()
        print("3. Copy the SQL from generated_schema.sql")
        return False

    # Execute schema
    return execute_schema(conn)


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
