-- Create the vector similarity search function for Supabase
-- Run this in the Supabase SQL Editor

-- First ensure the vector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the search function
-- Note: Uses explicit casts to match table column types (varchar -> text)
CREATE OR REPLACE FUNCTION search_verses(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_testament text DEFAULT NULL,
  filter_book text DEFAULT NULL,
  filter_theme text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  book text,
  chapter int,
  verse_start int,
  verse_end int,
  text text,
  translation text,
  testament text,
  themes text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.book::text,
    bp.chapter,
    bp.verse_start,
    bp.verse_end,
    bp.text::text,
    bp.translation::text,
    bp.testament::text,
    bp.themes::text[],
    1 - (bp.embedding <=> query_embedding) AS similarity
  FROM biblical_passages bp
  WHERE
    bp.embedding IS NOT NULL
    AND 1 - (bp.embedding <=> query_embedding) > match_threshold
    AND (filter_testament IS NULL OR bp.testament = filter_testament)
    AND (filter_book IS NULL OR bp.book = filter_book)
    AND (filter_theme IS NULL OR filter_theme = ANY(bp.themes))
  ORDER BY bp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create an index on the embedding column for faster search
CREATE INDEX IF NOT EXISTS biblical_passages_embedding_idx
ON biblical_passages
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_verses TO anon, authenticated;
