"""
OpenAlex Search Module for Historical Faith Narrative.

This module provides functions to search and retrieve scholarly metadata
from OpenAlex, a free and open catalog of the global research system.

No API key required - uses email for polite pool (higher rate limits).
API Documentation: https://docs.openalex.org/
"""
import os
import sys
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from urllib.parse import quote

import requests

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    openalex_client,
    RATE_LIMITS
)


@dataclass
class Work:
    """Container for a scholarly work from OpenAlex."""
    id: str
    title: str
    abstract: Optional[str] = None
    publication_year: Optional[int] = None
    publication_date: Optional[str] = None
    doi: Optional[str] = None
    type: Optional[str] = None
    cited_by_count: int = 0
    is_oa: bool = False
    oa_url: Optional[str] = None
    authors: List[Dict[str, Any]] = field(default_factory=list)
    primary_location: Optional[Dict[str, Any]] = None
    concepts: List[Dict[str, Any]] = field(default_factory=list)
    referenced_works: List[str] = field(default_factory=list)
    related_works: List[str] = field(default_factory=list)
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Author:
    """Container for an author from OpenAlex."""
    id: str
    display_name: str
    works_count: int = 0
    cited_by_count: int = 0
    orcid: Optional[str] = None
    affiliations: List[Dict[str, Any]] = field(default_factory=list)
    x_concepts: List[Dict[str, Any]] = field(default_factory=list)
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchResult:
    """Container for search results from OpenAlex."""
    query: str
    total: int
    count: int
    page: int
    per_page: int
    results: List[Any]  # Can be Work or Author
    raw_response: Dict[str, Any]


class RateLimiter:
    """Simple rate limiter for API requests."""

    def __init__(self, requests_per_second: float = 10.0):
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0

    def wait(self):
        """Wait if necessary to respect rate limits."""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request_time = time.time()


class OpenAlexClient:
    """
    Client for the OpenAlex API.

    OpenAlex is a free, open catalog of scholarly works and metadata.
    Using an email address enables access to the "polite pool" with
    higher rate limits.

    Attributes:
        email: Email for polite pool access
        base_url: API base URL
    """

    def __init__(
        self,
        email: Optional[str] = None,
        base_url: str = 'https://api.openalex.org'
    ):
        """
        Initialize the OpenAlex client.

        Args:
            email: Email address for polite pool
            base_url: API base URL
        """
        self.email = email or os.getenv('OPENALEX_EMAIL', 'research@example.com')
        self.base_url = base_url
        self.rate_limiter = RateLimiter(requests_per_second=10.0)

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

        if params is None:
            params = {}

        # Add email for polite pool
        if self.email and self.email != 'your@email.com':
            params['mailto'] = self.email

        url = f'{self.base_url}/{endpoint}'
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        return response.json()

    def _parse_work(self, data: Dict[str, Any]) -> Work:
        """
        Parse API response into Work object.

        Args:
            data: Raw work data from API

        Returns:
            Work object
        """
        # Parse authors
        authors = []
        for authorship in data.get('authorships', []):
            author = authorship.get('author', {})
            authors.append({
                'id': author.get('id', ''),
                'name': author.get('display_name', ''),
                'orcid': author.get('orcid'),
                'position': authorship.get('author_position', ''),
                'institutions': [
                    inst.get('display_name', '')
                    for inst in authorship.get('institutions', [])
                ]
            })

        # Check for open access
        oa_info = data.get('open_access', {})
        is_oa = oa_info.get('is_oa', False)
        oa_url = oa_info.get('oa_url')

        # Parse concepts
        concepts = []
        for concept in data.get('concepts', []):
            concepts.append({
                'id': concept.get('id', ''),
                'name': concept.get('display_name', ''),
                'level': concept.get('level', 0),
                'score': concept.get('score', 0)
            })

        # Get abstract from inverted index if available
        abstract = None
        abstract_index = data.get('abstract_inverted_index')
        if abstract_index:
            # Reconstruct abstract from inverted index
            word_positions = []
            for word, positions in abstract_index.items():
                for pos in positions:
                    word_positions.append((pos, word))
            word_positions.sort()
            abstract = ' '.join(word for _, word in word_positions)

        return Work(
            id=data.get('id', ''),
            title=data.get('title', ''),
            abstract=abstract,
            publication_year=data.get('publication_year'),
            publication_date=data.get('publication_date'),
            doi=data.get('doi'),
            type=data.get('type'),
            cited_by_count=data.get('cited_by_count', 0),
            is_oa=is_oa,
            oa_url=oa_url,
            authors=authors,
            primary_location=data.get('primary_location'),
            concepts=concepts,
            referenced_works=data.get('referenced_works', []),
            related_works=data.get('related_works', []),
            raw_data=data
        )

    def _parse_author(self, data: Dict[str, Any]) -> Author:
        """
        Parse API response into Author object.

        Args:
            data: Raw author data from API

        Returns:
            Author object
        """
        # Parse affiliations
        affiliations = []
        for aff in data.get('affiliations', []):
            institution = aff.get('institution', {})
            affiliations.append({
                'id': institution.get('id', ''),
                'name': institution.get('display_name', ''),
                'country': institution.get('country_code', ''),
                'years': aff.get('years', [])
            })

        # Parse concepts
        concepts = []
        for concept in data.get('x_concepts', []):
            concepts.append({
                'id': concept.get('id', ''),
                'name': concept.get('display_name', ''),
                'level': concept.get('level', 0),
                'score': concept.get('score', 0)
            })

        return Author(
            id=data.get('id', ''),
            display_name=data.get('display_name', ''),
            works_count=data.get('works_count', 0),
            cited_by_count=data.get('cited_by_count', 0),
            orcid=data.get('orcid'),
            affiliations=affiliations,
            x_concepts=concepts,
            raw_data=data
        )

    def search_works(
        self,
        query: str,
        limit: int = 25,
        page: int = 1,
        filter_params: Optional[Dict[str, str]] = None,
        sort: Optional[str] = None
    ) -> SearchResult:
        """
        Search for scholarly works.

        Args:
            query: Search query
            limit: Results per page (max 200)
            page: Page number
            filter_params: Additional filters (e.g., {'publication_year': '2020'})
            sort: Sort field (e.g., 'cited_by_count:desc')

        Returns:
            SearchResult with matching works

        Example:
            >>> result = client.search_works("church fathers patristic")
        """
        params = {
            'search': query,
            'per_page': min(limit, 200),
            'page': page
        }

        if filter_params:
            filter_str = ','.join(f'{k}:{v}' for k, v in filter_params.items())
            params['filter'] = filter_str

        if sort:
            params['sort'] = sort

        data = self._make_request('works', params)

        works = [self._parse_work(w) for w in data.get('results', [])]
        meta = data.get('meta', {})

        return SearchResult(
            query=query,
            total=meta.get('count', len(works)),
            count=len(works),
            page=meta.get('page', page),
            per_page=meta.get('per_page', limit),
            results=works,
            raw_response=data
        )

    def get_work(self, work_id: str) -> Work:
        """
        Get a specific work by ID.

        Args:
            work_id: OpenAlex work ID (with or without https://openalex.org/)

        Returns:
            Work object with full details
        """
        # Clean up ID
        if work_id.startswith('https://openalex.org/'):
            work_id = work_id.replace('https://openalex.org/', '')

        data = self._make_request(f'works/{work_id}')
        return self._parse_work(data)

    def get_author(self, author_id: str) -> Author:
        """
        Get information about an author.

        Args:
            author_id: OpenAlex author ID

        Returns:
            Author object with details

        Example:
            >>> author = client.get_author("A1969205032")
        """
        # Clean up ID
        if author_id.startswith('https://openalex.org/'):
            author_id = author_id.replace('https://openalex.org/', '')

        data = self._make_request(f'authors/{author_id}')
        return self._parse_author(data)

    def search_authors(
        self,
        query: str,
        limit: int = 25,
        page: int = 1
    ) -> SearchResult:
        """
        Search for authors.

        Args:
            query: Search query
            limit: Results per page
            page: Page number

        Returns:
            SearchResult with matching authors
        """
        params = {
            'search': query,
            'per_page': min(limit, 200),
            'page': page
        }

        data = self._make_request('authors', params)

        authors = [self._parse_author(a) for a in data.get('results', [])]
        meta = data.get('meta', {})

        return SearchResult(
            query=query,
            total=meta.get('count', len(authors)),
            count=len(authors),
            page=meta.get('page', page),
            per_page=meta.get('per_page', limit),
            results=authors,
            raw_response=data
        )

    def get_citations(
        self,
        work_id: str,
        limit: int = 25
    ) -> List[Work]:
        """
        Get works that cite a specific work.

        Args:
            work_id: OpenAlex work ID
            limit: Maximum citations to return

        Returns:
            List of Work objects that cite this work
        """
        # Clean up ID
        if not work_id.startswith('https://openalex.org/'):
            work_id = f'https://openalex.org/{work_id}'

        params = {
            'filter': f'cites:{work_id}',
            'per_page': min(limit, 200)
        }

        data = self._make_request('works', params)
        return [self._parse_work(w) for w in data.get('results', [])]

    def get_author_works(
        self,
        author_id: str,
        limit: int = 25,
        sort: str = 'cited_by_count:desc'
    ) -> List[Work]:
        """
        Get works by a specific author.

        Args:
            author_id: OpenAlex author ID
            limit: Maximum works to return
            sort: Sort order

        Returns:
            List of Work objects by this author
        """
        # Clean up ID
        if not author_id.startswith('https://openalex.org/'):
            author_id = f'https://openalex.org/{author_id}'

        params = {
            'filter': f'author.id:{author_id}',
            'per_page': min(limit, 200),
            'sort': sort
        }

        data = self._make_request('works', params)
        return [self._parse_work(w) for w in data.get('results', [])]


# Convenience functions
def search_works(query: str) -> SearchResult:
    """
    Search for scholarly works.

    Convenience function that creates a client instance.

    Args:
        query: Search query

    Returns:
        SearchResult with matching works
    """
    client = OpenAlexClient()
    return client.search_works(query)


def get_author(author_id: str) -> Author:
    """
    Get author information.

    Convenience function that creates a client instance.

    Args:
        author_id: OpenAlex author ID

    Returns:
        Author object with details
    """
    client = OpenAlexClient()
    return client.get_author(author_id)


def get_citations(work_id: str) -> List[Work]:
    """
    Get works that cite a specific work.

    Convenience function that creates a client instance.

    Args:
        work_id: OpenAlex work ID

    Returns:
        List of citing works
    """
    client = OpenAlexClient()
    return client.get_citations(work_id)


def test():
    """Test function demonstrating usage of OpenAlex search."""
    print("=" * 60)
    print("OpenAlex Search Test")
    print("=" * 60)

    email = os.getenv('OPENALEX_EMAIL', 'research@example.com')
    if email and email != 'your@email.com':
        print(f"[OK] Email configured for polite pool: {email}")
    else:
        print("[INFO] No email configured - using standard rate limits")

    client = OpenAlexClient(email=email)
    print("[OK] Client initialized")

    # Test 1: Search works
    print("\n" + "-" * 60)
    print("Test 1: Searching for 'Augustine of Hippo theology'")
    print("-" * 60)

    try:
        result = client.search_works("Augustine of Hippo theology", limit=5)
        print(f"\nFound {result.total} works (showing {len(result.results)})")

        for i, work in enumerate(result.results, 1):
            print(f"\n{i}. {work.title}")
            print(f"   Year: {work.publication_year}")
            print(f"   Citations: {work.cited_by_count}")
            if work.authors:
                author_names = [a['name'] for a in work.authors[:2]]
                print(f"   Authors: {', '.join(author_names)}")
            if work.is_oa:
                print(f"   Open Access: Yes")

        print("\n[OK] Search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 2: Search authors
    print("\n" + "-" * 60)
    print("Test 2: Searching for authors studying 'early Christianity'")
    print("-" * 60)

    try:
        result = client.search_authors("early Christianity", limit=5)
        print(f"\nFound {result.total} authors (showing {len(result.results)})")

        for i, author in enumerate(result.results, 1):
            print(f"\n{i}. {author.display_name}")
            print(f"   Works: {author.works_count}")
            print(f"   Citations: {author.cited_by_count}")
            if author.affiliations:
                print(f"   Affiliation: {author.affiliations[0]['name']}")

        print("\n[OK] Author search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 3: Get work details and citations
    if result.results:
        print("\n" + "-" * 60)
        print("Test 3: Getting citations for a work")
        print("-" * 60)

        try:
            # First get a work to find citations for
            works_result = client.search_works("council of nicaea", limit=1)
            if works_result.results:
                work = works_result.results[0]
                print(f"\nWork: {work.title}")
                print(f"ID: {work.id}")
                print(f"Total citations: {work.cited_by_count}")

                # Get citing works
                citations = client.get_citations(work.id, limit=3)
                if citations:
                    print(f"\nCiting works ({len(citations)} shown):")
                    for citing in citations:
                        print(f"  - {citing.title} ({citing.publication_year})")

                print("\n[OK] Citations retrieved successfully")

        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] API request failed: {e}")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
