# API Keys Progress - Historical Faith Tracker

Last Updated: December 8, 2025

## ✅ ALL API KEYS COMPLETE!

| API | Status | Notes |
|-----|--------|-------|
| **OpenAI** | ✅ WORKING | For embeddings |
| **Supabase** | ✅ WORKING | Project: `dmuhzumkxnastwdghdfg.supabase.co` |
| **API.Bible** | ✅ WORKING | Endpoint: `https://rest.api.bible/v1` |
| **Internet Archive** | ✅ WORKING | S3 keys configured |
| **Perplexity** | ✅ WORKING | For research queries |
| **Firecrawl** | ✅ WORKING | Web scraping |
| **CORE** | ✅ WORKING | Open access papers |
| **Semantic Scholar** | ✅ WORKING | Academic papers (1 req/sec limit) |
| **Mapbox** | ✅ WORKING | Maps & visualization |
| **Google Cloud Vision** | ✅ WORKING | OCR for manuscripts |
| **Sefaria** | ✅ WORKING | No key needed - free API |
| **OpenAlex** | ✅ WORKING | No key needed - free API |
| **Jina Reader** | ✅ WORKING | No key needed - use `r.jina.ai/` prefix |

## Environment Variables Set

All keys configured in `.env`:

```
# AI & CONTENT GENERATION
OPENAI_API_KEY=(set)
PERPLEXITY_API_KEY=(set)

# DATABASE
NEXT_PUBLIC_SUPABASE_URL=https://dmuhzumkxnastwdghdfg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(set)
SUPABASE_SERVICE_ROLE_KEY=(set)

# RELIGIOUS TEXT APIs
API_BIBLE_KEY=(set)
API_BIBLE_URL=https://rest.api.bible/v1
SEFARIA_BASE_URL=https://www.sefaria.org/api

# SCHOLARLY & RESEARCH APIs
SEMANTIC_SCHOLAR_API_KEY=(set)
CORE_API_KEY=(set)

# INTERNET ARCHIVE
INTERNET_ARCHIVE_ACCESS_KEY=(set)
INTERNET_ARCHIVE_SECRET_KEY=(set)

# WEB SCRAPING
FIRECRAWL_API_KEY=(set)
JINA_READER_PREFIX=https://r.jina.ai/

# MAPS & VISUALIZATION
MAPBOX_API_KEY=(set)

# OCR & DOCUMENT PROCESSING
GOOGLE_CLOUD_VISION_API_KEY=(set)
```

## Free Resources (No Keys Needed)

- Perseus Digital Library: http://www.perseus.tufts.edu/hopper/
- New Advent (Church Fathers): https://www.newadvent.org/fathers/
- CCEL: https://www.ccel.org/
- Early Christian Writings: https://www.earlychristianwritings.com/
- Jina Reader: https://r.jina.ai/{url}
- OpenAlex: https://api.openalex.org/ (add ?mailto=email for polite pool)

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

## Next Steps

1. ✅ All API keys configured
2. Begin building content generation scripts
3. Create Historical Faith Tracker database schema
4. Start generating historical narrative content
