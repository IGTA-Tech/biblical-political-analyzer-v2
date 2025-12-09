"""
Setup script to create the news_cache table in Supabase.

This table stores cached current events research results to reduce
API calls and improve response times.

Run this script once to create the table:
    python scripts/setup_news_cache.py
"""

import os
import requests
from dotenv import load_dotenv

# Load environment
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT_DIR, '.env'))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# SQL to create the news_cache table
CREATE_TABLE_SQL = """
-- Create news_cache table for caching current events research
CREATE TABLE IF NOT EXISTS news_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(64) UNIQUE NOT NULL,
    theme_id VARCHAR(50) NOT NULL,
    result JSONB NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_news_cache_key ON news_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_news_cache_theme ON news_cache(theme_id);
CREATE INDEX IF NOT EXISTS idx_news_cache_expires ON news_cache(expires_at);

-- Enable RLS
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the app)
CREATE POLICY IF NOT EXISTS "Allow public read" ON news_cache
    FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Allow service insert" ON news_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow service update" ON news_cache
    FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Allow service delete" ON news_cache
    FOR DELETE USING (true);

-- Add comment
COMMENT ON TABLE news_cache IS 'Cache for current events research results from Perplexity AI';
"""


def execute_sql(sql: str) -> dict:
    """Execute SQL via Supabase REST API."""
    # Use the SQL endpoint
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        },
        json={"query": sql}
    )
    return response


def check_table_exists() -> bool:
    """Check if news_cache table exists."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/news_cache",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        },
        params={"select": "id", "limit": "1"}
    )
    return response.status_code == 200


def create_table_direct():
    """Create table by inserting a test record (simpler approach)."""
    # First, try to access the table
    if check_table_exists():
        print("[OK] news_cache table already exists")
        return True

    print("Table doesn't exist. Please create it in Supabase dashboard:")
    print("\n" + "=" * 60)
    print("SQL to run in Supabase SQL Editor:")
    print("=" * 60)
    print(CREATE_TABLE_SQL)
    print("=" * 60)

    return False


def test_cache():
    """Test the cache by inserting and reading a record."""
    import json
    from datetime import datetime

    test_data = {
        "cache_key": "test_key_123",
        "theme_id": "test",
        "result": json.dumps({"test": "data", "timestamp": datetime.utcnow().isoformat()}),
        "cached_at": datetime.utcnow().isoformat() + "Z"
    }

    # Try to insert
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/news_cache",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        json=test_data
    )

    if response.status_code in [200, 201]:
        print("[OK] Test insert successful")

        # Clean up test data
        requests.delete(
            f"{SUPABASE_URL}/rest/v1/news_cache",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
            },
            params={"cache_key": "eq.test_key_123"}
        )
        print("[OK] Test cleanup successful")
        return True
    else:
        print(f"[ERROR] Test insert failed: {response.status_code}")
        print(response.text)
        return False


def main():
    print("=" * 60)
    print("NEWS CACHE TABLE SETUP")
    print("=" * 60)

    print(f"\nSupabase URL: {SUPABASE_URL}")
    print(f"Using service role key: {'Yes' if SUPABASE_KEY else 'No'}")

    # Check if table exists
    print("\nChecking table status...")

    if check_table_exists():
        print("[OK] news_cache table exists")
        print("\nTesting cache functionality...")
        if test_cache():
            print("\n[SUCCESS] Cache is working correctly!")
        else:
            print("\n[WARNING] Cache test failed - check RLS policies")
    else:
        print("[INFO] news_cache table not found")
        print("\nPlease create the table using the SQL below in Supabase Dashboard:")
        print("\n" + "-" * 60)
        print("""
-- Create news_cache table for caching current events research
CREATE TABLE news_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(64) UNIQUE NOT NULL,
    theme_id VARCHAR(50) NOT NULL,
    result JSONB NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create indexes
CREATE INDEX idx_news_cache_key ON news_cache(cache_key);
CREATE INDEX idx_news_cache_theme ON news_cache(theme_id);

-- Enable RLS with public access
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON news_cache
    FOR ALL USING (true) WITH CHECK (true);
        """)
        print("-" * 60)
        print("\nAfter creating the table, run this script again to verify.")


if __name__ == "__main__":
    main()
