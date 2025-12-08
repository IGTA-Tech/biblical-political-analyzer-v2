# API Keys Reference Guide

Ready-to-use reference for setting up all APIs needed for the Historical Faith project.

## API Keys Checklist

### Tier 1: Essential (Get First)

| # | API Service | Cost | Status | Priority |
|---|------------|------|--------|----------|
| 1 | OpenAI | ~$20-50 | [ ] To Get | Essential |
| 2 | Supabase | FREE-$25/mo | [ ] To Get | Essential |
| 3 | API.Bible | FREE | [ ] To Get | Essential |
| 4 | Sefaria | FREE | No Key Needed | Essential |

### Tier 2: High Priority

| # | API Service | Cost | Status | Priority |
|---|------------|------|--------|----------|
| 5 | Internet Archive | FREE | [ ] To Get | High |
| 6 | Semantic Scholar | FREE | [ ] To Get | High |
| 7 | CORE | FREE | [ ] To Get | High |
| 8 | OpenAlex | FREE | No Key Needed | High |
| 9 | Firecrawl | FREE-$19/mo | [ ] To Get | High |
| 10 | Jina AI Reader | FREE | [ ] To Get | High |

### Tier 3: Medium Priority

| # | API Service | Cost | Status | Priority |
|---|------------|------|--------|----------|
| 11 | Mapbox | FREE | [ ] To Get | Medium |
| 12 | Google Cloud Vision | FREE tier | [ ] To Get | Medium |

### No Key Needed

| # | Service | Notes |
|---|---------|-------|
| 13 | Perseus Digital Library | Direct URL access |
| 14 | New Advent (Church Fathers) | Direct scraping |
| 15 | CCEL (Christian Classics) | Direct access |
| 16 | Leaflet + OpenStreetMap | npm install |
| 17 | TimelineJS | npm/CDN |
| 18 | Tesseract | npm install |

---

## Detailed Setup Instructions

### 1. OpenAI API (Essential)

**URL:** https://platform.openai.com/

**Purpose:** Text embeddings for semantic search

**Steps:**
1. Go to https://platform.openai.com/signup
2. Create account or sign in
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Name it: "Historical-Faith-Project"
6. Copy and save immediately (shown only once)

**Key Format:** `sk-proj-xxxxxxxxxxxxxxxxxxxx`

**Cost:** ~$0.02 per 1M tokens (very cheap), $5 free credits for new accounts

---

### 2. Supabase (Essential)

**URL:** https://supabase.com/

**Purpose:** PostgreSQL database with vector search (pgvector)

**Steps:**
1. Go to https://supabase.com/dashboard
2. Sign up with GitHub or email
3. Create new project named "historical-faith-tracker"
4. Set database password (SAVE THIS)
5. Wait 2-3 minutes for setup
6. Go to Settings > API
7. Copy: Project URL, anon key, service_role key

**Key Format:**
- URL: `https://xxxxxxxxxxxx.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Service Role: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Cost:** FREE (500MB), Pro $25/mo (8GB)

---

### 3. API.Bible (Essential)

**URL:** https://scripture.api.bible/

**Purpose:** Access to 2,500+ Bible versions, multiple languages

**Steps:**
1. Go to https://scripture.api.bible/signup
2. Create free account
3. Create new application
4. Get API key from dashboard

**Key Format:** 36-character string

**Cost:** FREE (5,000 calls/day)

---

### 4. Sefaria (Essential - No Key Needed)

**URL:** https://www.sefaria.org/developers

**Purpose:** Complete Jewish texts library (Torah, Talmud, commentaries)

**Steps:**
1. No API key required!
2. Just use the endpoints directly
3. Be respectful of rate limits

**Base URL:** `https://www.sefaria.org/api/`

**Example Requests:**
- Get text: `/api/texts/Genesis.1`
- Search: `/api/search?q=messiah`

---

### 5. Internet Archive (High Priority)

**URL:** https://archive.org/account/s3.php

**Purpose:** Access to public domain historical texts, Church Fathers, manuscripts

**Steps:**
1. Go to https://archive.org/account/login
2. Create free account
3. Go to https://archive.org/account/s3.php
4. Generate S3-like access keys
5. You'll get: Access Key + Secret Key

**Key Format:**
- Access Key: `xxxxxxxxxxxxxxxxxxxx`
- Secret Key: `xxxxxxxxxxxxxxxxxxxx`

**Cost:** FREE

---

### 6. Semantic Scholar (High Priority)

**URL:** https://www.semanticscholar.org/product/api

**Purpose:** AI-powered academic paper search

**Steps:**
1. Go to https://www.semanticscholar.org/product/api
2. Click "Request API Key"
3. Fill out form (academic/research use)
4. Receive key via email (usually same day)

**Key Format:** 40-character string

**Cost:** FREE (1 request/second with key)

---

### 7. CORE (High Priority)

**URL:** https://core.ac.uk/services/api

**Purpose:** Open access research papers aggregator

**Steps:**
1. Go to https://core.ac.uk/register
2. Create free account
3. Go to https://core.ac.uk/services/api
4. Request API key
5. Receive via email

**Cost:** FREE

---

### 8. OpenAlex (High Priority - No Key Needed)

**URL:** https://openalex.org/

**Purpose:** Academic paper metadata, citations, scholarly sources

**Steps:**
1. No signup required for basic use
2. For polite pool (faster): just add email to requests
3. Add to your API calls: `?mailto=your@email.com`

**Example Request:**
```
https://api.openalex.org/works?search=reformation+history&mailto=your@email.com
```

**Cost:** FREE (100,000 requests/day)

---

### 9. Firecrawl (High Priority)

**URL:** https://www.firecrawl.dev/

**Purpose:** Web scraping with clean markdown output

**Steps:**
1. Go to https://www.firecrawl.dev/
2. Sign up for free account
3. Get API key from dashboard

**Key Format:** `fc-xxxxxxxxxxxxxxxxxxxx`

**Cost:** FREE (500 credits/month), $19/mo (3,000 credits)

---

### 10. Jina AI Reader (High Priority)

**URL:** https://jina.ai/reader/

**Purpose:** Convert any URL to clean readable text

**Steps:**
1. Basic use: No key needed (prepend r.jina.ai/)
2. For API access: https://jina.ai/reader/
3. Sign up for higher limits

**Usage (no key):**
```
https://r.jina.ai/https://example.com
```

**Cost:** FREE tier available

---

### 11. Mapbox (Medium Priority)

**URL:** https://www.mapbox.com/

**Purpose:** Interactive maps for geographic spread visualization

**Steps:**
1. Go to https://account.mapbox.com/auth/signup/
2. Create free account
3. Go to https://account.mapbox.com/access-tokens/
4. Copy default public token or create new one

**Key Format:** `pk.eyJ1Ijoixxxxxxxxx...`

**Cost:** FREE (50,000 map loads/month)

---

### 12. Google Cloud Vision (Medium Priority)

**URL:** https://cloud.google.com/vision

**Purpose:** OCR for historical documents and manuscripts

**Steps:**
1. Go to https://console.cloud.google.com/
2. Create account (requires credit card, but won't charge for free tier)
3. Create new project
4. Enable Cloud Vision API
5. Create credentials > API key

**Key Format:** `AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx`

**Cost:** FREE (1,000 images/month)

---

## Free Resources (No Keys Needed)

### Perseus Digital Library
- **URL:** http://www.perseus.tufts.edu/hopper/
- **Content:** Classical texts (Greek/Latin), early Christian writings, Josephus
- **Access:** Direct URL or XML downloads

### New Advent
- **URL:** https://www.newadvent.org/fathers/
- **Content:** Complete Church Fathers
- **Format:** HTML (scrapeable)

### CCEL (Christian Classics Ethereal Library)
- **URL:** https://www.ccel.org/
- **Content:** Christian classics, theology
- **Format:** HTML, some downloads

### Early Christian Writings
- **URL:** https://www.earlychristianwritings.com/
- **Content:** First 3 centuries texts
- **Format:** HTML

---

## Environment Variables Template

Copy this to your `.env` file:

```bash
# ═══════════════════════════════════════════════════════════════════════
# HISTORICAL FAITH PROJECT - ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════════════

# AI & CONTENT GENERATION
OPENAI_API_KEY=sk-proj-your-key-here

# DATABASE
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# RELIGIOUS TEXT APIs
API_BIBLE_KEY=your-key-here
SEFARIA_BASE_URL=https://www.sefaria.org/api

# SCHOLARLY & RESEARCH APIs
SEMANTIC_SCHOLAR_API_KEY=your-key-here
CORE_API_KEY=your-key-here
OPENALEX_EMAIL=your@email.com

# INTERNET ARCHIVE
INTERNET_ARCHIVE_ACCESS_KEY=your-access-key
INTERNET_ARCHIVE_SECRET_KEY=your-secret-key

# WEB SCRAPING & EXTRACTION
FIRECRAWL_API_KEY=fc-your-key-here
JINA_API_KEY=jina_your-key-here

# MAPS & VISUALIZATION
MAPBOX_API_KEY=pk.your-key-here

# OCR & DOCUMENT PROCESSING
GOOGLE_CLOUD_VISION_API_KEY=AIzaSy-your-key-here

# FREE RESOURCES (No Keys Needed - Just URLs)
PERSEUS_BASE_URL=http://www.perseus.tufts.edu/hopper/
NEW_ADVENT_BASE_URL=https://www.newadvent.org/fathers/
CCEL_BASE_URL=https://www.ccel.org/
JINA_READER_PREFIX=https://r.jina.ai/
```

---

## Estimated Costs

### One-Time Setup
- OpenAI: $20-50 (embeddings)
- Everything else: FREE
- **TOTAL: $20-50**

### Monthly (Production)
- Supabase Pro: $25 (if needed, free tier may suffice)
- API usage: $10-20
- **TOTAL: $35-45/month**
