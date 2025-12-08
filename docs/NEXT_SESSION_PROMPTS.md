# Next Session Prompts - Historical Faith Project

Use these prompts in Claude Code to continue building the project.

---

## PROMPT 1: Historical Faith Narrative (Content Generation)

```
# ═══════════════════════════════════════════════════════════════════════════════
# HISTORICAL FAITH NARRATIVE - Content Generation System
# ═══════════════════════════════════════════════════════════════════════════════

## PROJECT CONTEXT

I'm building the content generation system for the Historical Faith Tracker.
This creates the historical narrative document covering 4 BC to 2024 AD.

Location: /home/sherrod/biblical-political-analyzer-v2/historical-faith-narrative/

## AVAILABLE APIs (All Configured & Working)

### Content & AI
- **OpenAI** - text-embedding-3-small for embeddings
- **Perplexity** - Research queries and fact-finding

### Religious Texts
- **API.Bible** - 2,500+ Bible versions (https://rest.api.bible/v1)
- **Sefaria** - Jewish texts: Torah, Talmud, commentaries (https://www.sefaria.org/api)

### Scholarly Sources
- **Semantic Scholar** - Academic papers (1 req/sec limit)
- **CORE** - Open access research papers
- **OpenAlex** - Scholarly metadata (free, no key)

### Historical Sources
- **Internet Archive** - Church Fathers, historical texts, manuscripts
- **Perseus Digital Library** - Classical texts, Josephus (free)
- **New Advent** - Church Fathers collection (free)
- **CCEL** - Christian Classics (free)
- **Early Christian Writings** - First 3 centuries (free)

### Web & OCR
- **Firecrawl** - Web scraping to markdown
- **Jina Reader** - URL to text (https://r.jina.ai/{url})
- **Google Cloud Vision** - OCR for manuscript images

## TASK

Build the content generation pipeline:

1. Create research scripts in `scripts/research/`
   - Query Perplexity for historical facts
   - Search Semantic Scholar for academic sources
   - Fetch from Internet Archive

2. Create generation scripts in `scripts/generation/`
   - Generate era-by-era content
   - Multi-perspective narratives (Orthodox, Catholic, Protestant, Jewish, Academic)
   - Scripture usage tracking

3. Create verification scripts in `scripts/verification/`
   - Cross-reference sources
   - Fact-check claims

4. Output structure in `content/` and `data/`
   - Markdown narratives by era
   - JSON structured data for database

## ERAS TO COVER

1. Apostolic Era (4 BC - 100 AD)
2. Ante-Nicene Period (100 - 325 AD)
3. Post-Nicene/Byzantine (325 - 600 AD)
4. Early Medieval (600 - 1000 AD)
5. High Medieval (1000 - 1300 AD)
6. Late Medieval/Pre-Reformation (1300 - 1517 AD)
7. Reformation (1517 - 1648 AD)
8. Post-Reformation (1648 - 1800 AD)
9. Modern Era (1800 - 1950 AD)
10. Contemporary (1950 - 2024 AD)

## START WITH

Create a Python script that:
1. Uses Perplexity to research a historical era
2. Fetches relevant texts from Sefaria and API.Bible
3. Searches Semantic Scholar for academic sources
4. Outputs structured markdown + JSON

Begin with Era 1: Apostolic Era (4 BC - 100 AD)
```

---

## PROMPT 2: Historical Faith Tracker (Application)

```
# ═══════════════════════════════════════════════════════════════════════════════
# HISTORICAL FAITH TRACKER - Web Application
# ═══════════════════════════════════════════════════════════════════════════════

## PROJECT CONTEXT

I'm building the web application for exploring 2,000 years of religious history.
This is the user-facing tool with timeline, search, maps, and comparisons.

Location: /home/sherrod/biblical-political-analyzer-v2/historical-faith-tracker/

## AVAILABLE APIs (All Configured & Working)

### Database
- **Supabase** - PostgreSQL with pgvector for embeddings
  - URL: https://dmuhzumkxnastwdghdfg.supabase.co
  - Existing tables: biblical_passages, historical_context, historical_parallels, etc.

### AI & Search
- **OpenAI** - Embeddings for semantic search

### Maps & Visualization
- **Mapbox** - Interactive maps for geographic spread

### Religious Texts (for live queries)
- **API.Bible** - Bible text lookups
- **Sefaria** - Jewish text lookups

## TECH STACK

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + pgvector)
- D3.js / TimelineJS (visualizations)
- Mapbox / Leaflet (maps)

## TASK

Build the application:

1. Set up database schema in `supabase/schema.sql`
   - eras, events, figures, movements
   - scripture_usage (killer feature)
   - perspectives, event_interpretations
   - Vector embeddings for semantic search

2. Build Next.js app in `src/`
   - Timeline view (zoomable 4 BC - 2024 AD)
   - Search interface (full-text + semantic)
   - Perspective comparison engine
   - Scripture usage explorer
   - Map visualization

3. Create API routes
   - /api/search - Semantic search
   - /api/timeline - Get events by era
   - /api/scripture - Scripture usage lookup
   - /api/perspectives - Multi-view comparisons

## KEY FEATURES

1. **Timeline View**
   - Zoomable from 4 BC to 2024 AD
   - Filter by tradition, event type, region
   - Click events for details

2. **Scripture Usage Tracker** (Killer Feature)
   - Search any passage to see how it was used throughout history
   - Filter by era, purpose, tradition
   - See faithful vs. misused interpretations

3. **Perspective Comparison**
   - Side-by-side Orthodox, Catholic, Protestant, Jewish, Academic views
   - Areas of agreement/disagreement highlighted

4. **Geographic Visualization**
   - Spread of Christianity/Judaism on maps
   - Animated history of faith movements

## START WITH

1. Run the existing database schema or create new tables
2. Set up the Next.js app structure
3. Create the timeline component
4. Implement basic search functionality
```

---

## Quick Reference: All API Keys Location

All keys are in: `/home/sherrod/biblical-political-analyzer-v2/.env`

| API | Env Variable |
|-----|--------------|
| OpenAI | `OPENAI_API_KEY` |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| API.Bible | `API_BIBLE_KEY`, `API_BIBLE_URL` |
| Sefaria | `SEFARIA_BASE_URL` |
| Perplexity | `PERPLEXITY_API_KEY` |
| Semantic Scholar | `SEMANTIC_SCHOLAR_API_KEY` |
| CORE | `CORE_API_KEY` |
| Internet Archive | `INTERNET_ARCHIVE_ACCESS_KEY`, `INTERNET_ARCHIVE_SECRET_KEY` |
| Firecrawl | `FIRECRAWL_API_KEY` |
| Jina Reader | `JINA_READER_PREFIX` |
| Mapbox | `MAPBOX_API_KEY` |
| Google Cloud Vision | `GOOGLE_CLOUD_VISION_API_KEY` |

---

## GitHub Repository

https://github.com/IGTA-Tech/biblical-political-analyzer-v2

---

## Folder Structure Reminder

```
biblical-political-analyzer-v2/
├── historical-faith-narrative/    # PROMPT 1 - Content Generation
│   ├── scripts/
│   │   ├── research/
│   │   ├── generation/
│   │   ├── verification/
│   │   └── ingestion/
│   ├── sources/
│   ├── content/
│   ├── data/
│   └── output/
│
├── historical-faith-tracker/      # PROMPT 2 - Web Application
│   ├── src/
│   ├── supabase/
│   └── public/
│
└── docs/                          # Documentation
    ├── API_KEYS_GUIDE.md
    ├── API_KEYS_PROGRESS.md
    └── NEXT_SESSION_PROMPTS.md    # This file
```
