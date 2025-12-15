-- ============================================
-- STUDY CACHE TABLE
-- Caches AI-generated study content
-- ============================================

CREATE TABLE IF NOT EXISTS study_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(100) NOT NULL,        -- e.g., "John 3:16"
    study_type VARCHAR(50) NOT NULL,        -- explain, study-guide, discussion, etc.
    content TEXT NOT NULL,                  -- The AI-generated content
    audience VARCHAR(50),                   -- Target audience
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint for caching
    UNIQUE(reference, study_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_cache_reference ON study_cache(reference);
CREATE INDEX IF NOT EXISTS idx_study_cache_type ON study_cache(study_type);

-- RLS
ALTER TABLE study_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON study_cache FOR SELECT USING (true);
CREATE POLICY "Service insert access" ON study_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update access" ON study_cache FOR UPDATE USING (true);
