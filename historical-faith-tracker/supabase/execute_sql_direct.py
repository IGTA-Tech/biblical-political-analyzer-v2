#!/usr/bin/env python3
"""
Historical Faith Tracker - Execute SQL via Supabase SQL API

This script uses Python's socket to connect directly to Supabase PostgreSQL
using the database credentials.
"""

import os
import sys
import json
import subprocess
import urllib.request
import urllib.error

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
        return True
    return False

load_env()

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', 'https://dmuhzumkxnastwdghdfg.supabase.co')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
PROJECT_REF = 'dmuhzumkxnastwdghdfg'


def execute_sql_statements():
    """
    Execute SQL statements one by one using curl and Supabase SQL API.

    Note: The standard Supabase REST API doesn't support DDL operations.
    We need to use the Supabase Management API or direct PostgreSQL connection.
    """

    # Read the SQL file
    sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')
    with open(sql_file, 'r') as f:
        sql_content = f.read()

    print(f"[INFO] Read SQL file: {sql_file}")
    print(f"[INFO] SQL content length: {len(sql_content)} characters")
    print()

    # Print the SQL for copy-paste
    print("=" * 70)
    print("COPY THE FOLLOWING SQL AND PASTE INTO SUPABASE SQL EDITOR")
    print("=" * 70)
    print()
    print(f"URL: https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new")
    print()
    print("--- START SQL ---")
    print()
    print(sql_content)
    print()
    print("--- END SQL ---")
    print()

    return True


def check_tables():
    """Check if tables were created."""
    tables = ['eras', 'perspectives', 'events', 'event_interpretations',
              'figures', 'movements', 'scripture_usage', 'primary_sources']

    results = {}
    for table in tables:
        url = f"{SUPABASE_URL}/rest/v1/{table}?limit=0"
        headers = {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}'
        }
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                results[table] = response.status == 200
        except urllib.error.HTTPError:
            results[table] = False
        except:
            results[table] = False

    return results


def main():
    print("=" * 70)
    print("HISTORICAL FAITH TRACKER - SQL EXECUTION")
    print("=" * 70)
    print()

    # Check current state first
    print("[STEP 1] Checking current database state...")
    table_results = check_tables()

    tables_exist = sum(1 for v in table_results.values() if v)
    print(f"  Tables found: {tables_exist}/{len(table_results)}")

    for table, exists in table_results.items():
        status = "EXISTS" if exists else "MISSING"
        print(f"    {table}: {status}")

    print()

    if tables_exist == len(table_results):
        print("[SUCCESS] All tables already exist!")
        print()

        # Check seed data
        print("[STEP 2] Checking seed data...")
        for table in ['eras', 'perspectives']:
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
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
                        count = int(content_range.split('/')[-1])
                        print(f"  {table}: {count} rows")
            except:
                pass

        return True
    else:
        print("[ACTION REQUIRED] Tables need to be created.")
        print()
        execute_sql_statements()
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
