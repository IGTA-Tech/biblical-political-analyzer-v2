#!/usr/bin/env python3
"""
Historical Faith Tracker - Execute SQL Schema via Supabase

This script executes SQL directly using Supabase's PostgreSQL connection
through the Supabase API endpoint for database queries.
"""

import os
import sys
import json
import subprocess
import urllib.request
import urllib.error
import ssl
from typing import List, Tuple

# Load environment variables
def load_env():
    """Load environment variables from .env file."""
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print(f"[INFO] Loaded environment from {env_path}")
    else:
        print(f"[WARNING] .env file not found at {env_path}")

load_env()

# Supabase credentials
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', 'https://dmuhzumkxnastwdghdfg.supabase.co')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
PROJECT_REF = 'dmuhzumkxnastwdghdfg'

if not SUPABASE_SERVICE_ROLE_KEY:
    print("[ERROR] SUPABASE_SERVICE_ROLE_KEY not found in environment")
    sys.exit(1)


def execute_sql_curl(sql: str) -> Tuple[bool, str]:
    """
    Execute SQL using curl to the Supabase SQL endpoint.
    Uses the Supabase Management API for SQL execution.
    """
    # The Supabase Management API endpoint for SQL
    # This requires using the personal access token from dashboard
    # Or we can use the project's direct database connection

    # For service role access, we can try the pg endpoint
    url = f"{SUPABASE_URL}/pg/query"

    # Escape the SQL for JSON
    escaped_sql = sql.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

    curl_cmd = [
        'curl', '-s', '-X', 'POST',
        url,
        '-H', f'apikey: {SUPABASE_SERVICE_ROLE_KEY}',
        '-H', f'Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps({'query': sql})
    ]

    try:
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=60)
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        return False, str(e)


def execute_sql_via_edge_function(sql: str) -> Tuple[bool, str]:
    """
    Try to execute SQL via an Edge Function (if one exists).
    """
    # This would require setting up an edge function first
    pass


def split_sql_statements(sql_content: str) -> List[str]:
    """
    Split SQL content into individual statements.
    Handles multi-line statements and function definitions.
    """
    statements = []
    current_statement = []
    in_function = False
    dollar_quote = None

    for line in sql_content.split('\n'):
        # Skip empty lines and comments at the start of statements
        if not current_statement and (not line.strip() or line.strip().startswith('--')):
            continue

        current_statement.append(line)

        # Check for dollar-quoted function bodies
        if '$$' in line:
            if dollar_quote:
                dollar_quote = None
                in_function = False
            else:
                dollar_quote = '$$'
                in_function = True

        # If we're not in a function and line ends with semicolon
        if not in_function and line.rstrip().endswith(';'):
            statement = '\n'.join(current_statement).strip()
            if statement and not statement.startswith('--'):
                statements.append(statement)
            current_statement = []

    # Handle any remaining statement
    if current_statement:
        statement = '\n'.join(current_statement).strip()
        if statement and not statement.startswith('--'):
            statements.append(statement)

    return statements


def test_connection() -> bool:
    """Test the Supabase connection by querying an existing table."""
    url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}'
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status == 200
    except:
        return False


def check_table_exists(table_name: str) -> bool:
    """Check if a table exists using the REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?limit=0"
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}'
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status == 200
    except urllib.error.HTTPError as e:
        return False
    except:
        return False


def count_rows(table_name: str) -> int:
    """Count rows in a table."""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*"
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Prefer': 'count=exact'
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            content_range = response.headers.get('Content-Range', '')
            if '/' in content_range:
                return int(content_range.split('/')[-1])
    except:
        pass
    return 0


def check_function_exists(func_name: str) -> bool:
    """Check if a function exists by trying to call it via RPC."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/{func_name}"
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }

    data = json.dumps({}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return True
    except urllib.error.HTTPError as e:
        # 400 means function exists but wrong params
        # 404 means function doesn't exist
        return e.code != 404
    except:
        return False


def print_manual_instructions():
    """Print instructions for manual execution."""
    sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')

    print("""
==========================================================================
MANUAL SQL EXECUTION REQUIRED
==========================================================================

The Supabase REST API does not support executing raw DDL SQL directly.
Please execute the schema using one of these methods:

METHOD 1: Supabase Dashboard SQL Editor (Easiest)
--------------------------------------------------
1. Open: https://supabase.com/dashboard/project/{project}/sql/new
2. Copy the contents of: {sql_file}
3. Paste into the SQL editor
4. Click "Run" to execute

METHOD 2: Using psql (if you have access)
-----------------------------------------
1. Get your database password from:
   https://supabase.com/dashboard/project/{project}/settings/database
2. Run:
   psql "postgresql://postgres:YOUR_PASSWORD@db.{project}.supabase.co:5432/postgres" \\
        -f "{sql_file}"

METHOD 3: Using Supabase CLI
----------------------------
1. Install: npm install -g supabase
2. Link: supabase link --project-ref {project}
3. Push: supabase db push

The SQL file has been generated at:
{sql_file}

After executing the SQL, run this script again to verify the schema.
==========================================================================
""".format(
        project=PROJECT_REF,
        sql_file=sql_file
    ))


def main():
    """Main function."""
    print("=" * 70)
    print("HISTORICAL FAITH TRACKER - DATABASE SCHEMA SETUP")
    print("=" * 70)
    print()
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Project Ref: {PROJECT_REF}")
    print()

    # Test connection
    print("[STEP 1] Testing Supabase connection...")
    if test_connection():
        print("[OK] Connected to Supabase")
    else:
        print("[ERROR] Could not connect to Supabase")
        sys.exit(1)
    print()

    # Check current state
    print("[STEP 2] Checking current database state...")
    tables = ['eras', 'perspectives', 'events', 'event_interpretations',
              'figures', 'movements', 'scripture_usage', 'primary_sources']

    tables_exist = 0
    for table in tables:
        exists = check_table_exists(table)
        status = "EXISTS" if exists else "MISSING"
        print(f"  Table '{table}': {status}")
        if exists:
            tables_exist += 1

    print()
    print(f"  Tables found: {tables_exist}/{len(tables)}")
    print()

    # Check functions
    print("[STEP 3] Checking functions...")
    functions = ['search_events', 'search_figures', 'search_scripture_usage',
                 'get_event_perspectives', 'get_passage_history', 'get_timeline_events']

    functions_exist = 0
    for func in functions:
        exists = check_function_exists(func)
        status = "EXISTS" if exists else "MISSING"
        print(f"  Function '{func}': {status}")
        if exists:
            functions_exist += 1

    print()
    print(f"  Functions found: {functions_exist}/{len(functions)}")
    print()

    # Check seed data
    if tables_exist > 0:
        print("[STEP 4] Checking seed data...")
        eras_count = count_rows('eras')
        perspectives_count = count_rows('perspectives')
        print(f"  Eras: {eras_count} rows")
        print(f"  Perspectives: {perspectives_count} rows")
        print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print()

    if tables_exist == len(tables) and functions_exist == len(functions):
        print("[SUCCESS] Database schema is fully set up!")
        print()

        # Verify seed data
        if eras_count >= 10 and perspectives_count >= 5:
            print("[SUCCESS] Seed data is present!")
        else:
            print("[WARNING] Seed data may be incomplete.")
            print("  Expected: 10 eras, 5 perspectives")
            print(f"  Found: {eras_count} eras, {perspectives_count} perspectives")
    else:
        print("[INCOMPLETE] Database schema needs to be set up.")
        print()
        print_manual_instructions()

    print()
    print("=" * 70)

    return tables_exist == len(tables) and functions_exist == len(functions)


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
