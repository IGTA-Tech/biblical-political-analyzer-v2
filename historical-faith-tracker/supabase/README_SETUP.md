# Historical Faith Tracker - Database Setup

## Quick Start

### Step 1: Execute SQL Schema

The SQL schema must be executed manually in Supabase. Choose one method:

#### Option A: Supabase SQL Editor (Recommended)

1. Open: https://supabase.com/dashboard/project/dmuhzumkxnastwdghdfg/sql/new
2. Open the file: `generated_schema.sql`
3. Copy all contents
4. Paste into the SQL editor
5. Click "Run"

#### Option B: Using Database Password

1. Get your database password from Supabase Dashboard:
   - Settings > Database > Connection string > Password
2. Add to `.env` file:
   ```
   SUPABASE_DB_PASSWORD=your_password_here
   ```
3. Run:
   ```bash
   python3 final_setup.py
   ```

### Step 2: Verify Setup

After executing the SQL, run the verification:

```bash
python3 final_setup.py
```

Expected output:
```
Tables: 8/8
Functions: 6/6
Seed Data:
  eras: 10 rows
  perspectives: 5 rows
```

## Files Overview

| File | Purpose |
|------|---------|
| `generated_schema.sql` | Complete SQL schema ready to execute |
| `final_setup.py` | Main setup script with verification |
| `setup_schema.py` | SQL generation and validation |
| `run_schema.py` | Schema verification only |
| `execute_sql_pg.py` | Execute via PostgreSQL connection |
| `SETUP_INSTRUCTIONS.md` | Detailed setup instructions |

## Schema Components

### Tables (8)
1. `eras` - Historical periods
2. `perspectives` - Theological viewpoints
3. `events` - Historical events with embeddings
4. `event_interpretations` - Multi-perspective analysis
5. `figures` - Historical figures
6. `movements` - Religious movements
7. `scripture_usage` - Scripture tracking (KILLER FEATURE)
8. `primary_sources` - Source documents

### Functions (6)
1. `search_events` - Vector similarity search
2. `search_figures` - Vector similarity search
3. `search_scripture_usage` - Vector similarity search
4. `get_event_perspectives` - Get perspectives for event
5. `get_passage_history` - Scripture usage history
6. `get_timeline_events` - Timeline filtering

### Seed Data
- 10 historical eras (Apostolic through Contemporary)
- 5 perspectives (Orthodox, Catholic, Protestant, Jewish, Academic)

## Troubleshooting

### "Table does not exist" error
- SQL schema has not been executed yet
- Execute `generated_schema.sql` in Supabase SQL Editor

### "pgvector extension" error
- pgvector is pre-installed in Supabase
- If error persists, contact Supabase support

### Connection issues
- Check that SUPABASE_SERVICE_ROLE_KEY is correct in `.env`
- Verify project URL matches: https://dmuhzumkxnastwdghdfg.supabase.co

## Support

For issues, check:
1. Supabase Dashboard logs
2. SQL Editor error messages
3. Network connectivity to Supabase
