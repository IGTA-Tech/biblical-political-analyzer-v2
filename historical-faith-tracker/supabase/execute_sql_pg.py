#!/usr/bin/env python3
"""
Historical Faith Tracker - Execute SQL via PostgreSQL Connection

This script connects directly to Supabase PostgreSQL and executes the schema.
"""

import os
import sys

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
    print("[ERROR] pg8000 is not installed. Install with: pip3 install --user --break-system-packages pg8000")
    sys.exit(1)

# Supabase connection details
PROJECT_REF = 'dmuhzumkxnastwdghdfg'
DB_HOST = f'db.{PROJECT_REF}.supabase.co'
DB_PORT = 5432
DB_NAME = 'postgres'
DB_USER = 'postgres'

# Try to get password from environment or prompt
DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD', '')


def get_sql_statements():
    """Read and split SQL statements from the generated schema file."""
    sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')
    with open(sql_file, 'r') as f:
        return f.read()


def execute_sql_with_password(password: str):
    """Execute SQL using the provided password."""
    try:
        print(f"[INFO] Connecting to {DB_HOST}...")

        conn = pg8000.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=password,
            ssl_context=True
        )
        cursor = conn.cursor()

        print("[OK] Connected to PostgreSQL")

        # Read SQL
        sql_content = get_sql_statements()
        print(f"[INFO] SQL content loaded ({len(sql_content)} characters)")

        # Execute the entire SQL script
        print("[INFO] Executing SQL schema...")

        # Split by statement and execute
        # For DDL, we need to execute statements one by one
        statements = []
        current = []
        in_function = False

        for line in sql_content.split('\n'):
            # Skip comments
            if line.strip().startswith('--') and not current:
                continue

            current.append(line)

            # Track function bodies (dollar-quoted)
            if '$$' in line:
                in_function = not in_function

            # End of statement
            if line.rstrip().endswith(';') and not in_function:
                stmt = '\n'.join(current).strip()
                if stmt and not stmt.startswith('--'):
                    statements.append(stmt)
                current = []

        print(f"[INFO] Found {len(statements)} SQL statements to execute")

        success_count = 0
        error_count = 0

        for i, stmt in enumerate(statements, 1):
            # Get a description from the statement
            first_line = stmt.split('\n')[0][:60]
            try:
                cursor.execute(stmt)
                conn.commit()
                print(f"  [{i}/{len(statements)}] OK: {first_line}...")
                success_count += 1
            except Exception as e:
                error_msg = str(e)[:100]
                print(f"  [{i}/{len(statements)}] FAILED: {first_line}... - {error_msg}")
                error_count += 1
                # Continue with next statement
                conn.rollback()

        print()
        print(f"[SUMMARY] Success: {success_count}, Errors: {error_count}")

        cursor.close()
        conn.close()

        return error_count == 0

    except pg8000.exceptions.InterfaceError as e:
        print(f"[ERROR] Connection failed: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False


def main():
    print("=" * 70)
    print("HISTORICAL FAITH TRACKER - EXECUTE SQL SCHEMA")
    print("=" * 70)
    print()

    if not DB_PASSWORD:
        print("[INFO] Database password not found in environment.")
        print()
        print("To get your database password:")
        print(f"  1. Go to: https://supabase.com/dashboard/project/{PROJECT_REF}/settings/database")
        print("  2. Copy the database password")
        print()
        print("Then either:")
        print("  a. Add SUPABASE_DB_PASSWORD to your .env file")
        print("  b. Or run: SUPABASE_DB_PASSWORD='your_password' python3 execute_sql_pg.py")
        print()

        # Try to read password from stdin
        try:
            print("Enter your database password (will be hidden):")
            import getpass
            password = getpass.getpass("Password: ")
            if password:
                execute_sql_with_password(password)
        except EOFError:
            print("[INFO] No password provided. Exiting.")
            return False
    else:
        return execute_sql_with_password(DB_PASSWORD)


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
