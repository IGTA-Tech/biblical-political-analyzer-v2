#!/usr/bin/env python3
"""
Bible Database Population Script
Imports 31,102 verses to Supabase with OpenAI embeddings
"""

import os
import json
import time
import sys
from pathlib import Path

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import openai
from supabase import create_client, Client

# Load environment from .env.local file (with fallback to .env)
from dotenv import load_dotenv
env_local = Path(__file__).parent.parent / '.env.local'
env_file = Path(__file__).parent.parent / '.env'
load_dotenv(env_local if env_local.exists() else env_file)

# Configuration
BATCH_SIZE = 20  # Process 20 verses at a time
RATE_LIMIT_DELAY = 0.5  # seconds between batches
EMBEDDING_MODEL = "text-embedding-3-small"
COMMIT_FREQUENCY = 500  # Print progress every N verses

# Book abbreviation to full name mapping
BOOK_NAMES = {
    # Old Testament
    "gn": "Genesis", "ex": "Exodus", "lv": "Leviticus", "nm": "Numbers", "dt": "Deuteronomy",
    "js": "Joshua", "jud": "Judges", "rt": "Ruth", "1sm": "1 Samuel", "2sm": "2 Samuel",
    "1kgs": "1 Kings", "2kgs": "2 Kings", "1ch": "1 Chronicles", "2ch": "2 Chronicles",
    "ezr": "Ezra", "ne": "Nehemiah", "est": "Esther", "job": "Job", "ps": "Psalms",
    "prv": "Proverbs", "eccl": "Ecclesiastes", "so": "Song of Solomon", "is": "Isaiah",
    "jr": "Jeremiah", "lm": "Lamentations", "ez": "Ezekiel", "dn": "Daniel",
    "ho": "Hosea", "jl": "Joel", "am": "Amos", "ob": "Obadiah", "jnh": "Jonah",
    "mc": "Micah", "na": "Nahum", "hk": "Habakkuk", "zp": "Zephaniah", "hg": "Haggai",
    "zc": "Zechariah", "ml": "Malachi",
    # New Testament
    "mt": "Matthew", "mk": "Mark", "lk": "Luke", "jo": "John", "act": "Acts",
    "rm": "Romans", "1co": "1 Corinthians", "2co": "2 Corinthians", "gl": "Galatians",
    "eph": "Ephesians", "ph": "Philippians", "cl": "Colossians", "1ts": "1 Thessalonians",
    "2ts": "2 Thessalonians", "1tm": "1 Timothy", "2tm": "2 Timothy", "tt": "Titus",
    "phm": "Philemon", "hb": "Hebrews", "jm": "James", "1pe": "1 Peter", "2pe": "2 Peter",
    "1jo": "1 John", "2jo": "2 John", "3jo": "3 John", "jd": "Jude", "re": "Revelation"
}

OLD_TESTAMENT = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
    "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms",
    "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
    "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
    "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]

# Biblical themes for tagging
BIBLICAL_THEMES = {
    "covenant": ["covenant", "promise", "oath", "agreement", "testament"],
    "redemption": ["redeem", "ransom", "save", "deliver", "rescue"],
    "justice": ["justice", "righteous", "judgment", "fair", "equity"],
    "mercy": ["mercy", "compassion", "grace", "forgive", "pardon"],
    "faith": ["faith", "believe", "trust", "hope"],
    "love": ["love", "beloved", "charity", "kindness"],
    "wisdom": ["wisdom", "wise", "understanding", "knowledge"],
    "prophecy": ["prophet", "prophesy", "vision", "oracle"],
    "kingdom": ["king", "kingdom", "throne", "reign"],
    "worship": ["worship", "praise", "glory", "honor"],
    "sin": ["sin", "iniquity", "transgress", "wicked"],
    "holiness": ["holy", "sanctify", "pure", "clean"],
    "prayer": ["pray", "prayer", "intercede", "supplication"],
    "creation": ["create", "made", "form", "beginning"],
    "law": ["law", "command", "statute", "ordinance"]
}

def tag_verse_themes(text: str) -> list:
    """Identify themes present in verse text"""
    text_lower = text.lower()
    themes = []
    for theme, keywords in BIBLICAL_THEMES.items():
        if any(keyword in text_lower for keyword in keywords):
            themes.append(theme)
    return themes

def generate_embedding(client: openai.OpenAI, text: str) -> list:
    """Generate embedding using OpenAI"""
    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"  Embedding error: {e}")
        return None

def main():
    print("=" * 60)
    print("BIBLE DATABASE POPULATION SCRIPT")
    print("=" * 60)

    # Initialize clients
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if not all([supabase_url, supabase_key, openai_key]):
        print("ERROR: Missing environment variables!")
        print(f"  SUPABASE_URL: {'OK' if supabase_url else 'MISSING'}")
        print(f"  SUPABASE_KEY: {'OK' if supabase_key else 'MISSING'}")
        print(f"  OPENAI_KEY: {'OK' if openai_key else 'MISSING'}")
        sys.exit(1)

    print(f"Supabase URL: {supabase_url}")
    print(f"OpenAI Model: {EMBEDDING_MODEL}")

    supabase: Client = create_client(supabase_url, supabase_key)
    openai_client = openai.OpenAI(api_key=openai_key)

    # Load Bible data
    bible_path = Path(__file__).parent / "bible_kjv.json"
    print(f"\nLoading Bible from: {bible_path}")

    with open(bible_path, 'r', encoding='utf-8-sig') as f:
        bible_data = json.load(f)

    print(f"Loaded {len(bible_data)} books")

    # Count total verses
    total_verses = 0
    for book in bible_data:
        for chapter in book.get("chapters", []):
            total_verses += len(chapter)

    print(f"Total verses to import: {total_verses}")
    print("-" * 60)

    # Process each book
    processed = 0
    errors = 0
    start_time = time.time()

    for book_idx, book in enumerate(bible_data):
        abbrev = book.get("abbrev", "").lower()
        book_name = BOOK_NAMES.get(abbrev, abbrev.upper())
        testament = "OT" if book_name in OLD_TESTAMENT else "NT"

        chapters = book.get("chapters", [])
        print(f"\n[{book_idx+1}/{len(bible_data)}] {book_name} ({len(chapters)} chapters)")

        for chapter_num, chapter in enumerate(chapters, 1):
            for verse_num, verse_text in enumerate(chapter, 1):
                if not verse_text or not verse_text.strip():
                    continue

                # Clean verse text
                verse_text = verse_text.strip()

                # Generate embedding context
                embedding_text = f"{book_name} {chapter_num}:{verse_num} - {verse_text}"

                # Generate embedding
                embedding = generate_embedding(openai_client, embedding_text)

                if embedding is None:
                    errors += 1
                    continue

                # Tag themes
                themes = tag_verse_themes(verse_text)

                # Insert into Supabase
                try:
                    supabase.table("biblical_passages").insert({
                        "book": book_name,
                        "chapter": chapter_num,
                        "verse_start": verse_num,
                        "verse_end": verse_num,
                        "text": verse_text,
                        "translation": "KJV",
                        "testament": testament,
                        "themes": themes,
                        "embedding": embedding
                    }).execute()

                    processed += 1

                except Exception as e:
                    print(f"  DB Error: {e}")
                    errors += 1

                # Progress update
                if processed % COMMIT_FREQUENCY == 0:
                    elapsed = time.time() - start_time
                    rate = processed / elapsed if elapsed > 0 else 0
                    remaining = (total_verses - processed) / rate if rate > 0 else 0
                    print(f"  Progress: {processed}/{total_verses} ({processed/total_verses*100:.1f}%) "
                          f"| Rate: {rate:.1f}/sec | ETA: {remaining/60:.1f} min")

                # Rate limiting
                if processed % BATCH_SIZE == 0:
                    time.sleep(RATE_LIMIT_DELAY)

    # Final summary
    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print("COMPLETE!")
    print(f"  Processed: {processed} verses")
    print(f"  Errors: {errors}")
    print(f"  Time: {elapsed/60:.1f} minutes")
    print(f"  Rate: {processed/elapsed:.1f} verses/second")
    print("=" * 60)

if __name__ == "__main__":
    main()
