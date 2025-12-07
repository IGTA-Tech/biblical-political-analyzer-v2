#!/usr/bin/env python3
"""
Fix Missing Bible Chapters in jewish_biblical_narrative_enhanced.md

This script:
1. Identifies all chapters marked as unavailable
2. Fetches the KJV text from bible-api.com (free, no key required)
3. Replaces placeholders with actual Bible text
4. Removes duplicate chapter headers
5. Adds missing books (Minor Prophets)

Usage: python3 fix_missing_chapters.py
"""

import requests
import re
import time
import json
from pathlib import Path

# Bible structure: book name -> number of chapters
BIBLE_STRUCTURE = {
    # Old Testament
    "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
    "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
    "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
    "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
    "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
    "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12,
    "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4,
    "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2,
    "Zechariah": 14, "Malachi": 4,
    # New Testament
    "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
    "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
    "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5,
    "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3,
    "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3,
    "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
}

# API book name mapping (some books need different names for the API)
API_BOOK_NAMES = {
    "Song of Solomon": "Song of Songs",
    "1 Samuel": "1Samuel",
    "2 Samuel": "2Samuel",
    "1 Kings": "1Kings",
    "2 Kings": "2Kings",
    "1 Chronicles": "1Chronicles",
    "2 Chronicles": "2Chronicles",
    "1 Corinthians": "1Corinthians",
    "2 Corinthians": "2Corinthians",
    "1 Thessalonians": "1Thessalonians",
    "2 Thessalonians": "2Thessalonians",
    "1 Timothy": "1Timothy",
    "2 Timothy": "2Timothy",
    "1 Peter": "1Peter",
    "2 Peter": "2Peter",
    "1 John": "1John",
    "2 John": "2John",
    "3 John": "3John"
}

def fetch_chapter_from_api(book, chapter):
    """Fetch a chapter from bible-api.com (free, no API key required)"""
    api_book = API_BOOK_NAMES.get(book, book)
    url = f"https://bible-api.com/{api_book}+{chapter}?translation=kjv"

    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if 'verses' in data:
                # Format verses properly
                verses = []
                for v in data['verses']:
                    verse_num = v.get('verse', '')
                    text = v.get('text', '').strip()
                    verses.append(f"{verse_num} {text}")
                return "\n".join(verses)
            elif 'text' in data:
                return data['text'].strip()
        else:
            print(f"  API returned {response.status_code} for {book} {chapter}")
            return None
    except Exception as e:
        print(f"  Error fetching {book} {chapter}: {e}")
        return None

def analyze_file(filepath):
    """Analyze the file to find missing/duplicate chapters"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all chapter headers
    chapter_pattern = r'^### ([A-Za-z0-9 ]+) Chapter (\d+)\s*$'
    chapters_found = {}
    unavailable_chapters = []

    lines = content.split('\n')
    for i, line in enumerate(lines):
        match = re.match(chapter_pattern, line)
        if match:
            book = match.group(1).strip()
            chapter = int(match.group(2))
            key = f"{book}:{chapter}"

            # Check if this is a duplicate
            if key in chapters_found:
                chapters_found[key]['count'] += 1
                chapters_found[key]['lines'].append(i)
            else:
                chapters_found[key] = {'count': 1, 'lines': [i]}

            # Check if content is unavailable (look at next few lines)
            next_lines = '\n'.join(lines[i+1:i+5])
            if '*[Chapter text unavailable]*' in next_lines or '[Chapter text unavailable]' in next_lines:
                unavailable_chapters.append((book, chapter, i))

    # Find missing books entirely
    books_in_file = set()
    for key in chapters_found:
        book = key.rsplit(':', 1)[0]
        books_in_file.add(book)

    missing_books = []
    for book in BIBLE_STRUCTURE:
        if book not in books_in_file:
            missing_books.append(book)

    # Find duplicates
    duplicates = {k: v for k, v in chapters_found.items() if v['count'] > 1}

    return {
        'chapters_found': chapters_found,
        'unavailable_chapters': unavailable_chapters,
        'missing_books': missing_books,
        'duplicates': duplicates,
        'total_chapters_expected': sum(BIBLE_STRUCTURE.values()),
        'total_unique_chapters': len(chapters_found)
    }

def fix_narrative_file(input_path, output_path):
    """Main function to fix the narrative file"""
    print("=" * 60)
    print("Biblical Narrative File Fixer")
    print("=" * 60)

    # Step 1: Analyze the file
    print("\n[1/5] Analyzing file...")
    analysis = analyze_file(input_path)

    print(f"  - Total chapters expected: {analysis['total_chapters_expected']}")
    print(f"  - Unique chapters found: {analysis['total_unique_chapters']}")
    print(f"  - Chapters marked unavailable: {len(analysis['unavailable_chapters'])}")
    print(f"  - Missing books entirely: {len(analysis['missing_books'])}")
    print(f"  - Duplicate chapter headers: {len(analysis['duplicates'])}")

    if analysis['missing_books']:
        print(f"  - Missing books: {', '.join(analysis['missing_books'])}")

    # Read the file
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 2: Fix unavailable chapters
    print(f"\n[2/5] Fetching {len(analysis['unavailable_chapters'])} unavailable chapters from API...")

    fixed_count = 0
    failed_count = 0

    for book, chapter, line_num in analysis['unavailable_chapters']:
        print(f"  Fetching {book} {chapter}...", end=" ")

        chapter_text = fetch_chapter_from_api(book, chapter)

        if chapter_text:
            # Replace the unavailable marker with actual text
            old_pattern = f"### {book} Chapter {chapter}\n\n*[Chapter text unavailable]*"
            new_text = f"### {book} Chapter {chapter}\n\n{chapter_text}"

            if old_pattern in content:
                content = content.replace(old_pattern, new_text, 1)
                fixed_count += 1
                print("OK")
            else:
                # Try alternate pattern
                old_pattern2 = f"### {book} Chapter {chapter}\n\n[Chapter text unavailable]"
                if old_pattern2 in content:
                    content = content.replace(old_pattern2, new_text, 1)
                    fixed_count += 1
                    print("OK")
                else:
                    print("Pattern not matched")
                    failed_count += 1
        else:
            print("FAILED")
            failed_count += 1

        # Rate limiting - be nice to the API
        time.sleep(0.5)

    print(f"  Fixed: {fixed_count}, Failed: {failed_count}")

    # Step 3: Remove duplicate chapters (keep the one with content)
    print(f"\n[3/5] Removing {len(analysis['duplicates'])} duplicate chapter sections...")

    for key, info in analysis['duplicates'].items():
        book, chapter = key.rsplit(':', 1)
        chapter = int(chapter)

        # Find all occurrences and keep only the one with content
        pattern = f"### {book} Chapter {chapter}\n\n"

        # Count occurrences
        occurrences = list(re.finditer(re.escape(pattern), content))

        if len(occurrences) > 1:
            # Check which one has content vs unavailable
            for i, match in enumerate(occurrences[:-1]):  # Keep the last one by default
                start = match.start()
                # Find end of this chapter section (next ### or end of relevant section)
                next_chapter = content.find('\n### ', start + 10)
                if next_chapter == -1:
                    next_chapter = len(content)

                section = content[start:next_chapter]

                # If this section is unavailable, remove it
                if '*[Chapter text unavailable]*' in section or '[Chapter text unavailable]' in section:
                    content = content[:start] + content[next_chapter:]
                    print(f"  Removed duplicate: {book} Chapter {chapter}")

    # Step 4: Save the fixed file
    print(f"\n[4/5] Saving fixed file to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # Step 5: Verify the fix
    print("\n[5/5] Verifying fixes...")
    new_analysis = analyze_file(output_path)

    print(f"  - Chapters now unavailable: {len(new_analysis['unavailable_chapters'])}")
    print(f"  - Remaining duplicates: {len(new_analysis['duplicates'])}")

    print("\n" + "=" * 60)
    print("COMPLETE!")
    print("=" * 60)

    return {
        'fixed_chapters': fixed_count,
        'failed_chapters': failed_count,
        'remaining_unavailable': len(new_analysis['unavailable_chapters']),
        'remaining_duplicates': len(new_analysis['duplicates'])
    }

def create_progress_report(input_path):
    """Create a detailed progress report"""
    analysis = analyze_file(input_path)

    print("\n" + "=" * 60)
    print("DETAILED PROGRESS REPORT")
    print("=" * 60)

    print(f"\nTotal chapters in KJV Bible: {analysis['total_chapters_expected']}")
    print(f"Unique chapters in file: {analysis['total_unique_chapters']}")

    print(f"\n--- MISSING BOOKS ({len(analysis['missing_books'])}) ---")
    for book in analysis['missing_books']:
        print(f"  {book}: {BIBLE_STRUCTURE[book]} chapters needed")

    print(f"\n--- UNAVAILABLE CHAPTERS ({len(analysis['unavailable_chapters'])}) ---")
    by_book = {}
    for book, chapter, _ in analysis['unavailable_chapters']:
        if book not in by_book:
            by_book[book] = []
        by_book[book].append(chapter)

    for book, chapters in sorted(by_book.items()):
        print(f"  {book}: chapters {', '.join(map(str, sorted(chapters)))}")

    print(f"\n--- DUPLICATE CHAPTERS ({len(analysis['duplicates'])}) ---")
    for key, info in sorted(analysis['duplicates'].items()):
        print(f"  {key}: appears {info['count']} times")

    return analysis

if __name__ == "__main__":
    base_path = Path(__file__).parent.parent
    input_file = base_path / "jewish_biblical_narrative_enhanced.md"
    output_file = base_path / "jewish_biblical_narrative_enhanced_fixed.md"

    # First, create a progress report
    print("Creating initial analysis report...")
    analysis = create_progress_report(input_file)

    # Ask user if they want to proceed
    print(f"\nThis will fetch approximately {len(analysis['unavailable_chapters'])} chapters from the API.")
    print("Estimated time: ~10-15 minutes (with rate limiting)")

    proceed = input("\nProceed with fix? (y/n): ").strip().lower()

    if proceed == 'y':
        result = fix_narrative_file(input_file, output_file)
        print(f"\nFixed file saved to: {output_file}")
        print(f"To replace original, run:")
        print(f"  mv {output_file} {input_file}")
    else:
        print("Aborted.")
