"""
Bible Fetch Module for Historical Faith Narrative.

This module provides functions to retrieve Bible passages from API.Bible,
which offers access to 2,500+ Bible versions in multiple languages.

API Documentation: https://scripture.api.bible/
"""
import os
import sys
import re
import time
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, field

import requests

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    api_bible_client,
    validate_config
)


@dataclass
class BibleVersion:
    """Container for Bible version information."""
    id: str
    name: str
    abbreviation: str
    language: str
    description: Optional[str] = None
    copyright: Optional[str] = None


@dataclass
class BiblePassage:
    """Container for a Bible passage."""
    reference: str
    content: str
    version_id: str
    version_name: str
    book_id: str
    chapter_start: int
    verse_start: int
    chapter_end: Optional[int] = None
    verse_end: Optional[int] = None
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchHit:
    """Container for a search result hit."""
    reference: str
    text: str
    book_id: str
    chapter: int
    verse: int


@dataclass
class SearchResult:
    """Container for Bible search results."""
    query: str
    version_id: str
    total: int
    hits: List[SearchHit]
    raw_response: Dict[str, Any]


class RateLimiter:
    """Simple rate limiter for API requests."""

    def __init__(self, requests_per_minute: int = 100):
        self.requests_per_minute = requests_per_minute
        self.min_interval = 60.0 / requests_per_minute
        self.last_request_time = 0

    def wait(self):
        """Wait if necessary to respect rate limits."""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request_time = time.time()


class BibleClient:
    """
    Client for API.Bible.

    Attributes:
        api_key: API.Bible key
        base_url: API base URL
    """

    # Default Bible version IDs
    DEFAULT_VERSIONS = {
        'KJV': 'de4e12af7f28f599-02',  # King James Version
        'ESV': '9879dbb7cfe39e4d-01',   # English Standard Version
        'NIV': '78a9f6124f344018-01',   # New International Version (may vary)
        'ASV': '06125adad2d5898a-01',   # American Standard Version
        'WEB': '9879dbb7cfe39e4d-04',   # World English Bible
    }

    # Book name to ID mapping (standard abbreviations)
    BOOK_IDS = {
        # Old Testament
        'genesis': 'GEN', 'gen': 'GEN',
        'exodus': 'EXO', 'exo': 'EXO', 'ex': 'EXO',
        'leviticus': 'LEV', 'lev': 'LEV',
        'numbers': 'NUM', 'num': 'NUM',
        'deuteronomy': 'DEU', 'deut': 'DEU', 'deu': 'DEU',
        'joshua': 'JOS', 'jos': 'JOS', 'josh': 'JOS',
        'judges': 'JDG', 'judg': 'JDG', 'jdg': 'JDG',
        'ruth': 'RUT', 'rut': 'RUT',
        '1 samuel': '1SA', '1samuel': '1SA', '1sam': '1SA', '1sa': '1SA',
        '2 samuel': '2SA', '2samuel': '2SA', '2sam': '2SA', '2sa': '2SA',
        '1 kings': '1KI', '1kings': '1KI', '1kgs': '1KI', '1ki': '1KI',
        '2 kings': '2KI', '2kings': '2KI', '2kgs': '2KI', '2ki': '2KI',
        '1 chronicles': '1CH', '1chronicles': '1CH', '1chr': '1CH', '1ch': '1CH',
        '2 chronicles': '2CH', '2chronicles': '2CH', '2chr': '2CH', '2ch': '2CH',
        'ezra': 'EZR', 'ezr': 'EZR',
        'nehemiah': 'NEH', 'neh': 'NEH',
        'esther': 'EST', 'est': 'EST',
        'job': 'JOB',
        'psalms': 'PSA', 'psalm': 'PSA', 'psa': 'PSA', 'ps': 'PSA',
        'proverbs': 'PRO', 'prov': 'PRO', 'pro': 'PRO',
        'ecclesiastes': 'ECC', 'eccl': 'ECC', 'ecc': 'ECC',
        'song of solomon': 'SNG', 'song': 'SNG', 'sos': 'SNG', 'sng': 'SNG',
        'isaiah': 'ISA', 'isa': 'ISA',
        'jeremiah': 'JER', 'jer': 'JER',
        'lamentations': 'LAM', 'lam': 'LAM',
        'ezekiel': 'EZK', 'ezek': 'EZK', 'ezk': 'EZK',
        'daniel': 'DAN', 'dan': 'DAN',
        'hosea': 'HOS', 'hos': 'HOS',
        'joel': 'JOL', 'jol': 'JOL',
        'amos': 'AMO', 'amo': 'AMO',
        'obadiah': 'OBA', 'oba': 'OBA', 'obad': 'OBA',
        'jonah': 'JON', 'jon': 'JON',
        'micah': 'MIC', 'mic': 'MIC',
        'nahum': 'NAM', 'nah': 'NAM', 'nam': 'NAM',
        'habakkuk': 'HAB', 'hab': 'HAB',
        'zephaniah': 'ZEP', 'zeph': 'ZEP', 'zep': 'ZEP',
        'haggai': 'HAG', 'hag': 'HAG',
        'zechariah': 'ZEC', 'zech': 'ZEC', 'zec': 'ZEC',
        'malachi': 'MAL', 'mal': 'MAL',
        # New Testament
        'matthew': 'MAT', 'matt': 'MAT', 'mat': 'MAT',
        'mark': 'MRK', 'mrk': 'MRK',
        'luke': 'LUK', 'luk': 'LUK',
        'john': 'JHN', 'jhn': 'JHN',
        'acts': 'ACT', 'act': 'ACT',
        'romans': 'ROM', 'rom': 'ROM',
        '1 corinthians': '1CO', '1corinthians': '1CO', '1cor': '1CO', '1co': '1CO',
        '2 corinthians': '2CO', '2corinthians': '2CO', '2cor': '2CO', '2co': '2CO',
        'galatians': 'GAL', 'gal': 'GAL',
        'ephesians': 'EPH', 'eph': 'EPH',
        'philippians': 'PHP', 'phil': 'PHP', 'php': 'PHP',
        'colossians': 'COL', 'col': 'COL',
        '1 thessalonians': '1TH', '1thessalonians': '1TH', '1thess': '1TH', '1th': '1TH',
        '2 thessalonians': '2TH', '2thessalonians': '2TH', '2thess': '2TH', '2th': '2TH',
        '1 timothy': '1TI', '1timothy': '1TI', '1tim': '1TI', '1ti': '1TI',
        '2 timothy': '2TI', '2timothy': '2TI', '2tim': '2TI', '2ti': '2TI',
        'titus': 'TIT', 'tit': 'TIT',
        'philemon': 'PHM', 'phlm': 'PHM', 'phm': 'PHM',
        'hebrews': 'HEB', 'heb': 'HEB',
        'james': 'JAS', 'jas': 'JAS',
        '1 peter': '1PE', '1peter': '1PE', '1pet': '1PE', '1pe': '1PE',
        '2 peter': '2PE', '2peter': '2PE', '2pet': '2PE', '2pe': '2PE',
        '1 john': '1JN', '1john': '1JN', '1jn': '1JN',
        '2 john': '2JN', '2john': '2JN', '2jn': '2JN',
        '3 john': '3JN', '3john': '3JN', '3jn': '3JN',
        'jude': 'JUD', 'jud': 'JUD',
        'revelation': 'REV', 'rev': 'REV',
    }

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Bible client.

        Args:
            api_key: Optional API key (defaults to env variable)
        """
        self.api_key = api_key or os.getenv('API_BIBLE_KEY')
        self.base_url = os.getenv('API_BIBLE_URL', 'https://api.scripture.api.bible/v1')
        self.rate_limiter = RateLimiter(requests_per_minute=100)

        if not self.api_key:
            raise ValueError("API.Bible key is required")

        self.headers = {
            'api-key': self.api_key,
            'Accept': 'application/json'
        }

    def _make_request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a GET request to the API.

        Args:
            endpoint: API endpoint path
            params: Query parameters

        Returns:
            API response as dict
        """
        self.rate_limiter.wait()

        url = f'{self.base_url}/{endpoint}'
        response = requests.get(
            url,
            headers=self.headers,
            params=params,
            timeout=30
        )

        response.raise_for_status()
        return response.json()

    def get_available_versions(self) -> List[BibleVersion]:
        """
        Get a list of all available Bible versions.

        Returns:
            List of BibleVersion objects
        """
        data = self._make_request('bibles')

        versions = []
        for bible in data.get('data', []):
            versions.append(BibleVersion(
                id=bible.get('id', ''),
                name=bible.get('name', ''),
                abbreviation=bible.get('abbreviation', ''),
                language=bible.get('language', {}).get('name', ''),
                description=bible.get('description'),
                copyright=bible.get('copyright')
            ))

        return versions

    def parse_reference(self, reference: str) -> Dict[str, Any]:
        """
        Parse a Bible reference into API format.

        Args:
            reference: Human-readable reference (e.g., "John 3:16", "Romans 13:1-7")

        Returns:
            Dict with book_id, chapter, verse_start, verse_end

        Example:
            >>> client.parse_reference("John 3:16")
            {'book_id': 'JHN', 'chapter': 3, 'verse_start': 16, 'verse_end': 16}
        """
        # Clean up reference
        ref = reference.strip()

        # Pattern: Book Chapter:Verse or Book Chapter:Verse-Verse
        # Handle books with numbers like "1 John"
        pattern = r'^(\d?\s*[a-zA-Z]+)\s+(\d+):(\d+)(?:-(\d+))?$'
        match = re.match(pattern, ref)

        if not match:
            # Try chapter-only pattern: Book Chapter
            chapter_pattern = r'^(\d?\s*[a-zA-Z]+)\s+(\d+)$'
            chapter_match = re.match(chapter_pattern, ref)
            if chapter_match:
                book_name = chapter_match.group(1).lower().strip()
                chapter = int(chapter_match.group(2))
                book_id = self.BOOK_IDS.get(book_name)
                if not book_id:
                    raise ValueError(f"Unknown book: {book_name}")
                return {
                    'book_id': book_id,
                    'chapter': chapter,
                    'verse_start': None,
                    'verse_end': None,
                    'passage_id': f'{book_id}.{chapter}'
                }
            raise ValueError(f"Cannot parse reference: {reference}")

        book_name = match.group(1).lower().strip()
        chapter = int(match.group(2))
        verse_start = int(match.group(3))
        verse_end = int(match.group(4)) if match.group(4) else verse_start

        book_id = self.BOOK_IDS.get(book_name)
        if not book_id:
            raise ValueError(f"Unknown book: {book_name}")

        # Build passage ID
        if verse_start == verse_end:
            passage_id = f'{book_id}.{chapter}.{verse_start}'
        else:
            passage_id = f'{book_id}.{chapter}.{verse_start}-{book_id}.{chapter}.{verse_end}'

        return {
            'book_id': book_id,
            'chapter': chapter,
            'verse_start': verse_start,
            'verse_end': verse_end,
            'passage_id': passage_id
        }

    def get_passage(
        self,
        reference: str,
        version: str = 'KJV',
        content_type: str = 'text'
    ) -> BiblePassage:
        """
        Get a Bible passage by reference.

        Args:
            reference: Human-readable reference (e.g., "John 3:16")
            version: Version abbreviation or ID
            content_type: 'text', 'html', or 'json'

        Returns:
            BiblePassage with the requested text

        Example:
            >>> passage = client.get_passage("Romans 13:1-7", "KJV")
        """
        # Get version ID
        if version.upper() in self.DEFAULT_VERSIONS:
            version_id = self.DEFAULT_VERSIONS[version.upper()]
        else:
            version_id = version

        # Parse reference
        parsed = self.parse_reference(reference)

        # Make request
        params = {
            'content-type': content_type,
            'include-notes': 'false',
            'include-titles': 'true',
            'include-chapter-numbers': 'false',
            'include-verse-numbers': 'true'
        }

        data = self._make_request(
            f'bibles/{version_id}/passages/{parsed["passage_id"]}',
            params
        )

        passage_data = data.get('data', {})
        content = passage_data.get('content', '')

        # Clean up content (remove HTML tags if present)
        if content_type == 'text':
            content = re.sub(r'<[^>]+>', '', content)
            content = re.sub(r'\s+', ' ', content).strip()

        return BiblePassage(
            reference=passage_data.get('reference', reference),
            content=content,
            version_id=version_id,
            version_name=version,
            book_id=parsed['book_id'],
            chapter_start=parsed['chapter'],
            verse_start=parsed['verse_start'],
            chapter_end=parsed['chapter'],
            verse_end=parsed['verse_end'],
            raw_data=passage_data
        )

    def search(
        self,
        query: str,
        version: str = 'KJV',
        limit: int = 20
    ) -> SearchResult:
        """
        Search the Bible for text.

        Args:
            query: Search query
            version: Version abbreviation or ID
            limit: Maximum results

        Returns:
            SearchResult with matching passages
        """
        # Get version ID
        if version.upper() in self.DEFAULT_VERSIONS:
            version_id = self.DEFAULT_VERSIONS[version.upper()]
        else:
            version_id = version

        params = {
            'query': query,
            'limit': limit
        }

        data = self._make_request(
            f'bibles/{version_id}/search',
            params
        )

        search_data = data.get('data', {})
        verses = search_data.get('verses', [])

        hits = []
        for verse in verses:
            hits.append(SearchHit(
                reference=verse.get('reference', ''),
                text=verse.get('text', ''),
                book_id=verse.get('bookId', ''),
                chapter=verse.get('chapterIds', [''])[0] if verse.get('chapterIds') else 0,
                verse=0  # API doesn't always provide this directly
            ))

        return SearchResult(
            query=query,
            version_id=version_id,
            total=search_data.get('total', len(hits)),
            hits=hits,
            raw_response=data
        )

    def get_chapter(
        self,
        book: str,
        chapter: int,
        version: str = 'KJV'
    ) -> BiblePassage:
        """
        Get an entire chapter.

        Args:
            book: Book name
            chapter: Chapter number
            version: Version abbreviation

        Returns:
            BiblePassage with the chapter text
        """
        reference = f'{book} {chapter}'
        return self.get_passage(reference, version)


# Convenience functions
def get_passage(reference: str, version: str = 'KJV') -> BiblePassage:
    """
    Get a Bible passage.

    Convenience function that creates a client instance.

    Args:
        reference: Bible reference
        version: Version abbreviation

    Returns:
        BiblePassage with the requested text
    """
    client = BibleClient()
    return client.get_passage(reference, version)


def search(query: str, version: str = 'KJV') -> SearchResult:
    """
    Search the Bible.

    Convenience function that creates a client instance.

    Args:
        query: Search query
        version: Version abbreviation

    Returns:
        SearchResult with matching passages
    """
    client = BibleClient()
    return client.search(query, version)


def get_available_versions() -> List[BibleVersion]:
    """
    Get available Bible versions.

    Convenience function that creates a client instance.

    Returns:
        List of BibleVersion objects
    """
    client = BibleClient()
    return client.get_available_versions()


def parse_reference(reference: str) -> Dict[str, Any]:
    """
    Parse a Bible reference.

    Convenience function that creates a client instance.

    Args:
        reference: Human-readable reference

    Returns:
        Dict with parsed reference components
    """
    client = BibleClient()
    return client.parse_reference(reference)


def test():
    """Test function demonstrating usage of Bible fetch."""
    print("=" * 60)
    print("Bible Fetch Test")
    print("=" * 60)

    try:
        validate_config('API_BIBLE_KEY')
        print("[OK] API key configured")
    except ValueError as e:
        print(f"[ERROR] {e}")
        print("Please set API_BIBLE_KEY in your .env file")
        return

    client = BibleClient()
    print("[OK] Client initialized")

    # Test 1: Get available versions
    print("\n" + "-" * 60)
    print("Test 1: Getting available Bible versions")
    print("-" * 60)

    try:
        versions = client.get_available_versions()
        print(f"\nFound {len(versions)} versions")

        # Show first 5 English versions
        english = [v for v in versions if 'English' in v.language][:5]
        print("\nSample English versions:")
        for v in english:
            print(f"  - {v.abbreviation}: {v.name}")

        print("\n[OK] Versions retrieved successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 2: Get a passage
    print("\n" + "-" * 60)
    print("Test 2: Getting John 3:16 (KJV)")
    print("-" * 60)

    try:
        passage = client.get_passage("John 3:16", "KJV")
        print(f"\nReference: {passage.reference}")
        print(f"Version: {passage.version_name}")
        print(f"\nText:\n{passage.content}")

        print("\n[OK] Passage retrieved successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 3: Get a multi-verse passage
    print("\n" + "-" * 60)
    print("Test 3: Getting Romans 13:1-7 (KJV)")
    print("-" * 60)

    try:
        passage = client.get_passage("Romans 13:1-7", "KJV")
        print(f"\nReference: {passage.reference}")
        print(f"\nText:\n{passage.content[:500]}...")

        print("\n[OK] Multi-verse passage retrieved successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 4: Search
    print("\n" + "-" * 60)
    print("Test 4: Searching for 'love your neighbor'")
    print("-" * 60)

    try:
        result = client.search("love your neighbor", limit=5)
        print(f"\nFound {result.total} results (showing {len(result.hits)})")

        for i, hit in enumerate(result.hits[:5], 1):
            print(f"\n{i}. {hit.reference}")
            print(f"   {hit.text[:100]}...")

        print("\n[OK] Search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 5: Parse reference
    print("\n" + "-" * 60)
    print("Test 5: Testing reference parsing")
    print("-" * 60)

    test_refs = [
        "John 3:16",
        "Romans 13:1-7",
        "1 John 4:8",
        "Psalm 23",
        "Genesis 1:1"
    ]

    for ref in test_refs:
        try:
            parsed = client.parse_reference(ref)
            print(f"\n'{ref}' -> {parsed['passage_id']}")
        except ValueError as e:
            print(f"\n'{ref}' -> Error: {e}")

    print("\n[OK] Reference parsing completed")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
