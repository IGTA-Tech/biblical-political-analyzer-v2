#!/usr/bin/env python3
"""
Historical Faith Tracker - Database Schema Setup Script

This script sets up the complete database schema in Supabase including:
- pgvector extension
- All tables (eras, perspectives, events, event_interpretations, figures, movements, scripture_usage, primary_sources)
- Indexes for performance
- Vector search functions
- Utility functions
- Seed data for eras and perspectives

Usage:
    python setup_schema.py
"""

import os
import sys
import json
import urllib.request
import urllib.error
from typing import Optional

# Load environment variables from parent .env file
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

if not SUPABASE_SERVICE_ROLE_KEY:
    print("[ERROR] SUPABASE_SERVICE_ROLE_KEY not found in environment")
    sys.exit(1)


def make_request(url: str, method: str = 'GET', data: dict = None, extra_headers: dict = None) -> tuple:
    """Make HTTP request using urllib."""
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    if extra_headers:
        headers.update(extra_headers)

    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.status, response.read().decode('utf-8'), dict(response.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8'), dict(e.headers)
    except urllib.error.URLError as e:
        return 0, str(e.reason), {}
    except Exception as e:
        return 0, str(e), {}


class SupabaseSchemaSetup:
    """Class to manage Supabase schema setup."""

    def __init__(self):
        self.supabase_url = SUPABASE_URL
        self.service_key = SUPABASE_SERVICE_ROLE_KEY
        self.results = []

    def log(self, message: str, status: str = "INFO"):
        """Log a message with status."""
        print(f"[{status}] {message}")
        self.results.append((status, message))

    def check_table_exists(self, table_name: str) -> bool:
        """Check if a table exists using the REST API."""
        url = f"{self.supabase_url}/rest/v1/{table_name}?limit=0"
        status, body, headers = make_request(url, 'GET')
        return status == 200

    def get_schema_sql(self) -> list:
        """Return the schema SQL statements broken into logical chunks."""

        statements = []

        # 1. Enable pgvector extension
        statements.append((
            "Enable pgvector extension",
            "CREATE EXTENSION IF NOT EXISTS vector;"
        ))

        # 2. Create eras table
        statements.append((
            "Create eras table",
            """
            CREATE TABLE IF NOT EXISTS eras (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                start_year INTEGER NOT NULL,
                end_year INTEGER,
                description TEXT,
                christianity_status TEXT,
                judaism_status TEXT,
                color TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        ))

        # 3. Create perspectives table
        statements.append((
            "Create perspectives table",
            """
            CREATE TABLE IF NOT EXISTS perspectives (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                tradition TEXT NOT NULL,
                description TEXT,
                methodology TEXT,
                key_assumptions TEXT[],
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        ))

        # 4. Create events table
        statements.append((
            "Create events table",
            """
            CREATE TABLE IF NOT EXISTS events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                year_start INTEGER,
                year_end INTEGER,
                date_precision TEXT DEFAULT 'year',
                era_id UUID REFERENCES eras(id),
                event_type TEXT,
                traditions_affected TEXT[],
                summary TEXT,
                detailed_narrative TEXT,
                significance TEXT,
                scholarly_consensus TEXT DEFAULT 'established',
                location TEXT,
                location_lat DECIMAL(10, 8),
                location_lng DECIMAL(11, 8),
                primary_sources TEXT[],
                embedding VECTOR(1536),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        ))

        # 5. Create event_interpretations table
        statements.append((
            "Create event_interpretations table",
            """
            CREATE TABLE IF NOT EXISTS event_interpretations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                perspective_id UUID REFERENCES perspectives(id),
                interpretation TEXT NOT NULL,
                key_points TEXT[],
                areas_of_agreement TEXT[],
                areas_of_disagreement TEXT[],
                sources TEXT[],
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(event_id, perspective_id)
            );
            """
        ))

        # 6. Create figures table
        statements.append((
            "Create figures table",
            """
            CREATE TABLE IF NOT EXISTS figures (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                alternate_names TEXT[],
                birth_year INTEGER,
                death_year INTEGER,
                tradition TEXT,
                roles TEXT[],
                biography TEXT,
                key_contributions TEXT[],
                controversies TEXT[],
                embedding VECTOR(1536),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        ))

        # 7. Create movements table
        statements.append((
            "Create movements table",
            """
            CREATE TABLE IF NOT EXISTS movements (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                tradition TEXT,
                start_year INTEGER,
                end_year INTEGER,
                description TEXT,
                core_beliefs TEXT[],
                key_figures TEXT[],
                parent_movement_id UUID REFERENCES movements(id),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        ))

        # 8. Create scripture_usage table (KILLER FEATURE)
        statements.append((
            "Create scripture_usage table",
            """
            CREATE TABLE IF NOT EXISTS scripture_usage (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                passage_reference TEXT NOT NULL,
                passage_text TEXT,
                event_id UUID REFERENCES events(id),
                figure_id UUID REFERENCES figures(id),
                movement_id UUID REFERENCES movements(id),
                usage_year INTEGER,
                usage_era_id UUID REFERENCES eras(id),
                usage_type TEXT,
                usage_context TEXT,
                how_used TEXT,
                interpretation_given TEXT,
                faithful_to_original_context TEXT,
                impact_description TEXT,
                perspective_views JSONB,
                embedding VECTOR(1536),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        ))

        # 9. Create primary_sources table
        statements.append((
            "Create primary_sources table",
            """
            CREATE TABLE IF NOT EXISTS primary_sources (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                author TEXT,
                author_figure_id UUID REFERENCES figures(id),
                date_written INTEGER,
                source_type TEXT,
                tradition TEXT,
                url TEXT,
                archive_source TEXT,
                content_summary TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        ))

        # 10. Create indexes
        statements.append((
            "Create index on events.era_id",
            "CREATE INDEX IF NOT EXISTS idx_events_era ON events(era_id);"
        ))
        statements.append((
            "Create index on events.year_start",
            "CREATE INDEX IF NOT EXISTS idx_events_year ON events(year_start);"
        ))
        statements.append((
            "Create index on events.event_type",
            "CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);"
        ))
        statements.append((
            "Create GIN index on events.traditions_affected",
            "CREATE INDEX IF NOT EXISTS idx_events_traditions ON events USING GIN(traditions_affected);"
        ))
        statements.append((
            "Create index on scripture_usage.passage_reference",
            "CREATE INDEX IF NOT EXISTS idx_scripture_passage ON scripture_usage(passage_reference);"
        ))
        statements.append((
            "Create index on scripture_usage.usage_year",
            "CREATE INDEX IF NOT EXISTS idx_scripture_year ON scripture_usage(usage_year);"
        ))
        statements.append((
            "Create index on scripture_usage.usage_type",
            "CREATE INDEX IF NOT EXISTS idx_scripture_type ON scripture_usage(usage_type);"
        ))
        statements.append((
            "Create index on figures.tradition",
            "CREATE INDEX IF NOT EXISTS idx_figures_tradition ON figures(tradition);"
        ))
        statements.append((
            "Create index on figures.birth_year and death_year",
            "CREATE INDEX IF NOT EXISTS idx_figures_years ON figures(birth_year, death_year);"
        ))

        # 11. Vector search functions
        statements.append((
            "Create search_events function",
            """
            CREATE OR REPLACE FUNCTION search_events(
                query_embedding VECTOR(1536),
                match_threshold FLOAT DEFAULT 0.5,
                match_count INT DEFAULT 10
            )
            RETURNS TABLE (
                id UUID,
                title TEXT,
                summary TEXT,
                year_start INTEGER,
                similarity FLOAT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    e.id,
                    e.title,
                    e.summary,
                    e.year_start,
                    1 - (e.embedding <=> query_embedding) AS similarity
                FROM events e
                WHERE e.embedding IS NOT NULL
                AND 1 - (e.embedding <=> query_embedding) > match_threshold
                ORDER BY e.embedding <=> query_embedding
                LIMIT match_count;
            END;
            $$;
            """
        ))

        statements.append((
            "Create search_scripture_usage function",
            """
            CREATE OR REPLACE FUNCTION search_scripture_usage(
                query_embedding VECTOR(1536),
                match_threshold FLOAT DEFAULT 0.5,
                match_count INT DEFAULT 10
            )
            RETURNS TABLE (
                id UUID,
                passage_reference TEXT,
                how_used TEXT,
                usage_year INTEGER,
                similarity FLOAT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    s.id,
                    s.passage_reference,
                    s.how_used,
                    s.usage_year,
                    1 - (s.embedding <=> query_embedding) AS similarity
                FROM scripture_usage s
                WHERE s.embedding IS NOT NULL
                AND 1 - (s.embedding <=> query_embedding) > match_threshold
                ORDER BY s.embedding <=> query_embedding
                LIMIT match_count;
            END;
            $$;
            """
        ))

        statements.append((
            "Create search_figures function",
            """
            CREATE OR REPLACE FUNCTION search_figures(
                query_embedding VECTOR(1536),
                match_threshold FLOAT DEFAULT 0.5,
                match_count INT DEFAULT 10
            )
            RETURNS TABLE (
                id UUID,
                name TEXT,
                biography TEXT,
                tradition TEXT,
                similarity FLOAT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    f.id,
                    f.name,
                    f.biography,
                    f.tradition,
                    1 - (f.embedding <=> query_embedding) AS similarity
                FROM figures f
                WHERE f.embedding IS NOT NULL
                AND 1 - (f.embedding <=> query_embedding) > match_threshold
                ORDER BY f.embedding <=> query_embedding
                LIMIT match_count;
            END;
            $$;
            """
        ))

        # 12. Utility functions
        statements.append((
            "Create get_event_perspectives function",
            """
            CREATE OR REPLACE FUNCTION get_event_perspectives(event_uuid UUID)
            RETURNS TABLE (
                perspective_name TEXT,
                tradition TEXT,
                interpretation TEXT,
                key_points TEXT[],
                sources TEXT[]
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    p.name,
                    p.tradition,
                    ei.interpretation,
                    ei.key_points,
                    ei.sources
                FROM event_interpretations ei
                JOIN perspectives p ON ei.perspective_id = p.id
                WHERE ei.event_id = event_uuid
                ORDER BY p.name;
            END;
            $$;
            """
        ))

        statements.append((
            "Create get_passage_history function",
            """
            CREATE OR REPLACE FUNCTION get_passage_history(passage TEXT)
            RETURNS TABLE (
                usage_year INTEGER,
                usage_type TEXT,
                how_used TEXT,
                faithful_to_original TEXT,
                event_title TEXT,
                figure_name TEXT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    su.usage_year,
                    su.usage_type,
                    su.how_used,
                    su.faithful_to_original_context,
                    e.title,
                    f.name
                FROM scripture_usage su
                LEFT JOIN events e ON su.event_id = e.id
                LEFT JOIN figures f ON su.figure_id = f.id
                WHERE su.passage_reference ILIKE '%' || passage || '%'
                ORDER BY su.usage_year;
            END;
            $$;
            """
        ))

        statements.append((
            "Create get_timeline_events function",
            """
            CREATE OR REPLACE FUNCTION get_timeline_events(
                start_year INTEGER,
                end_year INTEGER,
                tradition_filter TEXT[] DEFAULT NULL,
                event_type_filter TEXT[] DEFAULT NULL
            )
            RETURNS TABLE (
                id UUID,
                title TEXT,
                year_start INTEGER,
                year_end INTEGER,
                event_type TEXT,
                traditions_affected TEXT[],
                summary TEXT,
                location TEXT,
                location_lat DECIMAL,
                location_lng DECIMAL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    e.id,
                    e.title,
                    e.year_start,
                    e.year_end,
                    e.event_type,
                    e.traditions_affected,
                    e.summary,
                    e.location,
                    e.location_lat,
                    e.location_lng
                FROM events e
                WHERE e.year_start >= start_year
                AND e.year_start <= end_year
                AND (tradition_filter IS NULL OR e.traditions_affected && tradition_filter)
                AND (event_type_filter IS NULL OR e.event_type = ANY(event_type_filter))
                ORDER BY e.year_start;
            END;
            $$;
            """
        ))

        return statements

    def get_seed_data_sql(self) -> list:
        """Return the seed data SQL statements."""

        statements = []

        # Seed data for eras
        statements.append((
            "Insert seed data for eras",
            """
            INSERT INTO eras (name, start_year, end_year, description, color) VALUES
            ('Apostolic Era', -4, 100, 'From Jesus birth to the death of the last apostle', '#4CAF50'),
            ('Ante-Nicene Period', 100, 325, 'Early church before the Council of Nicaea', '#8BC34A'),
            ('Post-Nicene/Byzantine', 325, 600, 'Age of ecumenical councils and creeds', '#CDDC39'),
            ('Early Medieval', 600, 1000, 'Rise of Islam, monasticism, Charlemagne', '#FFEB3B'),
            ('High Medieval', 1000, 1300, 'Crusades, Scholasticism, cathedrals', '#FFC107'),
            ('Late Medieval', 1300, 1517, 'Pre-Reformation, Black Death, mysticism', '#FF9800'),
            ('Reformation', 1517, 1648, 'Protestant Reformation and Catholic Counter-Reformation', '#FF5722'),
            ('Post-Reformation', 1648, 1800, 'Enlightenment, pietism, revivals', '#795548'),
            ('Modern Era', 1800, 1950, 'Liberalism, fundamentalism, world wars', '#607D8B'),
            ('Contemporary', 1950, 2024, 'Vatican II, ecumenism, globalization', '#9C27B0')
            ON CONFLICT DO NOTHING;
            """
        ))

        # Seed data for perspectives
        statements.append((
            "Insert seed data for perspectives",
            """
            INSERT INTO perspectives (name, tradition, description, methodology) VALUES
            ('Eastern Orthodox', 'Christianity', 'The perspective of the Eastern Orthodox churches', 'Emphasis on Holy Tradition, patristic consensus, and liturgical continuity'),
            ('Roman Catholic', 'Christianity', 'The perspective of the Roman Catholic Church', 'Magisterial interpretation, papal authority, and development of doctrine'),
            ('Protestant', 'Christianity', 'The perspective of Protestant traditions', 'Sola scriptura, historical-critical methods, and confessional standards'),
            ('Orthodox Judaism', 'Judaism', 'The perspective of traditional/Orthodox Judaism', 'Halakhic interpretation, Talmudic methodology, and rabbinic authority'),
            ('Academic/Secular', 'Secular', 'The perspective of secular historical scholarship', 'Historical-critical method, empirical evidence, and neutrality toward theological claims')
            ON CONFLICT DO NOTHING;
            """
        ))

        return statements

    def generate_full_sql(self) -> str:
        """Generate the complete SQL script."""
        schema_statements = self.get_schema_sql()
        seed_statements = self.get_seed_data_sql()

        sql_parts = []
        sql_parts.append("-- Historical Faith Tracker Database Schema")
        sql_parts.append("-- Generated by setup_schema.py")
        sql_parts.append("")

        for description, sql in schema_statements:
            sql_parts.append(f"-- {description}")
            sql_parts.append(sql.strip())
            sql_parts.append("")

        sql_parts.append("-- Seed Data")
        for description, sql in seed_statements:
            sql_parts.append(f"-- {description}")
            sql_parts.append(sql.strip())
            sql_parts.append("")

        return "\n".join(sql_parts)

    def verify_tables(self) -> dict:
        """Verify that all tables were created successfully."""
        tables = ['eras', 'perspectives', 'events', 'event_interpretations',
                  'figures', 'movements', 'scripture_usage', 'primary_sources']

        results = {}
        for table in tables:
            exists = self.check_table_exists(table)
            results[table] = exists
            status = "OK" if exists else "MISSING"
            self.log(f"Table '{table}': {status}", "SUCCESS" if exists else "ERROR")

        return results

    def verify_functions(self) -> dict:
        """Verify that all functions were created by testing them."""
        functions = {
            'search_events': False,
            'search_figures': False,
            'search_scripture_usage': False,
            'get_event_perspectives': False,
            'get_passage_history': False,
            'get_timeline_events': False
        }

        # Try to call each function via RPC
        for func_name in functions.keys():
            url = f"{self.supabase_url}/rest/v1/rpc/{func_name}"
            status, body, headers = make_request(url, 'POST', data={})
            # If we get 400 (bad request) instead of 404, the function exists
            if status != 404:
                functions[func_name] = True
                self.log(f"Function '{func_name}': OK", "SUCCESS")
            else:
                self.log(f"Function '{func_name}': NOT FOUND", "ERROR")

        return functions

    def count_table_rows(self, table_name: str) -> Optional[int]:
        """Count rows in a table."""
        url = f"{self.supabase_url}/rest/v1/{table_name}?select=count"
        status, body, headers = make_request(url, 'GET', extra_headers={'Prefer': 'count=exact'})
        if status == 200:
            # Get count from content-range header
            content_range = headers.get('content-range', headers.get('Content-Range', ''))
            if '/' in content_range:
                return int(content_range.split('/')[-1])
        return None

    def execute_sql_via_curl(self, sql: str, description: str) -> bool:
        """
        Execute SQL using curl command (alternative method).
        This method will be used by the shell script.
        """
        # This is a placeholder - actual execution is done via curl in shell
        return False


def main():
    """Main function to run the schema setup."""
    print("=" * 70)
    print("HISTORICAL FAITH TRACKER - DATABASE SCHEMA SETUP")
    print("=" * 70)
    print()

    setup = SupabaseSchemaSetup()

    # Generate the full SQL script
    print("[STEP 1] Generating SQL schema...")
    full_sql = setup.generate_full_sql()

    # Write SQL to file for reference/manual execution
    sql_file = os.path.join(os.path.dirname(__file__), 'generated_schema.sql')
    with open(sql_file, 'w') as f:
        f.write(full_sql)
    print(f"[INFO] Full SQL schema written to: {sql_file}")
    print()

    # Print instructions for manual execution
    print("[STEP 2] SQL Execution Instructions")
    print("-" * 70)
    print("""
IMPORTANT: Supabase REST API does not support executing raw SQL directly.
To set up the database schema, please follow these steps:

1. Go to your Supabase Dashboard:
   https://supabase.com/dashboard/project/dmuhzumkxnastwdghdfg

2. Navigate to the SQL Editor (left sidebar)

3. Copy and paste the contents of the generated SQL file:
   {sql_file}

4. Click 'Run' to execute the schema

Alternatively, use the Supabase CLI:
   supabase db push

Or use psql directly with the connection string from your project settings.
""".format(sql_file=sql_file))

    print("-" * 70)
    print()

    # Verify current state of tables
    print("[STEP 3] Verifying existing tables...")
    table_results = setup.verify_tables()
    print()

    # Count seed data
    print("[STEP 4] Checking seed data...")
    eras_count = setup.count_table_rows('eras')
    perspectives_count = setup.count_table_rows('perspectives')

    if eras_count is not None:
        print(f"[INFO] Eras table has {eras_count} rows")
    if perspectives_count is not None:
        print(f"[INFO] Perspectives table has {perspectives_count} rows")
    print()

    # Verify functions
    print("[STEP 5] Verifying functions...")
    function_results = setup.verify_functions()
    print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)

    tables_ok = sum(1 for v in table_results.values() if v)
    tables_total = len(table_results)
    functions_ok = sum(1 for v in function_results.values() if v)
    functions_total = len(function_results)

    print(f"Tables: {tables_ok}/{tables_total} verified")
    print(f"Functions: {functions_ok}/{functions_total} verified")
    print()

    if tables_ok == tables_total and functions_ok == functions_total:
        print("[SUCCESS] Database schema is fully set up!")
    elif tables_ok == 0:
        print("[ACTION REQUIRED] No tables found. Please run the SQL schema manually.")
        print(f"SQL file location: {sql_file}")
    else:
        print("[PARTIAL] Some components may be missing. Please review and run any missing SQL.")

    print()
    print("=" * 70)

    return tables_ok == tables_total


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
