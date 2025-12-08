"""
CORE Search Module for Historical Faith Narrative.

This module provides functions to search and retrieve open access papers
from CORE (COnnecting REpositories), which aggregates research outputs
from institutional and subject repositories worldwide.

API Documentation: https://core.ac.uk/services/api
"""
import os
import sys
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field

import requests

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    core_client,
    validate_config
)


@dataclass
class CorePaper:
    """Container for a paper from CORE."""
    id: str
    title: str
    abstract: Optional[str] = None
    authors: List[str] = field(default_factory=list)
    year: Optional[int] = None
    published_date: Optional[str] = None
    doi: Optional[str] = None
    download_url: Optional[str] = None
    source_fulltext_urls: List[str] = field(default_factory=list)
    language: Optional[str] = None
    publisher: Optional[str] = None
    journals: List[str] = field(default_factory=list)
    subjects: List[str] = field(default_factory=list)
    full_text: Optional[str] = None
    has_full_text: bool = False
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchResult:
    """Container for search results from CORE."""
    query: str
    total_hits: int
    limit: int
    offset: int
    papers: List[CorePaper]
    raw_response: Dict[str, Any]


class RateLimiter:
    """Simple rate limiter for API requests."""

    def __init__(self, requests_per_second: float = 0.5):
        """
        Initialize rate limiter.

        CORE API has strict rate limits - use conservative defaults.
        """
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0

    def wait(self):
        """Wait if necessary to respect rate limits."""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request_time = time.time()


class COREClient:
    """
    Client for the CORE API.

    CORE provides access to millions of open access research papers
    from repositories worldwide.

    Attributes:
        api_key: CORE API key
        base_url: API base URL
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = 'https://api.core.ac.uk/v3'
    ):
        """
        Initialize the CORE client.

        Args:
            api_key: Optional API key (defaults to env variable)
            base_url: API base URL
        """
        self.api_key = api_key or os.getenv('CORE_API_KEY')
        self.base_url = base_url
        self.rate_limiter = RateLimiter(requests_per_second=0.5)

        if not self.api_key:
            raise ValueError("CORE API key is required")

        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Accept': 'application/json'
        }

    def _make_request(
        self,
        endpoint: str,
        method: str = 'GET',
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the API.

        Args:
            endpoint: API endpoint path
            method: HTTP method
            params: Query parameters
            json_data: JSON body for POST requests

        Returns:
            API response as dict
        """
        self.rate_limiter.wait()

        url = f'{self.base_url}/{endpoint}'

        if method == 'GET':
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=60
            )
        else:
            response = requests.post(
                url,
                headers=self.headers,
                json=json_data,
                timeout=60
            )

        response.raise_for_status()
        return response.json()

    def _parse_paper(self, data: Dict[str, Any]) -> CorePaper:
        """
        Parse API response into CorePaper object.

        Args:
            data: Raw paper data from API

        Returns:
            CorePaper object
        """
        # Handle different API response formats
        authors = []
        author_data = data.get('authors', [])
        for author in author_data:
            if isinstance(author, dict):
                authors.append(author.get('name', ''))
            elif isinstance(author, str):
                authors.append(author)

        # Get year from various fields
        year = data.get('yearPublished')
        if not year and data.get('publishedDate'):
            try:
                year = int(data['publishedDate'][:4])
            except (ValueError, TypeError):
                pass

        # Get full text URLs
        source_urls = data.get('sourceFulltextUrls', [])
        if isinstance(source_urls, str):
            source_urls = [source_urls]

        download_url = data.get('downloadUrl')
        if not download_url and source_urls:
            download_url = source_urls[0]

        # Check for full text
        full_text = data.get('fullText')
        has_full_text = bool(full_text) or data.get('hasFullText', False)

        return CorePaper(
            id=str(data.get('id', '')),
            title=data.get('title', ''),
            abstract=data.get('abstract'),
            authors=authors,
            year=year,
            published_date=data.get('publishedDate'),
            doi=data.get('doi'),
            download_url=download_url,
            source_fulltext_urls=source_urls,
            language=data.get('language', {}).get('code') if isinstance(data.get('language'), dict) else data.get('language'),
            publisher=data.get('publisher'),
            journals=data.get('journals', []),
            subjects=data.get('subjects', []),
            full_text=full_text,
            has_full_text=has_full_text,
            raw_data=data
        )

    def search_papers(
        self,
        query: str,
        limit: int = 10,
        offset: int = 0,
        filters: Optional[Dict[str, Any]] = None
    ) -> SearchResult:
        """
        Search for open access papers.

        Args:
            query: Search query
            limit: Maximum results (max 100)
            offset: Result offset for pagination
            filters: Optional filters (e.g., {'year': 2020})

        Returns:
            SearchResult with matching papers

        Example:
            >>> result = client.search_papers("church fathers")
        """
        # Build query with filters
        search_query = query
        if filters:
            filter_parts = []
            for key, value in filters.items():
                filter_parts.append(f'{key}:{value}')
            if filter_parts:
                search_query = f'{query} AND {" AND ".join(filter_parts)}'

        params = {
            'q': search_query,
            'limit': min(limit, 100),
            'offset': offset
        }

        data = self._make_request('search/works', params=params)

        papers = [self._parse_paper(p) for p in data.get('results', [])]

        return SearchResult(
            query=query,
            total_hits=data.get('totalHits', len(papers)),
            limit=limit,
            offset=offset,
            papers=papers,
            raw_response=data
        )

    def get_paper(self, paper_id: str) -> CorePaper:
        """
        Get details for a specific paper.

        Args:
            paper_id: CORE paper ID

        Returns:
            CorePaper with full details

        Example:
            >>> paper = client.get_paper("123456789")
        """
        data = self._make_request(f'works/{paper_id}')
        return self._parse_paper(data)

    def get_full_text(self, paper_id: str) -> Optional[str]:
        """
        Get the full text of a paper if available.

        Args:
            paper_id: CORE paper ID

        Returns:
            Full text content if available, None otherwise
        """
        try:
            paper = self.get_paper(paper_id)
            if paper.full_text:
                return paper.full_text

            # Try to fetch from download URL
            if paper.download_url:
                self.rate_limiter.wait()
                response = requests.get(
                    paper.download_url,
                    timeout=60
                )
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'text' in content_type:
                        return response.text

            return None

        except requests.exceptions.HTTPError:
            return None

    def search_by_doi(self, doi: str) -> Optional[CorePaper]:
        """
        Search for a paper by DOI.

        Args:
            doi: Digital Object Identifier

        Returns:
            CorePaper if found, None otherwise
        """
        # Clean up DOI
        doi = doi.replace('https://doi.org/', '')
        doi = doi.replace('http://dx.doi.org/', '')

        result = self.search_papers(f'doi:"{doi}"', limit=1)
        if result.papers:
            return result.papers[0]
        return None

    def search_by_title(self, title: str) -> SearchResult:
        """
        Search for papers by title.

        Args:
            title: Paper title

        Returns:
            SearchResult with matching papers
        """
        return self.search_papers(f'title:"{title}"')

    def search_by_author(
        self,
        author: str,
        limit: int = 20
    ) -> SearchResult:
        """
        Search for papers by author name.

        Args:
            author: Author name
            limit: Maximum results

        Returns:
            SearchResult with papers by this author
        """
        return self.search_papers(f'authors:"{author}"', limit=limit)

    def get_similar_papers(
        self,
        paper_id: str,
        limit: int = 10
    ) -> List[CorePaper]:
        """
        Get papers similar to a given paper.

        Args:
            paper_id: CORE paper ID
            limit: Maximum similar papers

        Returns:
            List of similar CorePaper objects
        """
        params = {'limit': min(limit, 100)}

        try:
            data = self._make_request(f'works/{paper_id}/similar', params=params)
            return [self._parse_paper(p) for p in data.get('results', [])]
        except requests.exceptions.HTTPError:
            return []


# Convenience functions
def search_papers(query: str) -> SearchResult:
    """
    Search for open access papers.

    Convenience function that creates a client instance.

    Args:
        query: Search query

    Returns:
        SearchResult with matching papers
    """
    client = COREClient()
    return client.search_papers(query)


def get_paper(paper_id: str) -> CorePaper:
    """
    Get paper details.

    Convenience function that creates a client instance.

    Args:
        paper_id: CORE paper ID

    Returns:
        CorePaper with details
    """
    client = COREClient()
    return client.get_paper(paper_id)


def get_full_text(paper_id: str) -> Optional[str]:
    """
    Get full text of a paper.

    Convenience function that creates a client instance.

    Args:
        paper_id: CORE paper ID

    Returns:
        Full text if available
    """
    client = COREClient()
    return client.get_full_text(paper_id)


def test():
    """Test function demonstrating usage of CORE search."""
    print("=" * 60)
    print("CORE Search Test")
    print("=" * 60)

    try:
        validate_config('CORE_API_KEY')
        print("[OK] API key configured")
    except ValueError as e:
        print(f"[ERROR] {e}")
        print("Please set CORE_API_KEY in your .env file")
        return

    client = COREClient()
    print("[OK] Client initialized")

    # Test 1: Search papers
    print("\n" + "-" * 60)
    print("Test 1: Searching for 'early church fathers'")
    print("-" * 60)

    try:
        result = client.search_papers("early church fathers", limit=5)
        print(f"\nFound {result.total_hits} papers (showing {len(result.papers)})")

        for i, paper in enumerate(result.papers, 1):
            print(f"\n{i}. {paper.title}")
            if paper.year:
                print(f"   Year: {paper.year}")
            if paper.authors:
                print(f"   Authors: {', '.join(paper.authors[:3])}")
            print(f"   Has full text: {paper.has_full_text}")
            if paper.doi:
                print(f"   DOI: {paper.doi}")

        print("\n[OK] Search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
        if e.response:
            print(f"   Response: {e.response.text[:200]}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 2: Get paper details
    if result.papers:
        print("\n" + "-" * 60)
        print("Test 2: Getting details for first paper")
        print("-" * 60)

        try:
            paper = client.get_paper(result.papers[0].id)
            print(f"\nTitle: {paper.title}")
            print(f"ID: {paper.id}")

            if paper.abstract:
                print(f"\nAbstract: {paper.abstract[:300]}...")

            if paper.download_url:
                print(f"\nDownload URL: {paper.download_url}")

            if paper.subjects:
                print(f"\nSubjects: {', '.join(paper.subjects[:5])}")

            print("\n[OK] Paper details retrieved successfully")

        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] API request failed: {e}")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")

    # Test 3: Search by author
    print("\n" + "-" * 60)
    print("Test 3: Searching for papers by author")
    print("-" * 60)

    try:
        result = client.search_by_author("Augustine", limit=3)
        print(f"\nFound {result.total_hits} papers (showing {len(result.papers)})")

        for paper in result.papers:
            print(f"\n- {paper.title}")
            if paper.authors:
                print(f"  Authors: {', '.join(paper.authors[:2])}")

        print("\n[OK] Author search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 4: Get full text (if available)
    print("\n" + "-" * 60)
    print("Test 4: Attempting to get full text")
    print("-" * 60)

    try:
        # Find a paper with full text
        result = client.search_papers("church history open access", limit=5)
        paper_with_text = None

        for paper in result.papers:
            if paper.has_full_text:
                paper_with_text = paper
                break

        if paper_with_text:
            print(f"\nPaper: {paper_with_text.title}")
            full_text = client.get_full_text(paper_with_text.id)

            if full_text:
                print(f"\nFull text length: {len(full_text)} characters")
                print(f"\nPreview: {full_text[:500]}...")
            else:
                print("\n[INFO] Full text not directly accessible")

            print("\n[OK] Full text check completed")
        else:
            print("\n[INFO] No papers with accessible full text in results")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
