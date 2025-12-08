# Historical Faith Tracker - Implementation Plan

## Web Application for Exploring 2,000 Years of Religious History

Last Updated: December 8, 2025

---

## Executive Summary

This implementation plan provides a comprehensive architecture for the Historical Faith Tracker web application. The application will use **Supabase, OpenAI, Mapbox, API.Bible, and Sefaria** to deliver an interactive experience for exploring Christianity and Judaism from 4 BC to 2024 AD.

---

## 1. API USAGE IN APPLICATION

| API | Purpose | Where Used |
|-----|---------|------------|
| **Supabase** | Database + vector search | All data storage and retrieval |
| **OpenAI** | Embeddings for semantic search | `/api/search`, `/api/embed` |
| **Mapbox** | Interactive maps | Map visualization page |
| **API.Bible** | Live Bible text lookup | Scripture explorer, passage display |
| **Sefaria** | Live Jewish text lookup | Scripture explorer, Jewish sources |

---

## 2. DATABASE SCHEMA

### Core Tables (in `supabase/schema.sql`)

```sql
-- ═══════════════════════════════════════════════════════════════════════
-- HISTORICAL FAITH TRACKER - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────────────────────────────────
-- ERAS TABLE - 10 Historical Periods
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE eras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    description TEXT,
    christianity_status TEXT,
    judaism_status TEXT,
    color TEXT, -- For timeline visualization
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- PERSPECTIVES TABLE - 5 Viewpoints
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE perspectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,  -- Orthodox, Catholic, Protestant, Jewish, Academic
    tradition TEXT NOT NULL,
    description TEXT,
    methodology TEXT,
    key_assumptions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- EVENTS TABLE - Historical Events with Embeddings
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    date_precision TEXT DEFAULT 'year', -- exact, year, decade, century
    era_id UUID REFERENCES eras(id),
    event_type TEXT, -- council, persecution, reform, schism, founding, etc.
    traditions_affected TEXT[], -- christianity, judaism, both
    summary TEXT,
    detailed_narrative TEXT,
    significance TEXT,
    scholarly_consensus TEXT DEFAULT 'established', -- established, debated, emerging
    location TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    primary_sources TEXT[],
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- EVENT INTERPRETATIONS - Multi-Perspective Analysis
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE event_interpretations (
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

-- ─────────────────────────────────────────────────────────────────────────
-- FIGURES TABLE - Historical Figures
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE figures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    alternate_names TEXT[],
    birth_year INTEGER,
    death_year INTEGER,
    tradition TEXT,
    roles TEXT[], -- apostle, pope, reformer, rabbi, theologian, etc.
    biography TEXT,
    key_contributions TEXT[],
    controversies TEXT[],
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- MOVEMENTS TABLE - Religious Movements
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE movements (
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

-- ─────────────────────────────────────────────────────────────────────────
-- SCRIPTURE USAGE TABLE - KILLER FEATURE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE scripture_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passage_reference TEXT NOT NULL, -- e.g., "Matthew 16:18"
    passage_text TEXT,
    event_id UUID REFERENCES events(id),
    figure_id UUID REFERENCES figures(id),
    movement_id UUID REFERENCES movements(id),
    usage_year INTEGER,
    usage_era_id UUID REFERENCES eras(id),
    usage_type TEXT, -- justification, proof-text, liturgical, polemic, inspirational
    usage_context TEXT,
    how_used TEXT,
    interpretation_given TEXT,
    faithful_to_original_context TEXT, -- yes, partial, no, debated
    impact_description TEXT,
    perspective_views JSONB, -- {"Orthodox": "...", "Catholic": "...", etc.}
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- PRIMARY SOURCES TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE primary_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    author_figure_id UUID REFERENCES figures(id),
    date_written INTEGER,
    source_type TEXT, -- letter, treatise, history, council_document, etc.
    tradition TEXT,
    url TEXT,
    archive_source TEXT, -- internet_archive, perseus, new_advent, etc.
    content_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- INDEXES FOR PERFORMANCE
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_events_era ON events(era_id);
CREATE INDEX idx_events_year ON events(year_start);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_traditions ON events USING GIN(traditions_affected);
CREATE INDEX idx_scripture_passage ON scripture_usage(passage_reference);
CREATE INDEX idx_scripture_year ON scripture_usage(usage_year);
CREATE INDEX idx_scripture_type ON scripture_usage(usage_type);
CREATE INDEX idx_figures_tradition ON figures(tradition);
CREATE INDEX idx_figures_years ON figures(birth_year, death_year);

-- ─────────────────────────────────────────────────────────────────────────
-- VECTOR SEARCH FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────

-- Search events by semantic similarity
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

-- Search scripture usage by semantic similarity
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

-- Search figures by semantic similarity
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

-- Get all perspectives for an event
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

-- Get scripture usage history for a passage
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

-- Get timeline events for a date range
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

-- ─────────────────────────────────────────────────────────────────────────
-- SEED DATA - Eras
-- ─────────────────────────────────────────────────────────────────────────
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
('Contemporary', 1950, 2024, 'Vatican II, ecumenism, globalization', '#9C27B0');

-- ─────────────────────────────────────────────────────────────────────────
-- SEED DATA - Perspectives
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO perspectives (name, tradition, description, methodology) VALUES
('Eastern Orthodox', 'Christianity', 'The perspective of the Eastern Orthodox churches', 'Emphasis on Holy Tradition, patristic consensus, and liturgical continuity'),
('Roman Catholic', 'Christianity', 'The perspective of the Roman Catholic Church', 'Magisterial interpretation, papal authority, and development of doctrine'),
('Protestant', 'Christianity', 'The perspective of Protestant traditions', 'Sola scriptura, historical-critical methods, and confessional standards'),
('Orthodox Judaism', 'Judaism', 'The perspective of traditional/Orthodox Judaism', 'Halakhic interpretation, Talmudic methodology, and rabbinic authority'),
('Academic/Secular', 'Secular', 'The perspective of secular historical scholarship', 'Historical-critical method, empirical evidence, and neutrality toward theological claims');
```

---

## 3. APPLICATION STRUCTURE

```
historical-faith-tracker/
├── IMPLEMENTATION_PLAN.md          # This file
├── README.md                       # Overview
├── package.json                    # Dependencies
├── next.config.js                  # Next.js config
├── tailwind.config.js              # Tailwind config
├── tsconfig.json                   # TypeScript config
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── loading.tsx             # Global loading
│   │   ├── error.tsx               # Global error
│   │   ├── globals.css             # Global styles
│   │   │
│   │   ├── timeline/
│   │   │   └── page.tsx            # Interactive timeline
│   │   │
│   │   ├── search/
│   │   │   └── page.tsx            # Search interface
│   │   │
│   │   ├── scripture/
│   │   │   └── [reference]/
│   │   │       └── page.tsx        # Scripture usage history
│   │   │
│   │   ├── event/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Event detail
│   │   │
│   │   ├── figure/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Figure profile
│   │   │
│   │   ├── map/
│   │   │   └── page.tsx            # Geographic visualization
│   │   │
│   │   ├── compare/
│   │   │   └── page.tsx            # Perspective comparison
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── search/
│   │       │   └── route.ts        # Semantic search
│   │       ├── timeline/
│   │       │   └── route.ts        # Timeline data
│   │       ├── scripture/
│   │       │   ├── route.ts        # Scripture search
│   │       │   └── [reference]/
│   │       │       └── route.ts    # Passage history
│   │       ├── perspectives/
│   │       │   └── route.ts        # Get perspectives
│   │       ├── embed/
│   │       │   └── route.ts        # Generate embeddings
│   │       └── bible/
│   │           └── route.ts        # Live Bible lookup
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── timeline/
│   │   │   ├── Timeline.tsx            # Main D3 timeline
│   │   │   ├── TimelineEvent.tsx       # Event marker
│   │   │   ├── TimelineControls.tsx    # Zoom/filter
│   │   │   ├── EraBar.tsx              # Era background
│   │   │   └── TimelineFilters.tsx     # Filter panel
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventDetail.tsx
│   │   │   └── EventList.tsx
│   │   │
│   │   ├── perspectives/
│   │   │   ├── PerspectiveCard.tsx
│   │   │   ├── PerspectiveComparison.tsx
│   │   │   ├── AgreementIndicator.tsx
│   │   │   └── SourceCitation.tsx
│   │   │
│   │   ├── scripture/
│   │   │   ├── ScriptureUsageExplorer.tsx  # KILLER FEATURE
│   │   │   ├── ScriptureUsageCard.tsx
│   │   │   ├── ScriptureTimeline.tsx
│   │   │   ├── PassageLookup.tsx
│   │   │   └── InterpretationBadge.tsx
│   │   │
│   │   ├── figures/
│   │   │   ├── FigureProfile.tsx
│   │   │   ├── FigureCard.tsx
│   │   │   └── FigureTimeline.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── MapVisualization.tsx
│   │   │   ├── MapControls.tsx
│   │   │   ├── EventMarker.tsx
│   │   │   └── SpreadAnimation.tsx
│   │   │
│   │   ├── search/
│   │   │   ├── SearchInterface.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   └── SemanticResults.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Tabs.tsx
│   │       ├── Modal.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Skeleton.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   ├── openai.ts               # OpenAI embeddings
│   │   ├── bible-api.ts            # API.Bible integration
│   │   ├── sefaria.ts              # Sefaria integration
│   │   ├── mapbox.ts               # Mapbox config
│   │   ├── utils.ts                # Utilities
│   │   ├── constants.ts            # Constants
│   │   └── database.types.ts       # TypeScript types
│   │
│   ├── hooks/
│   │   ├── useTimeline.ts
│   │   ├── useSearch.ts
│   │   ├── useScriptureUsage.ts
│   │   ├── usePerspectives.ts
│   │   ├── useMap.ts
│   │   └── useDebounce.ts
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── schema.sql                  # Full schema
│   ├── migrations/
│   │   └── 001_initial.sql
│   └── seed/
│       ├── eras.sql
│       └── perspectives.sql
│
└── public/
    ├── icons/
    └── images/
```

---

## 4. KEY COMPONENTS

### 4.1 Timeline Component

**Purpose**: Interactive zoomable timeline from 4 BC to 2024 AD

**Tech**: D3.js for rendering and zoom/pan

```typescript
// src/components/timeline/Timeline.tsx

interface TimelineProps {
  events: Event[];
  eras: Era[];
  onEventClick: (eventId: string) => void;
  filters?: {
    traditions?: string[];
    eventTypes?: string[];
    eraIds?: string[];
  };
}

// Features:
// - Zoomable from full view to decade level
// - Era backgrounds with distinct colors
// - Event markers positioned by year
// - Click to navigate to event detail
// - Filter by tradition, type, era
// - Mobile: horizontal scroll with pinch-to-zoom
```

### 4.2 Scripture Usage Explorer (KILLER FEATURE)

**Purpose**: Track how any Bible passage was used throughout history

```typescript
// src/components/scripture/ScriptureUsageExplorer.tsx

interface ScriptureUsageExplorerProps {
  initialReference?: string;
}

// Features:
// - Search input with Bible reference autocomplete
// - Live passage text from API.Bible/Sefaria
// - Timeline of all historical usages
// - Filter by era, usage type, faithful/misused
// - Cards showing who used it, when, how
// - "Faithful to context" indicator (green/yellow/red)
// - Multi-perspective views on each usage
```

### 4.3 Perspective Comparison

**Purpose**: Side-by-side view of 5 different interpretations

```typescript
// src/components/perspectives/PerspectiveComparison.tsx

interface PerspectiveComparisonProps {
  eventId: string;
  selectedPerspectives?: string[];
}

// Features:
// - 5-column grid (responsive: 2 on tablet, 1 on mobile)
// - Each column: name, tradition, interpretation
// - Highlighted agreements (green) and disagreements (red)
// - Collapsible source citations
// - Toggle to show/hide perspectives
```

### 4.4 Map Visualization

**Purpose**: Geographic spread of Christianity/Judaism

**Tech**: Leaflet + React-Leaflet + Mapbox tiles

```typescript
// src/components/map/MapVisualization.tsx

interface MapVisualizationProps {
  events: MapEvent[];
  mode: 'events' | 'spread' | 'both';
  timeRange?: { start: number; end: number };
}

// Features:
// - Event markers clustered when zoomed out
// - Time slider to animate history
// - Heatmap mode for faith spread
// - Click markers for event popups
// - Layer toggles for Christianity/Judaism
```

---

## 5. API ROUTES

### 5.1 `/api/search/route.ts`

```typescript
// POST - Semantic + full-text search

interface SearchRequest {
  query: string;
  mode: 'text' | 'semantic' | 'hybrid';
  filters?: {
    types?: string[];
    traditions?: string[];
    eras?: string[];
    yearRange?: { start: number; end: number };
  };
  limit?: number;
  offset?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets: {
    types: { type: string; count: number }[];
    eras: { era: string; count: number }[];
  };
}

// Implementation:
// 1. Generate embedding with OpenAI
// 2. Call Supabase search_events(), search_figures(), search_scripture_usage()
// 3. Merge and deduplicate results
// 4. Return with facets for filtering
```

### 5.2 `/api/timeline/route.ts`

```typescript
// GET - Timeline events for date range

// Query params: start, end, traditions, types, page, limit

interface TimelineResponse {
  events: TimelineEvent[];
  eras: Era[];
  total: number;
  bounds: { minYear: number; maxYear: number };
}

// Uses: Supabase get_timeline_events() function
```

### 5.3 `/api/scripture/[reference]/route.ts`

```typescript
// GET - Scripture usage history for a passage

interface ScriptureResponse {
  reference: string;
  passage: {
    text: string;
    version: string;
  };
  usages: ScriptureUsage[];
  summary: {
    byEra: { era: string; count: number }[];
    byType: { type: string; count: number }[];
    faithfulCount: number;
    partialCount: number;
    misusedCount: number;
  };
}

// Uses: API.Bible for text, Supabase for usage history
```

### 5.4 `/api/perspectives/route.ts`

```typescript
// GET - Get all perspectives for an event

// Query params: eventId

interface PerspectivesResponse {
  event: Event;
  interpretations: EventInterpretation[];
  commonGround: string[];
  contested: string[];
}

// Uses: Supabase get_event_perspectives() function
```

### 5.5 `/api/bible/route.ts`

```typescript
// GET - Live Bible text lookup

// Query params: reference, version

interface BibleResponse {
  reference: string;
  text: string;
  version: string;
  copyright?: string;
}

// Uses: API.Bible for Christian texts, Sefaria for Jewish texts
```

---

## 6. LIB FILES

### 6.1 `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 6.2 `src/lib/openai.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}
```

### 6.3 `src/lib/bible-api.ts`

```typescript
const API_BIBLE_KEY = process.env.API_BIBLE_KEY;
const API_BIBLE_URL = process.env.API_BIBLE_URL || 'https://rest.api.bible/v1';

export async function getPassage(reference: string, version = 'KJV') {
  const bibleId = getBibleId(version);
  const passageId = parseReference(reference);

  const response = await fetch(
    `${API_BIBLE_URL}/bibles/${bibleId}/passages/${passageId}`,
    {
      headers: { 'api-key': API_BIBLE_KEY! },
    }
  );
  return response.json();
}

export async function searchBible(query: string, version = 'KJV') {
  const bibleId = getBibleId(version);
  const response = await fetch(
    `${API_BIBLE_URL}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}`,
    {
      headers: { 'api-key': API_BIBLE_KEY! },
    }
  );
  return response.json();
}
```

### 6.4 `src/lib/sefaria.ts`

```typescript
const SEFARIA_BASE_URL = process.env.SEFARIA_BASE_URL || 'https://www.sefaria.org/api';

export async function getText(reference: string) {
  const response = await fetch(`${SEFARIA_BASE_URL}/texts/${encodeURIComponent(reference)}`);
  return response.json();
}

export async function search(query: string) {
  const response = await fetch(
    `${SEFARIA_BASE_URL}/search-wrapper?q=${encodeURIComponent(query)}&type=text`
  );
  return response.json();
}
```

---

## 7. IMPLEMENTATION ORDER

### Phase 1: Foundation (Days 1-3)
1. Set up Next.js App Router structure
2. Configure Supabase client (`src/lib/supabase.ts`)
3. Configure OpenAI client (`src/lib/openai.ts`)
4. Run database schema in Supabase
5. Create TypeScript types (`src/lib/database.types.ts`)
6. Set up Tailwind and base UI components

### Phase 2: Core API Routes (Days 4-6)
7. Build `/api/timeline/route.ts`
8. Build `/api/search/route.ts`
9. Build `/api/embed/route.ts`
10. Build `/api/perspectives/route.ts`

### Phase 3: Timeline Feature (Days 7-10)
11. Build Timeline component with D3.js
12. Build TimelineControls and TimelineFilters
13. Create `/timeline` page
14. Test with sample data

### Phase 4: Scripture Usage Feature (Days 11-15)
15. Build Bible API integration (`src/lib/bible-api.ts`)
16. Build Sefaria integration (`src/lib/sefaria.ts`)
17. Build `/api/scripture/route.ts`
18. Build ScriptureUsageExplorer component
19. Create `/scripture/[reference]` page

### Phase 5: Perspectives & Events (Days 16-19)
20. Build PerspectiveComparison component
21. Build EventCard and EventDetail components
22. Create `/event/[id]` page
23. Create `/figure/[id]` page
24. Create `/compare` page

### Phase 6: Map Visualization (Days 20-22)
25. Configure Mapbox/Leaflet
26. Build MapVisualization component
27. Build SpreadAnimation component
28. Create `/map` page

### Phase 7: Search & Home (Days 23-25)
29. Build SearchInterface component
30. Create `/search` page
31. Create home page with featured content
32. Build navigation and layout

### Phase 8: Polish (Days 26-28)
33. Loading states and skeletons
34. Error handling
35. Mobile responsiveness
36. Performance optimization
37. Accessibility

---

## 8. DATA FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │Timeline │ │ Search  │ │Scripture│ │  Event  │ │   Map   │       │
│  │  View   │ │Interface│ │ Usage   │ │ Detail  │ │  View   │       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
└───────┼──────────┼──────────┼──────────┼──────────┼─────────────────┘
        │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT HOOKS (Client State)                        │
│  useTimeline  useSearch  useScriptureUsage  usePerspectives  useMap │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                            │
│  /api/timeline  /api/search  /api/scripture  /api/perspectives      │
│  /api/embed     /api/bible                                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase    │    │     OpenAI      │    │  External APIs  │
│  (PostgreSQL  │    │   Embeddings    │    │  - API.Bible    │
│   + pgvector) │    │                 │    │  - Sefaria      │
└───────────────┘    └─────────────────┘    │  - Mapbox       │
                                            └─────────────────┘
```

---

## 9. ENVIRONMENT VARIABLES

```bash
# Required in .env.local (copy from parent .env)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dmuhzumkxnastwdghdfg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_key>

# OpenAI
OPENAI_API_KEY=<key>

# Bible APIs
API_BIBLE_KEY=<key>
API_BIBLE_URL=https://rest.api.bible/v1
SEFARIA_BASE_URL=https://www.sefaria.org/api

# Maps
MAPBOX_API_KEY=<key>
```

---

## Ready to Begin

This plan provides a comprehensive architecture for the Historical Faith Tracker web application. The database schema is designed for the Scripture Usage feature (killer feature), and all components integrate with the configured APIs.

**Next Step**: Run the database schema in Supabase SQL Editor.
