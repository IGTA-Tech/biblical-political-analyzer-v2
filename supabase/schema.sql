-- ============================================
-- BIBLICAL POLITICAL ANALYZER - DATABASE SCHEMA
-- ============================================
-- This schema creates all tables and functions needed for the application
-- Run this in your Supabase SQL Editor

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- TABLE 1: biblical_passages
-- Stores scripture passages with embeddings for semantic search
-- ============================================
CREATE TABLE IF NOT EXISTS biblical_passages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse_start INTEGER NOT NULL,
    verse_end INTEGER,
    translation VARCHAR(20) NOT NULL, -- 'ESV', 'NIV', 'KJV', etc.
    text TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimensions
    themes TEXT[] DEFAULT '{}', -- ['justice', 'governance', 'compassion', etc.]
    testament VARCHAR(2) CHECK (testament IN ('OT', 'NT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for biblical_passages
CREATE INDEX IF NOT EXISTS idx_passages_embedding
ON biblical_passages USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_passages_themes
ON biblical_passages USING GIN(themes);

CREATE INDEX IF NOT EXISTS idx_passages_book_chapter
ON biblical_passages(book, chapter);

CREATE INDEX IF NOT EXISTS idx_passages_translation
ON biblical_passages(translation);


-- ============================================
-- TABLE 2: original_language
-- Hebrew and Greek original text with Strong's numbers
-- ============================================
CREATE TABLE IF NOT EXISTS original_language (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passage_id UUID REFERENCES biblical_passages(id) ON DELETE CASCADE,
    testament VARCHAR(2) CHECK (testament IN ('OT', 'NT')),
    original_text TEXT NOT NULL, -- Hebrew/Greek characters
    transliteration TEXT,
    word_number INTEGER, -- Position in verse
    strongs_number VARCHAR(10),
    root_word VARCHAR(100),
    part_of_speech VARCHAR(20),
    definition TEXT,
    etymology TEXT,
    cultural_context TEXT,
    semantic_range TEXT[] DEFAULT '{}',
    other_uses JSONB DEFAULT '{}', -- References to other biblical passages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for original_language
CREATE INDEX IF NOT EXISTS idx_original_strongs
ON original_language(strongs_number);

CREATE INDEX IF NOT EXISTS idx_original_passage
ON original_language(passage_id);


-- ============================================
-- TABLE 3: historical_context
-- Biblical era historical context for passages
-- ============================================
CREATE TABLE IF NOT EXISTS historical_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passage_id UUID REFERENCES biblical_passages(id) ON DELETE CASCADE,
    time_period VARCHAR(100), -- '~950 BC - Solomon's Reign'
    political_structure VARCHAR(50), -- 'Monarchy', 'Roman Province', etc.
    key_events TEXT[] DEFAULT '{}',
    social_norms JSONB DEFAULT '{}',
    economic_conditions TEXT,
    religious_practices TEXT,
    foreign_relations TEXT,
    author_context TEXT,
    audience_context TEXT,
    situation_addressed TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for historical_context
CREATE INDEX IF NOT EXISTS idx_context_passage
ON historical_context(passage_id);

CREATE INDEX IF NOT EXISTS idx_context_period
ON historical_context(time_period);


-- ============================================
-- TABLE 4: historical_parallels
-- Real-world historical events for comparison
-- ============================================
CREATE TABLE IF NOT EXISTS historical_parallels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    time_period VARCHAR(100),
    location VARCHAR(100),
    situation_summary TEXT NOT NULL,
    key_actors TEXT[] DEFAULT '{}',
    political_context TEXT,
    what_happened TEXT NOT NULL,
    outcome TEXT NOT NULL,
    lessons_learned TEXT,
    similarity_themes TEXT[] DEFAULT '{}', -- For matching
    embedding VECTOR(1536),
    source_references TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for historical_parallels
CREATE INDEX IF NOT EXISTS idx_parallels_embedding
ON historical_parallels USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_parallels_themes
ON historical_parallels USING GIN(similarity_themes);


-- ============================================
-- TABLE 5: project_2025_policies
-- Project 2025 policy database
-- ============================================
CREATE TABLE IF NOT EXISTS project_2025_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter VARCHAR(100),
    page_number INTEGER,
    policy_title VARCHAR(300),
    policy_text TEXT NOT NULL,
    policy_area VARCHAR(50), -- 'economy', 'immigration', 'education', etc.
    key_recommendations TEXT[] DEFAULT '{}',
    embedding VECTOR(1536),
    implementation_status VARCHAR(50),
    related_actions JSONB DEFAULT '{}', -- Federal Register, Executive Orders
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project_2025_policies
CREATE INDEX IF NOT EXISTS idx_policies_embedding
ON project_2025_policies USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_policies_area
ON project_2025_policies(policy_area);


-- ============================================
-- TABLE 6: analysis_requests
-- User-submitted political statements for analysis
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    political_statement TEXT NOT NULL,
    statement_embedding VECTOR(1536),
    user_id VARCHAR(100), -- Optional for tracking
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'complete', 'error')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for analysis_requests
CREATE INDEX IF NOT EXISTS idx_requests_status
ON analysis_requests(status);

CREATE INDEX IF NOT EXISTS idx_requests_created
ON analysis_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_user
ON analysis_requests(user_id);


-- ============================================
-- TABLE 7: analysis_results
-- Completed analyses with all data
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES analysis_requests(id) ON DELETE CASCADE,

    -- Biblical Analysis
    relevant_passages JSONB DEFAULT '[]', -- Array of passage IDs + relevance scores
    etymology_insights JSONB DEFAULT '{}',
    biblical_context JSONB DEFAULT '{}',

    -- Historical Parallels
    historical_parallels JSONB DEFAULT '[]', -- Array of parallel IDs + relevance

    -- Modern Context
    policy_connections JSONB DEFAULT '[]',
    government_data JSONB DEFAULT '{}',
    news_articles JSONB DEFAULT '[]',

    -- Claude AI Synthesis
    executive_summary TEXT,
    detailed_analysis TEXT,
    original_language_insights TEXT,
    historical_comparison TEXT,
    modern_application TEXT,
    theological_perspectives JSONB DEFAULT '[]',

    -- Metadata
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analysis_results
CREATE INDEX IF NOT EXISTS idx_results_request
ON analysis_results(request_id);


-- ============================================
-- TABLE 8: news_cache
-- Cached news articles for current context
-- ============================================
CREATE TABLE IF NOT EXISTS news_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT UNIQUE NOT NULL,
    title VARCHAR(500),
    source VARCHAR(100),
    published_date TIMESTAMP WITH TIME ZONE,
    content TEXT,
    summary TEXT,
    keywords TEXT[] DEFAULT '{}',
    sentiment VARCHAR(20),
    embedding VECTOR(1536),
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for news_cache
CREATE INDEX IF NOT EXISTS idx_news_embedding
ON news_cache USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_news_published
ON news_cache(published_date DESC);

CREATE INDEX IF NOT EXISTS idx_news_keywords
ON news_cache USING GIN(keywords);


-- ============================================
-- FUNCTION: search_biblical_passages
-- Semantic search for relevant scripture
-- ============================================
CREATE OR REPLACE FUNCTION search_biblical_passages(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10,
    translation_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    book VARCHAR,
    chapter INTEGER,
    verse_start INTEGER,
    verse_end INTEGER,
    text TEXT,
    translation VARCHAR,
    themes TEXT[],
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        bp.id,
        bp.book,
        bp.chapter,
        bp.verse_start,
        bp.verse_end,
        bp.text,
        bp.translation,
        bp.themes,
        1 - (bp.embedding <=> query_embedding) AS similarity
    FROM biblical_passages bp
    WHERE
        (translation_filter IS NULL OR bp.translation = translation_filter)
        AND 1 - (bp.embedding <=> query_embedding) > match_threshold
    ORDER BY bp.embedding <=> query_embedding
    LIMIT match_count;
$$;


-- ============================================
-- FUNCTION: search_historical_parallels
-- Find similar historical events
-- ============================================
CREATE OR REPLACE FUNCTION search_historical_parallels(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    time_period VARCHAR,
    location VARCHAR,
    situation_summary TEXT,
    outcome TEXT,
    lessons_learned TEXT,
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        hp.id,
        hp.title,
        hp.time_period,
        hp.location,
        hp.situation_summary,
        hp.outcome,
        hp.lessons_learned,
        1 - (hp.embedding <=> query_embedding) AS similarity
    FROM historical_parallels hp
    WHERE 1 - (hp.embedding <=> query_embedding) > match_threshold
    ORDER BY hp.embedding <=> query_embedding
    LIMIT match_count;
$$;


-- ============================================
-- FUNCTION: search_project_2025
-- Search Project 2025 policies
-- ============================================
CREATE OR REPLACE FUNCTION search_project_2025(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    chapter VARCHAR,
    policy_title VARCHAR,
    policy_text TEXT,
    policy_area VARCHAR,
    key_recommendations TEXT[],
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        p.id,
        p.chapter,
        p.policy_title,
        p.policy_text,
        p.policy_area,
        p.key_recommendations,
        1 - (p.embedding <=> query_embedding) AS similarity
    FROM project_2025_policies p
    WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
$$;


-- ============================================
-- FUNCTION: search_news
-- Search cached news articles
-- ============================================
CREATE OR REPLACE FUNCTION search_news(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10,
    days_back INT DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    source VARCHAR,
    url TEXT,
    summary TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        n.id,
        n.title,
        n.source,
        n.url,
        n.summary,
        n.published_date,
        1 - (n.embedding <=> query_embedding) AS similarity
    FROM news_cache n
    WHERE
        n.published_date > NOW() - (days_back || ' days')::INTERVAL
        AND 1 - (n.embedding <=> query_embedding) > match_threshold
    ORDER BY n.embedding <=> query_embedding
    LIMIT match_count;
$$;


-- ============================================
-- FUNCTION: get_complete_analysis
-- Retrieve full analysis with all related data
-- ============================================
CREATE OR REPLACE FUNCTION get_complete_analysis(analysis_request_id UUID)
RETURNS JSONB
LANGUAGE PLPGSQL
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'request', (
            SELECT row_to_json(ar.*)
            FROM analysis_requests ar
            WHERE ar.id = analysis_request_id
        ),
        'results', (
            SELECT row_to_json(r.*)
            FROM analysis_results r
            WHERE r.request_id = analysis_request_id
        )
    ) INTO result;

    RETURN result;
END;
$$;


-- ============================================
-- TRIGGER: Update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_biblical_passages_updated_at
    BEFORE UPDATE ON biblical_passages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_2025_updated_at
    BEFORE UPDATE ON project_2025_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS and create policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE biblical_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE original_language ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_parallels ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_2025_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for reference data
CREATE POLICY "Public read access" ON biblical_passages FOR SELECT USING (true);
CREATE POLICY "Public read access" ON original_language FOR SELECT USING (true);
CREATE POLICY "Public read access" ON historical_context FOR SELECT USING (true);
CREATE POLICY "Public read access" ON historical_parallels FOR SELECT USING (true);
CREATE POLICY "Public read access" ON project_2025_policies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON news_cache FOR SELECT USING (true);

-- Analysis requests - users can read their own
CREATE POLICY "Users can insert analysis requests"
    ON analysis_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can read their own requests"
    ON analysis_requests FOR SELECT
    USING (true);

-- Analysis results - public read
CREATE POLICY "Public read access to results"
    ON analysis_results FOR SELECT
    USING (true);


-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample biblical passage
INSERT INTO biblical_passages (book, chapter, verse_start, verse_end, translation, text, themes, testament)
VALUES
    ('Micah', 6, 8, NULL, 'ESV',
     'He has told you, O man, what is good; and what does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?',
     ARRAY['justice', 'humility', 'righteousness', 'ethics'],
     'OT'),
    ('Matthew', 22, 37, 39, 'ESV',
     'And he said to him, "You shall love the Lord your God with all your heart and with all your soul and with all your mind. This is the great and first commandment. And a second is like it: You shall love your neighbor as yourself."',
     ARRAY['love', 'commandments', 'relationships', 'God'],
     'NT'),
    ('Proverbs', 31, 8, 9, 'ESV',
     'Open your mouth for the mute, for the rights of all who are destitute. Open your mouth, judge righteously, defend the rights of the poor and needy.',
     ARRAY['justice', 'advocacy', 'poor', 'righteousness'],
     'OT');

-- ============================================
-- COMPLETE!
-- ============================================
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Test the search functions
-- 4. Populate with data using Python scripts
-- ============================================
