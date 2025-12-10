# Database Population Instructions

## Goal: Import 31,102 Bible Verses to Supabase with Embeddings

This document provides step-by-step instructions for populating the Supabase database with the complete Bible text, including vector embeddings for semantic search.

---

## Prerequisites

### 1. Environment Variables Required
```bash
# In .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
```

### 2. Database Schema (Already Exists)
The `biblical_passages` table should have:
```sql
CREATE TABLE biblical_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book VARCHAR(50) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation VARCHAR(20) DEFAULT 'KJV',
  testament VARCHAR(20),
  themes TEXT[],
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX ON biblical_passages USING ivfflat (embedding vector_cosine_ops);
```

---

## Step 1: Get Bible Text

### Option A: Use API.Bible (Recommended)
```python
import requests

API_BIBLE_KEY = "your-api-bible-key"
BIBLE_ID = "de4e12af7f28f599-02"  # KJV

def get_bible_books():
    url = f"https://api.scripture.api.bible/v1/bibles/{BIBLE_ID}/books"
    headers = {"api-key": API_BIBLE_KEY}
    response = requests.get(url, headers=headers)
    return response.json()["data"]

def get_chapter_verses(book_id, chapter):
    url = f"https://api.scripture.api.bible/v1/bibles/{BIBLE_ID}/chapters/{book_id}.{chapter}/verses"
    headers = {"api-key": API_BIBLE_KEY}
    response = requests.get(url, headers=headers)
    return response.json()["data"]
```

### Option B: Parse Existing Narrative File
The `jewish_biblical_narrative_enhanced.md` file contains structured text that can be parsed:
```python
import re

def parse_narrative_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Extract book sections
    books = re.findall(r'^## (\w+)\n([\s\S]*?)(?=\n## |$)', content, re.MULTILINE)
    return books
```

### Option C: Use Public Domain KJV Text
Download from: https://github.com/thiagobodruk/bible/blob/master/json/en_kjv.json

---

## Step 2: Generate Embeddings

### Batch Processing Script
```python
import openai
from supabase import create_client
import time

# Initialize clients
openai.api_key = os.environ["OPENAI_API_KEY"]
supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)

def generate_embedding(text):
    """Generate embedding using OpenAI text-embedding-3-small"""
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def process_verses_batch(verses, batch_size=100):
    """Process verses in batches to avoid rate limits"""
    for i in range(0, len(verses), batch_size):
        batch = verses[i:i+batch_size]

        for verse in batch:
            # Combine verse text with context for better embeddings
            embedding_text = f"{verse['book']} {verse['chapter']}:{verse['verse']} - {verse['text']}"
            embedding = generate_embedding(embedding_text)

            # Insert into Supabase
            supabase.table("biblical_passages").insert({
                "book": verse["book"],
                "chapter": verse["chapter"],
                "verse": verse["verse"],
                "text": verse["text"],
                "translation": "KJV",
                "testament": verse["testament"],
                "themes": verse.get("themes", []),
                "embedding": embedding
            }).execute()

        print(f"Processed {min(i+batch_size, len(verses))}/{len(verses)} verses")
        time.sleep(1)  # Rate limiting
```

---

## Step 3: Bible Structure Reference

### Books and Chapter Counts
```python
BIBLE_STRUCTURE = {
    # Old Testament (39 books, 929 chapters)
    "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
    "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
    "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
    "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
    "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
    "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12,
    "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4,
    "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2,
    "Zechariah": 14, "Malachi": 4,

    # New Testament (27 books, 260 chapters)
    "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
    "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
    "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5,
    "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3,
    "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3,
    "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
}

OLD_TESTAMENT = list(BIBLE_STRUCTURE.keys())[:39]
NEW_TESTAMENT = list(BIBLE_STRUCTURE.keys())[39:]
```

---

## Step 4: Theme Tagging

### Biblical Themes for Classification
```python
BIBLICAL_THEMES = {
    "covenant": ["covenant", "promise", "oath", "agreement", "testament"],
    "redemption": ["redeem", "ransom", "save", "deliver", "rescue"],
    "justice": ["justice", "righteous", "judgment", "fair", "equity"],
    "mercy": ["mercy", "compassion", "grace", "forgive", "pardon"],
    "faith": ["faith", "believe", "trust", "hope", "confidence"],
    "love": ["love", "beloved", "charity", "kindness", "affection"],
    "wisdom": ["wisdom", "wise", "understanding", "knowledge", "discern"],
    "prophecy": ["prophet", "prophesy", "vision", "oracle", "declare"],
    "kingdom": ["king", "kingdom", "throne", "reign", "rule"],
    "worship": ["worship", "praise", "glory", "honor", "bow"],
    "sin": ["sin", "iniquity", "transgress", "wicked", "evil"],
    "holiness": ["holy", "sanctify", "pure", "clean", "sacred"],
    "prayer": ["pray", "prayer", "intercede", "supplication", "petition"],
    "creation": ["create", "made", "form", "establish", "beginning"],
    "law": ["law", "command", "statute", "ordinance", "decree"]
}

def tag_verse_themes(text):
    """Identify themes present in verse text"""
    text_lower = text.lower()
    themes = []
    for theme, keywords in BIBLICAL_THEMES.items():
        if any(keyword in text_lower for keyword in keywords):
            themes.append(theme)
    return themes
```

---

## Step 5: Complete Population Script

```python
#!/usr/bin/env python3
"""
Bible Database Population Script
Imports 31,102 verses to Supabase with embeddings
"""

import os
import json
import time
import requests
from supabase import create_client
import openai

# Configuration
BATCH_SIZE = 50
RATE_LIMIT_DELAY = 1.0  # seconds between batches
EMBEDDING_MODEL = "text-embedding-3-small"

# Initialize clients
supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)
openai.api_key = os.environ["OPENAI_API_KEY"]

def main():
    print("Starting Bible database population...")

    # Load Bible data (adjust based on your source)
    with open("bible_kjv.json", "r") as f:
        bible_data = json.load(f)

    total_verses = sum(len(book["chapters"]) for book in bible_data)
    processed = 0

    for book in bible_data:
        book_name = book["name"]
        testament = "old" if book_name in OLD_TESTAMENT else "new"

        for chapter_num, chapter in enumerate(book["chapters"], 1):
            for verse_num, verse_text in enumerate(chapter, 1):
                # Generate embedding
                embedding_input = f"{book_name} {chapter_num}:{verse_num} - {verse_text}"
                embedding = generate_embedding(embedding_input)

                # Tag themes
                themes = tag_verse_themes(verse_text)

                # Insert to database
                supabase.table("biblical_passages").insert({
                    "book": book_name,
                    "chapter": chapter_num,
                    "verse": verse_num,
                    "text": verse_text,
                    "translation": "KJV",
                    "testament": testament,
                    "themes": themes,
                    "embedding": embedding
                }).execute()

                processed += 1

                if processed % BATCH_SIZE == 0:
                    print(f"Progress: {processed}/{total_verses} ({processed/total_verses*100:.1f}%)")
                    time.sleep(RATE_LIMIT_DELAY)

    print(f"Complete! Imported {processed} verses.")

if __name__ == "__main__":
    main()
```

---

## Step 6: Verification Queries

After population, verify the data:

```sql
-- Count total verses
SELECT COUNT(*) FROM biblical_passages;
-- Expected: 31,102

-- Count by testament
SELECT testament, COUNT(*)
FROM biblical_passages
GROUP BY testament;
-- Expected: old: 23,145, new: 7,957

-- Count by book
SELECT book, COUNT(*) as verses
FROM biblical_passages
GROUP BY book
ORDER BY verses DESC;

-- Test semantic search
SELECT book, chapter, verse, text,
       1 - (embedding <=> '[your-query-embedding]') as similarity
FROM biblical_passages
ORDER BY similarity DESC
LIMIT 10;
```

---

## Estimated Time & Cost

| Metric | Estimate |
|--------|----------|
| Total Verses | 31,102 |
| Embedding Cost | ~$0.03 (text-embedding-3-small @ $0.00002/1K tokens) |
| Processing Time | ~2-3 hours (with rate limiting) |
| Database Storage | ~500MB (including embeddings) |

---

## API Keys Required

1. **OpenAI API Key** - For embedding generation
   - Get from: https://platform.openai.com/api-keys

2. **Supabase Service Key** - For database writes
   - Get from: Supabase Dashboard > Settings > API > service_role key

3. **API.Bible Key** (Optional) - For fetching verse text
   - Get from: https://scripture.api.bible/

---

## Running the Script

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
export OPENAI_API_KEY="sk-your-key"

# Activate virtual environment
source venv/bin/activate

# Run population script
python scripts/populate_bible_database.py
```

---

## Files Created

| File | Purpose |
|------|---------|
| `scripts/populate_bible_database.py` | Main population script |
| `data/bible_kjv.json` | KJV Bible text (if downloaded) |
| `DATABASE_POPULATION_PROMPT.md` | This documentation |

---

## Post-Population Tasks

1. **Create search function in Supabase**
```sql
CREATE OR REPLACE FUNCTION search_verses(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  book VARCHAR,
  chapter INT,
  verse INT,
  text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.book,
    bp.chapter,
    bp.verse,
    bp.text,
    1 - (bp.embedding <=> query_embedding) as similarity
  FROM biblical_passages bp
  WHERE 1 - (bp.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

2. **Update API routes to use database**
3. **Add search functionality to UI**
4. **Deploy to Vercel**
