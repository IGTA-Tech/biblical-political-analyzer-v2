-- ═══════════════════════════════════════════════════════════════════════
-- HISTORICAL FAITH TRACKER - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to create all tables
-- ═══════════════════════════════════════════════════════════════════════

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────────────────────────────────
-- ERAS TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE eras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default eras
INSERT INTO eras (name, start_year, end_year, description) VALUES
('Second Temple & Early Church', -4, 100, 'From Jesus birth through apostolic age'),
('Apostolic Fathers & Rabbinic Judaism', 100, 325, 'Church Fathers, formation of rabbinic tradition'),
('Constantine & Councils', 325, 500, 'Christianization of Rome, ecumenical councils'),
('Early Medieval', 500, 1000, 'Fall of Rome, rise of Islam, Byzantine era'),
('High Middle Ages', 1000, 1300, 'Crusades, scholasticism, Jewish golden age in Spain'),
('Late Medieval & Pre-Reformation', 1300, 1500, 'Black Death, Jewish expulsions, early reform movements'),
('Reformation', 1500, 1600, 'Protestant Reformation, Catholic Counter-Reformation'),
('Post-Reformation & Enlightenment', 1600, 1800, 'Religious wars, Enlightenment, Haskalah'),
('Modern Era', 1800, 1950, 'Emancipation, denominations, Holocaust'),
('Contemporary', 1950, 2024, 'State of Israel, ecumenism, religious pluralism');

-- ─────────────────────────────────────────────────────────────────────────
-- PERSPECTIVES TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE perspectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tradition TEXT NOT NULL,
    description TEXT,
    methodology TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default perspectives
INSERT INTO perspectives (name, tradition, description, methodology) VALUES
('Eastern Orthodox', 'Christianity', 'Orthodox Christian perspective emphasizing tradition, councils, and patristic interpretation', 'Tradition-based, patristic authority'),
('Roman Catholic', 'Christianity', 'Catholic perspective with papal authority and magisterial teaching', 'Magisterium, Sacred Tradition, Scripture'),
('Protestant', 'Christianity', 'Protestant perspective emphasizing sola scriptura and reformation principles', 'Scripture alone, personal interpretation'),
('Orthodox Judaism', 'Judaism', 'Traditional Jewish perspective based on Torah and Talmud', 'Halakhic interpretation, rabbinic authority'),
('Academic/Historical', 'Secular', 'Scholarly perspective using historical-critical methods', 'Historical criticism, evidence-based analysis');

-- ─────────────────────────────────────────────────────────────────────────
-- EVENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date_start DATE,
    date_end DATE,
    year_start INTEGER,
    year_end INTEGER,
    date_precision TEXT DEFAULT 'year', -- exact, year, decade, century
    era_id UUID REFERENCES eras(id),
    event_type TEXT, -- council, persecution, reform, schism, war, founding, etc.
    traditions_affected TEXT[], -- christianity, judaism, both
    summary TEXT,
    detailed_narrative TEXT,
    significance TEXT,
    scholarly_consensus TEXT DEFAULT 'established', -- established, debated, emerging
    location TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- EVENT INTERPRETATIONS TABLE
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- FIGURES TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE figures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    alternate_names TEXT[],
    birth_year INTEGER,
    death_year INTEGER,
    tradition TEXT, -- christianity, judaism, both, secular
    roles TEXT[], -- apostle, bishop, rabbi, reformer, scholar, etc.
    biography TEXT,
    key_contributions TEXT[],
    controversies TEXT[],
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- MOVEMENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tradition TEXT, -- christianity, judaism
    start_year INTEGER,
    end_year INTEGER, -- NULL if ongoing
    description TEXT,
    core_beliefs TEXT[],
    key_figures UUID[], -- references figures
    parent_movement_id UUID REFERENCES movements(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- SCRIPTURE USAGE TABLE (Key Feature)
-- ─────────────────────────────────────────────────────────────────────────
-- Tracks how biblical passages were used throughout history
CREATE TABLE scripture_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passage_reference TEXT NOT NULL, -- e.g., "Matthew 16:18", "Isaiah 53:1-12"
    passage_text TEXT, -- actual text of the passage
    event_id UUID REFERENCES events(id),
    figure_id UUID REFERENCES figures(id),
    movement_id UUID REFERENCES movements(id),
    usage_year INTEGER,
    usage_era_id UUID REFERENCES eras(id),
    usage_type TEXT, -- justification, proof-text, liturgical, polemic, inspirational
    usage_context TEXT, -- what was happening when this was used
    how_used TEXT, -- detailed description of how the passage was applied
    interpretation_given TEXT, -- the interpretation offered at the time
    faithful_to_original_context TEXT, -- scholarly assessment: yes, partial, no, debated
    impact_description TEXT, -- what resulted from this usage
    perspective_views JSONB, -- {"orthodox": "...", "catholic": "...", etc.}
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
    date_precision TEXT DEFAULT 'year',
    source_type TEXT, -- letter, treatise, chronicle, sermon, decree, etc.
    tradition TEXT,
    url TEXT, -- link to digital version
    archive_source TEXT, -- Internet Archive ID, etc.
    content_summary TEXT,
    full_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- RELATIONSHIPS TABLE (for complex connections)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL, -- event, figure, movement
    source_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    relationship_type TEXT, -- caused, influenced, opposed, continued, etc.
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- INDEXES FOR PERFORMANCE
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_events_era ON events(era_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_year ON events(year_start);
CREATE INDEX idx_events_traditions ON events USING GIN(traditions_affected);
CREATE INDEX idx_scripture_passage ON scripture_usage(passage_reference);
CREATE INDEX idx_scripture_year ON scripture_usage(usage_year);
CREATE INDEX idx_scripture_type ON scripture_usage(usage_type);
CREATE INDEX idx_figures_tradition ON figures(tradition);
CREATE INDEX idx_figures_years ON figures(birth_year, death_year);
CREATE INDEX idx_movements_tradition ON movements(tradition);
CREATE INDEX idx_interpretations_event ON event_interpretations(event_id);
CREATE INDEX idx_interpretations_perspective ON event_interpretations(perspective_id);

-- Vector indexes for semantic search
CREATE INDEX idx_events_embedding ON events USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_figures_embedding ON figures USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_scripture_embedding ON scripture_usage USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

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

-- Get all interpretations for an event
CREATE OR REPLACE FUNCTION get_event_perspectives(event_uuid UUID)
RETURNS TABLE (
    perspective_name TEXT,
    tradition TEXT,
    interpretation TEXT,
    key_points TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.name,
        p.tradition,
        ei.interpretation,
        ei.key_points
    FROM event_interpretations ei
    JOIN perspectives p ON ei.perspective_id = p.id
    WHERE ei.event_id = event_uuid
    ORDER BY p.tradition, p.name;
END;
$$;

-- Get scripture usage history for a passage
CREATE OR REPLACE FUNCTION get_passage_history(passage TEXT)
RETURNS TABLE (
    usage_year INTEGER,
    usage_type TEXT,
    how_used TEXT,
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
        e.title,
        f.name
    FROM scripture_usage su
    LEFT JOIN events e ON su.event_id = e.id
    LEFT JOIN figures f ON su.figure_id = f.id
    WHERE su.passage_reference ILIKE '%' || passage || '%'
    ORDER BY su.usage_year;
END;
$$;
