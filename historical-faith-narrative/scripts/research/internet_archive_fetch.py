"""
Internet Archive Fetch Module for Historical Faith Narrative.

This module provides functions to search and retrieve historical texts
from the Internet Archive, particularly Church Fathers writings and
other early Christian literature.

Uses the Internet Archive S3-like API and metadata API.
API Documentation: https://archive.org/developers/
"""
import os
import sys
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from urllib.parse import quote_plus

import requests

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    INTERNET_ARCHIVE_ACCESS_KEY,
    INTERNET_ARCHIVE_SECRET_KEY,
    INTERNET_ARCHIVE_BASE_URL,
    validate_config
)


@dataclass
class ArchiveItem:
    """Container for an Internet Archive item."""
    identifier: str
    title: str
    description: Optional[str] = None
    creator: Optional[str] = None
    date: Optional[str] = None
    collection: List[str] = field(default_factory=list)
    mediatype: Optional[str] = None
    downloads: int = 0
    files: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchResult:
    """Container for search results from Internet Archive."""
    query: str
    total: int
    items: List[ArchiveItem]
    raw_response: Dict[str, Any]


class RateLimiter:
    """Simple rate limiter for API requests."""

    def __init__(self, requests_per_second: float = 1.0):
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0

    def wait(self):
        """Wait if necessary to respect rate limits."""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request_time = time.time()


class InternetArchiveClient:
    """
    Client for the Internet Archive API.

    Attributes:
        access_key: IA S3 access key
        secret_key: IA S3 secret key
        base_url: API base URL
    """

    # Known collections for Church Fathers texts
    CHURCH_FATHERS_COLLECTIONS = [
        'antenicenefathers',
        'nicabornepost-nicene',
        'niceneandpost-nicenefathers',
        'churchfathers',
        'patristictexts'
    ]

    # Ante-Nicene Fathers volume identifiers
    ANF_VOLUMES = [
        'antenicenefathers01robe',
        'antenicenefathers02robe',
        'antenicenefathers03robe',
        'antenicenefathers04robe',
        'antenicenefathers05robe',
        'antenicenefathers06robe',
        'antenicenefathers07robe',
        'antenicenefathers08robe',
        'antenicenefathers09robe'
    ]

    # Nicene and Post-Nicene Fathers volume patterns
    NPNF_SERIES1_PATTERN = 'niceneandpost-nicene1-{:02d}'
    NPNF_SERIES2_PATTERN = 'niceneandpost-nicene2-{:02d}'

    def __init__(
        self,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        base_url: str = INTERNET_ARCHIVE_BASE_URL
    ):
        """
        Initialize the Internet Archive client.

        Args:
            access_key: Optional S3 access key (defaults to env variable)
            secret_key: Optional S3 secret key (defaults to env variable)
            base_url: API base URL
        """
        self.access_key = access_key or INTERNET_ARCHIVE_ACCESS_KEY
        self.secret_key = secret_key or INTERNET_ARCHIVE_SECRET_KEY
        self.base_url = base_url
        self.rate_limiter = RateLimiter(requests_per_second=1.0)

        self.session = requests.Session()
        if self.access_key and self.secret_key:
            self.session.auth = (self.access_key, self.secret_key)

    def _make_request(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a GET request to the API.

        Args:
            url: Full URL or endpoint
            params: Query parameters

        Returns:
            API response as dict or text
        """
        self.rate_limiter.wait()

        if not url.startswith('http'):
            url = f'{self.base_url}/{url}'

        response = self.session.get(url, params=params, timeout=60)
        response.raise_for_status()

        try:
            return response.json()
        except ValueError:
            return {'text': response.text}

    def _parse_item(self, data: Dict[str, Any]) -> ArchiveItem:
        """
        Parse search result into ArchiveItem.

        Args:
            data: Raw item data from API

        Returns:
            ArchiveItem object
        """
        # Handle both search results and metadata API responses
        if 'metadata' in data:
            meta = data['metadata']
            files = data.get('files', [])
        else:
            meta = data
            files = []

        # Handle fields that can be lists or strings
        def get_first(value):
            if isinstance(value, list):
                return value[0] if value else None
            return value

        collection = meta.get('collection', [])
        if isinstance(collection, str):
            collection = [collection]

        return ArchiveItem(
            identifier=get_first(meta.get('identifier', '')),
            title=get_first(meta.get('title', '')),
            description=get_first(meta.get('description')),
            creator=get_first(meta.get('creator')),
            date=get_first(meta.get('date')),
            collection=collection,
            mediatype=get_first(meta.get('mediatype')),
            downloads=int(meta.get('downloads', 0)),
            files=files,
            metadata=meta
        )

    def search_texts(
        self,
        query: str,
        collection: Optional[str] = None,
        mediatype: str = 'texts',
        rows: int = 50
    ) -> SearchResult:
        """
        Search the Internet Archive for texts.

        Args:
            query: Search query
            collection: Optional collection to search within
            mediatype: Media type filter (default: texts)
            rows: Number of results to return

        Returns:
            SearchResult with matching items

        Example:
            >>> result = client.search_texts("Augustine confessions")
        """
        # Build advanced search query
        search_parts = [query]

        if collection:
            search_parts.append(f'collection:{collection}')

        if mediatype:
            search_parts.append(f'mediatype:{mediatype}')

        full_query = ' AND '.join(f'({p})' for p in search_parts)

        params = {
            'q': full_query,
            'output': 'json',
            'rows': rows,
            'page': 1,
            'fl[]': ['identifier', 'title', 'creator', 'date', 'description',
                     'collection', 'mediatype', 'downloads']
        }

        data = self._make_request(
            'https://archive.org/advancedsearch.php',
            params
        )

        response = data.get('response', {})
        docs = response.get('docs', [])
        items = [self._parse_item(doc) for doc in docs]

        return SearchResult(
            query=query,
            total=response.get('numFound', len(items)),
            items=items,
            raw_response=data
        )

    def get_item_metadata(self, identifier: str) -> ArchiveItem:
        """
        Get full metadata for an item.

        Args:
            identifier: Internet Archive item identifier

        Returns:
            ArchiveItem with full metadata and file list
        """
        data = self._make_request(f'https://archive.org/metadata/{identifier}')
        return self._parse_item(data)

    def get_item_text(
        self,
        identifier: str,
        file_format: str = 'txt'
    ) -> Optional[str]:
        """
        Get the text content of an item.

        Args:
            identifier: Internet Archive item identifier
            file_format: Preferred file format (txt, pdf, etc.)

        Returns:
            Text content if available, None otherwise
        """
        # Get item metadata to find files
        item = self.get_item_metadata(identifier)

        # Look for text file
        text_file = None
        for f in item.files:
            name = f.get('name', '')
            if name.endswith(f'.{file_format}'):
                text_file = name
                break

        if not text_file:
            # Try to find any text-like file
            for f in item.files:
                name = f.get('name', '')
                fmt = f.get('format', '').lower()
                if 'text' in fmt or name.endswith('.txt'):
                    text_file = name
                    break

        if not text_file:
            return None

        # Download the file
        url = f'https://archive.org/download/{identifier}/{quote_plus(text_file)}'
        self.rate_limiter.wait()
        response = self.session.get(url, timeout=120)
        response.raise_for_status()

        return response.text

    def get_church_fathers(self, name: str) -> SearchResult:
        """
        Search for writings by a specific Church Father.

        Args:
            name: Name of the Church Father (e.g., "Augustine", "Chrysostom")

        Returns:
            SearchResult with matching texts

        Example:
            >>> result = client.get_church_fathers("John Chrysostom")
        """
        query = f'"{name}" AND (church OR father OR patristic OR christian)'
        return self.search_texts(query, mediatype='texts')

    def get_ante_nicene_fathers(self) -> List[ArchiveItem]:
        """
        Get the Ante-Nicene Fathers collection.

        The ANF is a 9-volume collection of writings from
        early Church Fathers before the Council of Nicaea (325 CE).

        Returns:
            List of ArchiveItem objects for each volume
        """
        items = []
        for identifier in self.ANF_VOLUMES:
            try:
                item = self.get_item_metadata(identifier)
                items.append(item)
            except requests.exceptions.HTTPError:
                # Volume might not exist with exact identifier
                continue

        # If exact identifiers don't work, search
        if not items:
            result = self.search_texts(
                'ante-nicene fathers',
                mediatype='texts',
                rows=20
            )
            items = result.items

        return items

    def get_nicene_fathers(
        self,
        series: int = 1
    ) -> List[ArchiveItem]:
        """
        Get the Nicene and Post-Nicene Fathers collection.

        The NPNF has two series:
        - Series 1: Augustine and Chrysostom (14 volumes)
        - Series 2: Other Fathers (14 volumes)

        Args:
            series: 1 or 2 for the series number

        Returns:
            List of ArchiveItem objects for each volume
        """
        if series == 1:
            pattern = self.NPNF_SERIES1_PATTERN
        else:
            pattern = self.NPNF_SERIES2_PATTERN

        items = []
        for vol in range(1, 15):
            identifier = pattern.format(vol)
            try:
                item = self.get_item_metadata(identifier)
                items.append(item)
            except requests.exceptions.HTTPError:
                continue

        # If exact identifiers don't work, search
        if not items:
            query = f'nicene post-nicene fathers series {series}'
            result = self.search_texts(query, mediatype='texts', rows=20)
            items = result.items

        return items

    def search_collection(
        self,
        collection: str,
        query: Optional[str] = None,
        rows: int = 50
    ) -> SearchResult:
        """
        Search within a specific collection.

        Args:
            collection: Collection identifier
            query: Optional additional search terms
            rows: Number of results

        Returns:
            SearchResult with items from the collection
        """
        search_query = query if query else '*'
        return self.search_texts(search_query, collection=collection, rows=rows)


# Convenience functions
def search_texts(query: str, collection: Optional[str] = None) -> SearchResult:
    """
    Search Internet Archive for texts.

    Convenience function that creates a client instance.

    Args:
        query: Search query
        collection: Optional collection filter

    Returns:
        SearchResult with matching items
    """
    client = InternetArchiveClient()
    return client.search_texts(query, collection)


def get_church_fathers(name: str) -> SearchResult:
    """
    Search for Church Father writings.

    Convenience function that creates a client instance.

    Args:
        name: Name of the Church Father

    Returns:
        SearchResult with matching texts
    """
    client = InternetArchiveClient()
    return client.get_church_fathers(name)


def get_ante_nicene_fathers() -> List[ArchiveItem]:
    """
    Get the Ante-Nicene Fathers collection.

    Convenience function that creates a client instance.

    Returns:
        List of ArchiveItem objects
    """
    client = InternetArchiveClient()
    return client.get_ante_nicene_fathers()


def get_nicene_fathers() -> List[ArchiveItem]:
    """
    Get the Nicene and Post-Nicene Fathers collection.

    Convenience function that creates a client instance.

    Returns:
        List of ArchiveItem objects
    """
    client = InternetArchiveClient()
    # Get both series
    series1 = client.get_nicene_fathers(series=1)
    series2 = client.get_nicene_fathers(series=2)
    return series1 + series2


def get_item_text(identifier: str) -> Optional[str]:
    """
    Get text content of an item.

    Convenience function that creates a client instance.

    Args:
        identifier: Internet Archive item identifier

    Returns:
        Text content if available
    """
    client = InternetArchiveClient()
    return client.get_item_text(identifier)


def test():
    """Test function demonstrating usage of Internet Archive fetch."""
    print("=" * 60)
    print("Internet Archive Fetch Test")
    print("=" * 60)

    # Check API keys (optional for public access)
    if INTERNET_ARCHIVE_ACCESS_KEY and INTERNET_ARCHIVE_SECRET_KEY:
        print("[OK] API keys configured (authenticated access)")
    else:
        print("[INFO] No API keys - using public access")

    client = InternetArchiveClient()
    print("[OK] Client initialized")

    # Test 1: Search texts
    print("\n" + "-" * 60)
    print("Test 1: Searching for 'Augustine Confessions'")
    print("-" * 60)

    try:
        result = client.search_texts("Augustine Confessions", rows=5)
        print(f"\nFound {result.total} items (showing {len(result.items)})")

        for i, item in enumerate(result.items, 1):
            print(f"\n{i}. {item.title}")
            print(f"   Identifier: {item.identifier}")
            if item.creator:
                print(f"   Creator: {item.creator}")
            if item.date:
                print(f"   Date: {item.date}")
            print(f"   Downloads: {item.downloads}")

        print("\n[OK] Search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 2: Get Church Fathers
    print("\n" + "-" * 60)
    print("Test 2: Searching for John Chrysostom writings")
    print("-" * 60)

    try:
        result = client.get_church_fathers("John Chrysostom")
        print(f"\nFound {result.total} items (showing {len(result.items[:3])})")

        for item in result.items[:3]:
            print(f"\n- {item.title}")
            if item.collection:
                print(f"  Collection: {item.collection[0]}")

        print("\n[OK] Church Fathers search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 3: Get item metadata
    if result.items:
        print("\n" + "-" * 60)
        print("Test 3: Getting metadata for first item")
        print("-" * 60)

        try:
            item = client.get_item_metadata(result.items[0].identifier)
            print(f"\nTitle: {item.title}")
            print(f"Identifier: {item.identifier}")
            print(f"Files available: {len(item.files)}")

            if item.files:
                print("File types:")
                formats = set()
                for f in item.files:
                    fmt = f.get('format', 'unknown')
                    formats.add(fmt)
                for fmt in list(formats)[:5]:
                    print(f"  - {fmt}")

            print("\n[OK] Metadata retrieved successfully")

        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] API request failed: {e}")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
