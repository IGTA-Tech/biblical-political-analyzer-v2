# Historical Faith Tracker - Database Schema Setup

## Overview

This document provides instructions for setting up the database schema in Supabase.

## Prerequisites

- Access to Supabase Dashboard: https://supabase.com/dashboard/project/dmuhzumkxnastwdghdfg

## Schema Components

The schema includes:

### Tables (8 total)
1. **eras** - 10 historical periods from Apostolic Era to Contemporary
2. **perspectives** - 5 viewpoints (Orthodox, Catholic, Protestant, Jewish, Academic)
3. **events** - Historical events with vector embeddings (VECTOR 1536)
4. **event_interpretations** - Multi-perspective analysis for each event
5. **figures** - Historical figures with vector embeddings
6. **movements** - Religious movements
7. **scripture_usage** - KILLER FEATURE - tracking how scripture was used throughout history
8. **primary_sources** - Source document references

### Functions (6 total)
1. **search_events** - Vector similarity search for events
2. **search_figures** - Vector similarity search for figures
3. **search_scripture_usage** - Vector similarity search for scripture usage
4. **get_event_perspectives** - Get all perspectives for an event
5. **get_passage_history** - Get history of how a passage was used
6. **get_timeline_events** - Get events in a date range with filtering

### Seed Data
- 10 historical eras
- 5 theological perspectives

## Setup Method 1: Supabase SQL Editor (Recommended)

1. Open the Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/dmuhzumkxnastwdghdfg/sql/new
   ```

2. Copy the contents of `generated_schema.sql` (located in this directory)

3. Paste into the SQL editor

4. Click "Run" to execute

## Setup Method 2: Using psql

1. Get your database password from:
   ```
   https://supabase.com/dashboard/project/dmuhzumkxnastwdghdfg/settings/database
   ```

2. Run:
   ```bash
   psql "postgresql://postgres:YOUR_PASSWORD@db.dmuhzumkxnastwdghdfg.supabase.co:5432/postgres" \
        -f generated_schema.sql
   ```

## Setup Method 3: Using Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref dmuhzumkxnastwdghdfg
   ```

3. Push the schema:
   ```bash
   supabase db push
   ```

## Verification

After executing the schema, run the verification script:

```bash
python3 run_schema.py
```

Or use curl to check if tables exist:

```bash
curl "https://dmuhzumkxnastwdghdfg.supabase.co/rest/v1/eras?limit=0" \
  -H "apikey: YOUR_ANON_KEY"
```

## Files in This Directory

- `generated_schema.sql` - Complete SQL schema (ready to execute)
- `setup_schema.py` - Python script to generate SQL and verify schema
- `run_schema.py` - Python script to verify schema after setup
- `execute_via_api.py` - Script to insert seed data via REST API

## Troubleshooting

### pgvector Extension
If you get an error about the vector extension, it should be pre-installed in Supabase. If not, contact Supabase support.

### Foreign Key Errors
Ensure tables are created in the correct order. The `generated_schema.sql` file has the correct order.

### Seed Data Conflicts
The seed data INSERT statements use `ON CONFLICT DO NOTHING` to prevent duplicate errors.
