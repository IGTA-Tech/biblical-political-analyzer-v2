-- ============================================
-- BIBLICAL CHARACTERS & RELATIONSHIPS SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor after the main schema

-- ============================================
-- TABLE: biblical_characters
-- Stores all Biblical characters with metadata
-- ============================================
CREATE TABLE IF NOT EXISTS biblical_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    alternate_names TEXT[] DEFAULT '{}', -- Other names/titles (Israel, Cephas, etc.)
    title VARCHAR(200),
    category VARCHAR(50) NOT NULL, -- patriarch, king, prophet, apostle, etc.
    era VARCHAR(100), -- Patriarchal, Exodus, United Monarchy, etc.
    testament VARCHAR(10) CHECK (testament IN ('OT', 'NT', 'both')),

    -- Biographical info
    birth_year VARCHAR(50), -- Approximate, e.g., "~2000 BC"
    death_year VARCHAR(50),
    birth_place VARCHAR(100),
    death_place VARCHAR(100),
    tribe_or_nation VARCHAR(100),
    occupation TEXT[] DEFAULT '{}',

    -- Biblical presence
    books TEXT[] DEFAULT '{}', -- Books they appear in
    first_appearance VARCHAR(100), -- e.g., "Genesis 12:1"
    key_verses TEXT[] DEFAULT '{}',
    appearance_count INTEGER DEFAULT 0, -- Number of mentions

    -- Narrative info
    significance TEXT,
    biography TEXT, -- Longer description
    major_events TEXT[] DEFAULT '{}',
    character_traits TEXT[] DEFAULT '{}',

    -- For search
    embedding VECTOR(1536),
    search_text TEXT, -- Combined searchable text

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_characters_name ON biblical_characters(name);
CREATE INDEX IF NOT EXISTS idx_characters_category ON biblical_characters(category);
CREATE INDEX IF NOT EXISTS idx_characters_era ON biblical_characters(era);
CREATE INDEX IF NOT EXISTS idx_characters_testament ON biblical_characters(testament);
CREATE INDEX IF NOT EXISTS idx_characters_books ON biblical_characters USING GIN(books);

-- ============================================
-- TABLE: character_relationships
-- Stores relationships between characters
-- ============================================
CREATE TABLE IF NOT EXISTS character_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES biblical_characters(id) ON DELETE CASCADE,
    related_character_id UUID REFERENCES biblical_characters(id) ON DELETE CASCADE,

    relationship_type VARCHAR(50) NOT NULL, -- See types below
    relationship_subtype VARCHAR(50), -- More specific

    -- Directional info (e.g., "father of" vs "son of")
    is_bidirectional BOOLEAN DEFAULT true,
    inverse_type VARCHAR(50), -- The inverse relationship type

    -- Context
    description TEXT,
    key_events TEXT[] DEFAULT '{}', -- Events involving both
    scripture_refs TEXT[] DEFAULT '{}', -- References where relationship shown

    -- Metadata
    strength INTEGER DEFAULT 5 CHECK (strength >= 1 AND strength <= 10), -- Relationship importance
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral', 'complex')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate relationships
    UNIQUE(character_id, related_character_id, relationship_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rel_character ON character_relationships(character_id);
CREATE INDEX IF NOT EXISTS idx_rel_related ON character_relationships(related_character_id);
CREATE INDEX IF NOT EXISTS idx_rel_type ON character_relationships(relationship_type);

-- ============================================
-- RELATIONSHIP TYPES REFERENCE
-- ============================================
-- Family:
--   spouse, parent, child, sibling, grandparent, grandchild,
--   ancestor, descendant, in-law, step-relation
--
-- Social:
--   friend, enemy, ally, rival, servant, master,
--   mentor, student, successor, predecessor
--
-- Religious/Political:
--   prophet-to, king-of, priest-of, apostle-of,
--   follower, leader, judge-of
--
-- Narrative:
--   saved-by, betrayed-by, killed-by, healed-by,
--   blessed-by, cursed-by, tested-by

-- ============================================
-- FUNCTION: Get character with relationships
-- ============================================
CREATE OR REPLACE FUNCTION get_character_with_relationships(char_name VARCHAR)
RETURNS JSONB
LANGUAGE PLPGSQL
AS $$
DECLARE
    result JSONB;
    char_id UUID;
BEGIN
    -- Get character ID
    SELECT id INTO char_id FROM biblical_characters WHERE name = char_name LIMIT 1;

    IF char_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Build result
    SELECT jsonb_build_object(
        'character', (
            SELECT row_to_json(bc.*)
            FROM biblical_characters bc
            WHERE bc.id = char_id
        ),
        'relationships', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'type', cr.relationship_type,
                'subtype', cr.relationship_subtype,
                'related_character', rc.name,
                'related_id', rc.id,
                'description', cr.description,
                'strength', cr.strength,
                'sentiment', cr.sentiment
            )), '[]'::jsonb)
            FROM character_relationships cr
            JOIN biblical_characters rc ON rc.id = cr.related_character_id
            WHERE cr.character_id = char_id
        ),
        'related_to_by', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'type', cr.inverse_type,
                'subtype', cr.relationship_subtype,
                'related_character', rc.name,
                'related_id', rc.id,
                'description', cr.description,
                'strength', cr.strength,
                'sentiment', cr.sentiment
            )), '[]'::jsonb)
            FROM character_relationships cr
            JOIN biblical_characters rc ON rc.id = cr.character_id
            WHERE cr.related_character_id = char_id
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- ============================================
-- FUNCTION: Get relationship graph data
-- Returns nodes and edges for visualization
-- ============================================
CREATE OR REPLACE FUNCTION get_relationship_graph(
    center_character VARCHAR DEFAULT NULL,
    max_depth INTEGER DEFAULT 2,
    relationship_types TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE PLPGSQL
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Build nodes and edges
    SELECT jsonb_build_object(
        'nodes', (
            SELECT COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
                'id', bc.id,
                'name', bc.name,
                'title', bc.title,
                'category', bc.category,
                'era', bc.era,
                'testament', bc.testament
            )), '[]'::jsonb)
            FROM biblical_characters bc
            WHERE center_character IS NULL
               OR bc.name = center_character
               OR bc.id IN (
                   SELECT related_character_id FROM character_relationships
                   WHERE character_id = (SELECT id FROM biblical_characters WHERE name = center_character)
               )
               OR bc.id IN (
                   SELECT character_id FROM character_relationships
                   WHERE related_character_id = (SELECT id FROM biblical_characters WHERE name = center_character)
               )
        ),
        'edges', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'source', cr.character_id,
                'target', cr.related_character_id,
                'type', cr.relationship_type,
                'subtype', cr.relationship_subtype,
                'strength', cr.strength,
                'sentiment', cr.sentiment
            )), '[]'::jsonb)
            FROM character_relationships cr
            WHERE (relationship_types IS NULL OR cr.relationship_type = ANY(relationship_types))
            AND (center_character IS NULL OR
                cr.character_id = (SELECT id FROM biblical_characters WHERE name = center_character) OR
                cr.related_character_id = (SELECT id FROM biblical_characters WHERE name = center_character))
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE biblical_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON biblical_characters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON character_relationships FOR SELECT USING (true);

-- ============================================
-- UPDATE TRIGGER
-- ============================================
CREATE TRIGGER update_biblical_characters_updated_at
    BEFORE UPDATE ON biblical_characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
