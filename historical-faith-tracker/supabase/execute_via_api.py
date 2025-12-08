#!/usr/bin/env python3
"""
Historical Faith Tracker - Execute Schema via Supabase API

This script attempts to execute the SQL schema using various methods.
Since Supabase REST API doesn't support raw SQL, we try alternative approaches.
"""

import os
import sys
import json
import urllib.request
import urllib.error
import subprocess
from typing import Tuple, Optional

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
        return True
    return False

load_env()

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', 'https://dmuhzumkxnastwdghdfg.supabase.co')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
PROJECT_REF = 'dmuhzumkxnastwdghdfg'

def make_request(url: str, method: str = 'GET', data: dict = None, headers: dict = None) -> Tuple[int, str, dict]:
    """Make HTTP request."""
    default_headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }
    if headers:
        default_headers.update(headers)

    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')

    req = urllib.request.Request(url, data=req_data, headers=default_headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            return response.status, response.read().decode('utf-8'), dict(response.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8'), dict(e.headers)
    except Exception as e:
        return 0, str(e), {}


def insert_row(table: str, data: dict) -> bool:
    """Insert a row into a table using REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {'Prefer': 'return=minimal'}
    status, body, _ = make_request(url, 'POST', data, headers)
    return status in [200, 201]


def check_table_exists(table: str) -> bool:
    """Check if table exists."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?limit=0"
    status, _, _ = make_request(url, 'GET')
    return status == 200


def count_rows(table: str) -> int:
    """Count rows in table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    headers = {'Prefer': 'count=exact'}
    status, _, resp_headers = make_request(url, 'GET', headers=headers)
    if status == 200:
        content_range = resp_headers.get('Content-Range', resp_headers.get('content-range', ''))
        if '/' in content_range:
            return int(content_range.split('/')[-1])
    return 0


def seed_eras() -> Tuple[int, int]:
    """Insert seed data for eras table."""
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

    success = 0
    failed = 0
    for era in eras:
        if insert_row('eras', era):
            success += 1
        else:
            failed += 1

    return success, failed


def seed_perspectives() -> Tuple[int, int]:
    """Insert seed data for perspectives table."""
    perspectives = [
        {'name': 'Eastern Orthodox', 'tradition': 'Christianity', 'description': 'The perspective of the Eastern Orthodox churches', 'methodology': 'Emphasis on Holy Tradition, patristic consensus, and liturgical continuity'},
        {'name': 'Roman Catholic', 'tradition': 'Christianity', 'description': 'The perspective of the Roman Catholic Church', 'methodology': 'Magisterial interpretation, papal authority, and development of doctrine'},
        {'name': 'Protestant', 'tradition': 'Christianity', 'description': 'The perspective of Protestant traditions', 'methodology': 'Sola scriptura, historical-critical methods, and confessional standards'},
        {'name': 'Orthodox Judaism', 'tradition': 'Judaism', 'description': 'The perspective of traditional/Orthodox Judaism', 'methodology': 'Halakhic interpretation, Talmudic methodology, and rabbinic authority'},
        {'name': 'Academic/Secular', 'tradition': 'Secular', 'description': 'The perspective of secular historical scholarship', 'methodology': 'Historical-critical method, empirical evidence, and neutrality toward theological claims'}
    ]

    success = 0
    failed = 0
    for persp in perspectives:
        if insert_row('perspectives', persp):
            success += 1
        else:
            failed += 1

    return success, failed


def main():
    """Main function."""
    print("=" * 70)
    print("HISTORICAL FAITH TRACKER - SEED DATA INSERTION")
    print("=" * 70)
    print()

    # Check if tables exist first
    print("[CHECK] Checking if tables exist...")
    if not check_table_exists('eras'):
        print("[ERROR] 'eras' table does not exist.")
        print("[INFO] You need to run the schema SQL first.")
        print()
        print("Please execute the SQL schema using one of these methods:")
        print()
        print("1. Supabase Dashboard:")
        print(f"   https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new")
        print()
        print("2. Use the generated SQL file:")
        sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')
        print(f"   {sql_file}")
        print()
        return False

    if not check_table_exists('perspectives'):
        print("[ERROR] 'perspectives' table does not exist.")
        return False

    print("[OK] Tables exist.")
    print()

    # Check current data
    print("[CHECK] Checking existing data...")
    eras_count = count_rows('eras')
    persp_count = count_rows('perspectives')
    print(f"  Eras: {eras_count} rows")
    print(f"  Perspectives: {persp_count} rows")
    print()

    if eras_count >= 10 and persp_count >= 5:
        print("[INFO] Seed data already exists. Skipping insertion.")
        return True

    # Insert seed data
    print("[SEED] Inserting seed data...")

    if eras_count < 10:
        print("  Inserting eras...")
        success, failed = seed_eras()
        print(f"    Success: {success}, Failed: {failed}")

    if persp_count < 5:
        print("  Inserting perspectives...")
        success, failed = seed_perspectives()
        print(f"    Success: {success}, Failed: {failed}")

    print()

    # Verify
    print("[VERIFY] Checking final data...")
    eras_count = count_rows('eras')
    persp_count = count_rows('perspectives')
    print(f"  Eras: {eras_count} rows")
    print(f"  Perspectives: {persp_count} rows")
    print()

    if eras_count >= 10 and persp_count >= 5:
        print("[SUCCESS] Seed data inserted successfully!")
        return True
    else:
        print("[WARNING] Some seed data may be missing.")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
