# API Keys Progress - Historical Faith Tracker

Last Updated: December 8, 2025

## Completed API Keys

| API | Status | Notes |
|-----|--------|-------|
| **OpenAI** | ✅ WORKING | For embeddings |
| **Supabase** | ✅ WORKING | Project: `dmuhzumkxnastwdghdfg.supabase.co` |
| **API.Bible** | ✅ WORKING | Endpoint: `https://rest.api.bible/v1` |
| **Internet Archive** | ✅ WORKING | S3 keys configured |
| **Sefaria** | ✅ WORKING | No key needed - free API |
| **OpenAlex** | ✅ WORKING | No key needed - free API |
| **Jina Reader** | ✅ WORKING | No key needed - use `r.jina.ai/` prefix |

## Pending API Keys

| API | Status | URL |
|-----|--------|-----|
| **Semantic Scholar** | ⏳ REQUESTED | Waiting for email |
| **Firecrawl** | 🔲 TO GET | https://www.firecrawl.dev/ |
| **CORE** | 🔲 TO GET | https://core.ac.uk/services/api |
| **Mapbox** | 🔲 TO GET | https://account.mapbox.com/ |
| **Google Cloud Vision** | 🔲 TO GET | https://console.cloud.google.com/ |

## Environment Variables Set

The following are configured in `.env`:

```
# WORKING
OPENAI_API_KEY=sk-proj-... (set)
NEXT_PUBLIC_SUPABASE_URL=https://dmuhzumkxnastwdghdfg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(set)
SUPABASE_SERVICE_ROLE_KEY=(set)
API_BIBLE_KEY=(set)
API_BIBLE_URL=https://rest.api.bible/v1
INTERNET_ARCHIVE_ACCESS_KEY=(set)
INTERNET_ARCHIVE_SECRET_KEY=(set)
SEFARIA_BASE_URL=https://www.sefaria.org/api

# STILL NEED
SEMANTIC_SCHOLAR_API_KEY=pending
FIRECRAWL_API_KEY=need to get
CORE_API_KEY=need to get
MAPBOX_API_KEY=need to get
```

## Free Resources (No Keys Needed)

- Perseus Digital Library: http://www.perseus.tufts.edu/hopper/
- New Advent (Church Fathers): https://www.newadvent.org/fathers/
- CCEL: https://www.ccel.org/
- Early Christian Writings: https://www.earlychristianwritings.com/
- Jina Reader: https://r.jina.ai/{url}

## Next Steps

1. Get Firecrawl API key from https://www.firecrawl.dev/
2. Check email for Semantic Scholar API key
3. Get remaining optional keys (Mapbox, CORE, etc.)
4. Begin building content generation scripts

## Database Status

Supabase database has existing tables:
- `biblical_passages` (with embeddings)
- `historical_context`
- `historical_parallels`
- `original_language`
- `project_2025_policies`
- `analysis_results`
- `citizen_stories`
- `news_cache`

May need to add new tables for Historical Faith Tracker:
- `eras`
- `events`
- `figures`
- `movements`
- `scripture_usage`
- `perspectives`
