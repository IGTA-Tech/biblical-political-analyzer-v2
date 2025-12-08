#!/usr/bin/env python3
"""
Historical Faith Tracker - Final Database Schema Setup

This is the main entry point for setting up the database schema.
It will:
1. Generate the SQL schema
2. Try to execute it automatically
3. Provide manual instructions if automatic execution fails
4. Verify the schema after execution
"""

import os
import sys
import json
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

# Configuration
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', 'https://dmuhzumkxnastwdghdfg.supabase.co')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
PROJECT_REF = 'dmuhzumkxnastwdghdfg'


def make_request(url, method='GET', data=None, headers=None):
    """Make HTTP request."""
    default_headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }
    if headers:
        default_headers.update(headers)

    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=default_headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.status, response.read().decode('utf-8'), dict(response.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8'), dict(e.headers)
    except Exception as e:
        return 0, str(e), {}


def check_table(table):
    """Check if a table exists."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?limit=0"
    status, _, _ = make_request(url)
    return status == 200


def count_rows(table):
    """Count rows in a table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    status, _, headers = make_request(url, headers={'Prefer': 'count=exact'})
    if status == 200:
        cr = headers.get('Content-Range', headers.get('content-range', ''))
        if '/' in cr:
            return int(cr.split('/')[-1])
    return 0


def check_function(func):
    """Check if an RPC function exists."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/{func}"
    status, _, _ = make_request(url, 'POST', data={})
    return status != 404


def verify_schema():
    """Verify the database schema."""
    print("[VERIFY] Checking database schema...")
    print()

    # Check tables
    tables = ['eras', 'perspectives', 'events', 'event_interpretations',
              'figures', 'movements', 'scripture_usage', 'primary_sources']

    print("Tables:")
    tables_ok = 0
    for table in tables:
        exists = check_table(table)
        status = "OK" if exists else "MISSING"
        print(f"  {table}: {status}")
        if exists:
            tables_ok += 1

    print()
    print(f"Tables: {tables_ok}/{len(tables)}")
    print()

    # Check functions
    functions = ['search_events', 'search_figures', 'search_scripture_usage',
                 'get_event_perspectives', 'get_passage_history', 'get_timeline_events']

    print("Functions:")
    funcs_ok = 0
    for func in functions:
        exists = check_function(func)
        status = "OK" if exists else "MISSING"
        print(f"  {func}: {status}")
        if exists:
            funcs_ok += 1

    print()
    print(f"Functions: {funcs_ok}/{len(functions)}")
    print()

    # Check seed data
    if tables_ok > 0:
        print("Seed Data:")
        eras = count_rows('eras')
        persp = count_rows('perspectives')
        print(f"  eras: {eras} rows (expected: 10)")
        print(f"  perspectives: {persp} rows (expected: 5)")
        print()

    return tables_ok == len(tables) and funcs_ok == len(functions)


def try_postgresql_execution():
    """Try to execute SQL via direct PostgreSQL connection."""
    try:
        import pg8000
    except ImportError:
        return False, "pg8000 not installed"

    db_password = os.environ.get('SUPABASE_DB_PASSWORD', '')
    if not db_password:
        return False, "SUPABASE_DB_PASSWORD not set"

    try:
        conn = pg8000.connect(
            host=f'db.{PROJECT_REF}.supabase.co',
            port=5432,
            database='postgres',
            user='postgres',
            password=db_password,
            ssl_context=True
        )

        # Read SQL
        sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')
        with open(sql_file, 'r') as f:
            sql_content = f.read()

        cursor = conn.cursor()

        # Parse and execute statements
        statements = parse_sql(sql_content)

        success = 0
        for stmt in statements:
            try:
                cursor.execute(stmt)
                conn.commit()
                success += 1
            except:
                conn.rollback()

        cursor.close()
        conn.close()

        return success > 0, f"Executed {success}/{len(statements)} statements"
    except Exception as e:
        return False, str(e)[:100]


def parse_sql(sql_content):
    """Parse SQL into individual statements."""
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

    return statements


def insert_seed_data():
    """Try to insert seed data via REST API."""
    print("[SEED] Inserting seed data via REST API...")

    # Insert eras
    eras = [
        {'name': 'Apostolic Era', 'start_year': -4, 'end_year': 100, 'description': 'From Jesus birth to the death of the last apostle', 'color': '#4CAF50'},
        {'name': 'Ante-Nicene Period', 'start_year': 100, 'end_year': 325, 'description': 'Early church before the Council of Nicaea', 'color': '#8BC34A'},
        {'name': 'Post-Nicene/Byzantine', 'start_year': 325, 'end_year': 600, 'description': 'Age of ecumenical councils and creeds', 'color': '#CDDC39'},
        {'name': 'Early Medieval', 'start_year': 600, 'end_year': 1000, 'description': 'Rise of Islam, monasticism, Charlemagne', 'color': '#FFEB3B'},
        {'name': 'High Medieval', 'start_year': 1000, 'end_year': 1300, 'description': 'Crusades, Scholasticism, cathedrals', 'color': '#FFC107'},
        {'name': 'Late Medieval', 'start_year': 1300, 'end_year': 1517, 'description': 'Pre-Reformation, Black Death, mysticism', 'color': '#FF9800'},
        {'name': 'Reformation', 'start_year': 1517, 'end_year': 1648, 'description': 'Protestant Reformation and Catholic Counter-Reformation', 'color': '#FF5722'},
        {'name': 'Post-Reformation', 'start_year': 1648, 'end_year': 1800, 'description': 'Enlightenment, pietism, revivals', 'color': '#795548'},
        {'name': 'Modern Era', 'start_year': 1800, 'end_year': 1950, 'description': 'Liberalism, fundamentalism, world wars', 'color': '#607D8B'},
        {'name': 'Contemporary', 'start_year': 1950, 'end_year': 2024, 'description': 'Vatican II, ecumenism, globalization', 'color': '#9C27B0'}
    ]

    perspectives = [
        {'name': 'Eastern Orthodox', 'tradition': 'Christianity', 'description': 'The perspective of the Eastern Orthodox churches', 'methodology': 'Emphasis on Holy Tradition, patristic consensus, and liturgical continuity'},
        {'name': 'Roman Catholic', 'tradition': 'Christianity', 'description': 'The perspective of the Roman Catholic Church', 'methodology': 'Magisterial interpretation, papal authority, and development of doctrine'},
        {'name': 'Protestant', 'tradition': 'Christianity', 'description': 'The perspective of Protestant traditions', 'methodology': 'Sola scriptura, historical-critical methods, and confessional standards'},
        {'name': 'Orthodox Judaism', 'tradition': 'Judaism', 'description': 'The perspective of traditional/Orthodox Judaism', 'methodology': 'Halakhic interpretation, Talmudic methodology, and rabbinic authority'},
        {'name': 'Academic/Secular', 'tradition': 'Secular', 'description': 'The perspective of secular historical scholarship', 'methodology': 'Historical-critical method, empirical evidence, and neutrality toward theological claims'}
    ]

    # Insert eras
    url = f"{SUPABASE_URL}/rest/v1/eras"
    for era in eras:
        status, _, _ = make_request(url, 'POST', era, {'Prefer': 'return=minimal'})
        if status in [200, 201]:
            print(f"  + Era: {era['name']}")

    # Insert perspectives
    url = f"{SUPABASE_URL}/rest/v1/perspectives"
    for persp in perspectives:
        status, _, _ = make_request(url, 'POST', persp, {'Prefer': 'return=minimal'})
        if status in [200, 201]:
            print(f"  + Perspective: {persp['name']}")

    print()


def print_manual_instructions():
    """Print instructions for manual SQL execution."""
    sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')

    print("""
======================================================================
MANUAL SQL EXECUTION REQUIRED
======================================================================

The database schema needs to be created manually. Please use one of
these methods:

METHOD 1: Supabase SQL Editor (Easiest)
---------------------------------------
1. Open: https://supabase.com/dashboard/project/{project}/sql/new
2. Copy contents from: {sql_file}
3. Paste and click "Run"

METHOD 2: psql Command Line
---------------------------
1. Get password from: https://supabase.com/dashboard/project/{project}/settings/database
2. Run: psql "postgresql://postgres:PASSWORD@db.{project}.supabase.co:5432/postgres" -f "{sql_file}"

METHOD 3: Add Password to .env
------------------------------
Add SUPABASE_DB_PASSWORD=your_password to .env and run this script again.

======================================================================
""".format(project=PROJECT_REF, sql_file=sql_file))


def main():
    print("=" * 70)
    print("HISTORICAL FAITH TRACKER - DATABASE SCHEMA SETUP")
    print("=" * 70)
    print()
    print(f"Project: {PROJECT_REF}")
    print(f"URL: {SUPABASE_URL}")
    print()

    # Step 1: Check current state
    print("[STEP 1] Checking current database state...")
    schema_complete = verify_schema()
    print()

    if schema_complete:
        print("[SUCCESS] Database schema is already complete!")
        print()
        return True

    # Step 2: Try automatic execution
    print("[STEP 2] Attempting automatic SQL execution...")
    success, msg = try_postgresql_execution()
    print(f"  Result: {msg}")
    print()

    if success:
        # Verify again
        print("[STEP 3] Verifying schema after execution...")
        schema_complete = verify_schema()
        if schema_complete:
            # Try to insert seed data
            print("[STEP 4] Checking seed data...")
            if count_rows('eras') < 10 or count_rows('perspectives') < 5:
                insert_seed_data()

            print("[SUCCESS] Database schema setup complete!")
            return True

    # Step 3: Manual instructions
    print_manual_instructions()

    # Final check
    print("After manual execution, run this script again to verify.")
    print()

    return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
