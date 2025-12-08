#!/bin/bash

# Historical Faith Tracker - Execute Schema in Supabase
# This script executes the SQL schema using the Supabase Management API

# Load environment variables
source /home/sherrod/biblical-political-analyzer-v2/.env

# Check if required variables are set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "[ERROR] SUPABASE_SERVICE_ROLE_KEY not found"
    exit 1
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://dmuhzumkxnastwdghdfg.supabase.co}"
PROJECT_REF="dmuhzumkxnastwdghdfg"

echo "========================================================================"
echo "HISTORICAL FAITH TRACKER - SCHEMA EXECUTION"
echo "========================================================================"
echo ""
echo "Supabase URL: $SUPABASE_URL"
echo "Project Ref: $PROJECT_REF"
echo ""

# Function to execute SQL via the Supabase database endpoint
execute_sql() {
    local sql="$1"
    local description="$2"

    echo -n "  [EXECUTING] $description... "

    # Use the Supabase REST API to create an RPC function first
    # Actually, we need to use the Supabase SQL API which requires the Management API key
    # or use the database connection directly via psql

    # For now, let's try using the pg_graphql endpoint or the management API
    response=$(curl -s -X POST \
        "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$sql\"}" \
        2>&1)

    if [[ "$response" == *"error"* ]] || [[ "$response" == *"404"* ]]; then
        echo "FAILED"
        return 1
    else
        echo "OK"
        return 0
    fi
}

# Read the generated SQL file
SQL_FILE="/home/sherrod/biblical-political-analyzer-v2/historical-faith-tracker/supabase/generated_schema.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "[ERROR] SQL file not found: $SQL_FILE"
    echo "Run 'python setup_schema.py' first to generate the SQL file."
    exit 1
fi

echo "SQL File: $SQL_FILE"
echo ""
echo "========================================================================"
echo ""

# Try to execute the full SQL using different methods

# Method 1: Try using supabase CLI if available
if command -v supabase &> /dev/null; then
    echo "[INFO] Supabase CLI found. Attempting to use it..."
    supabase db push --file "$SQL_FILE" 2>&1 || true
fi

# Method 2: Try using psql if available
if command -v psql &> /dev/null; then
    echo "[INFO] psql found. Attempting to connect..."
    # We'd need the database connection string from Supabase dashboard
    # Format: postgresql://postgres:[YOUR-PASSWORD]@db.dmuhzumkxnastwdghdfg.supabase.co:5432/postgres
    echo "[INFO] To use psql, run:"
    echo "  psql 'postgresql://postgres:YOUR_PASSWORD@db.dmuhzumkxnastwdghdfg.supabase.co:5432/postgres' -f '$SQL_FILE'"
fi

echo ""
echo "========================================================================"
echo "ALTERNATIVE EXECUTION METHODS"
echo "========================================================================"
echo ""
echo "Since Supabase REST API doesn't support raw SQL execution,"
echo "please use one of these methods:"
echo ""
echo "1. SUPABASE DASHBOARD (Recommended):"
echo "   a. Go to: https://supabase.com/dashboard/project/dmuhzumkxnastwdghdfg/sql"
echo "   b. Copy the contents of: $SQL_FILE"
echo "   c. Paste into the SQL editor and click 'Run'"
echo ""
echo "2. SUPABASE CLI:"
echo "   supabase link --project-ref $PROJECT_REF"
echo "   supabase db push"
echo ""
echo "3. PSQL (Direct connection):"
echo "   Get connection string from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
echo "   psql 'YOUR_CONNECTION_STRING' -f '$SQL_FILE'"
echo ""
echo "========================================================================"
