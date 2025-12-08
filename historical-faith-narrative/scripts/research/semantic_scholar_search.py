"""
Semantic Scholar Search Module for Historical Faith Narrative.

This module provides functions to search and retrieve academic papers
from Semantic Scholar's database of scientific literature.

Rate limit: 1 request per second for authenticated requests.
API Documentation: https://api.semanticscholar.org/
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
    SEMANTIC_SCHOLAR_API_KEY,
    SEMANTIC_SCHOLAR_BASE_URL,
    SEMANTIC_SCHOLAR_RPS,
    validate_config
)


@dataclass
class Paper:
    """Container for paper information from Semantic Scholar."""
    paper_id: str
    title: str
    abstract: Optional[str] = None
    year: Optional[int] = None
    authors: List[Dict[str, str]] = field(default_factory=list)
    venue: Optional[str] = None
    citation_count: int = 0
    reference_count: int = 0
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    fields_of_study: List[str] = field(default_factory=list)
    tldr: Optional[str] = None
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchResult:
    """Container for search results from Semantic Scholar."""
    query: str
    total: int
    offset: int
    papers: List[Paper]
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


class SemanticScholarClient:
    """
    Client for the Semantic Scholar API.

    Attributes:
        api_key: Semantic Scholar API key
        base_url: API base URL
    """

    # Fields to request for paper details
    PAPER_FIELDS = [
        'paperId', 'title', 'abstract', 'year', 'authors',
        'venue', 'citationCount', 'referenceCount', 'url',
        'openAccessPdf', 'fieldsOfStudy', 'tldr'
    ]

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = SEMANTIC_SCHOLAR_BASE_URL
    ):
        """
        Initialize the Semantic Scholar client.

        Args:
            api_key: Optional API key (defaults to env variable)
            base_url: API base URL
        """
        self.api_key = api_key or SEMANTIC_SCHOLAR_API_KEY
        self.base_url = base_url
        self.rate_limiter = RateLimiter(SEMANTIC_SCHOLAR_RPS)

        self.headers = {
            'Accept': 'application/json'
        }
        if self.api_key:
            self.headers['x-api-key'] = self.api_key

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

    def _parse_paper(self, data: Dict[str, Any]) -> Paper:
        """
        Parse API response into Paper object.

        Args:
            data: Raw paper data from API

        Returns:
            Paper object
        """
        authors = []
        for author in data.get('authors', []):
            authors.append({
                'id': author.get('authorId', ''),
                'name': author.get('name', '')
            })

        pdf_url = None
        if data.get('openAccessPdf'):
            pdf_url = data['openAccessPdf'].get('url')

        tldr_text = None
        if data.get('tldr'):
            tldr_text = data['tldr'].get('text')

        return Paper(
            paper_id=data.get('paperId', ''),
            title=data.get('title', ''),
            abstract=data.get('abstract'),
            year=data.get('year'),
            authors=authors,
            venue=data.get('venue'),
            citation_count=data.get('citationCount', 0),
            reference_count=data.get('referenceCount', 0),
            url=data.get('url'),
            pdf_url=pdf_url,
            fields_of_study=data.get('fieldsOfStudy') or [],
            tldr=tldr_text,
            raw_data=data
        )

    def search_papers(
        self,
        query: str,
        limit: int = 10,
        offset: int = 0,
        year_range: Optional[str] = None,
        fields_of_study: Optional[List[str]] = None,
        open_access_only: bool = False
    ) -> SearchResult:
        """
        Search for academic papers.

        Args:
            query: Search query string
            limit: Maximum number of results (max 100)
            offset: Result offset for pagination
            year_range: Year range filter (e.g., "2010-2020", "2015-")
            fields_of_study: Filter by fields (e.g., ["History", "Religion"])
            open_access_only: Only return open access papers

        Returns:
            SearchResult with matching papers

        Example:
            >>> result = client.search_papers("church fathers scripture")
        """
        params = {
            'query': query,
            'limit': min(limit, 100),
            'offset': offset,
            'fields': ','.join(self.PAPER_FIELDS)
        }

        if year_range:
            params['year'] = year_range

        if fields_of_study:
            params['fieldsOfStudy'] = ','.join(fields_of_study)

        if open_access_only:
            params['openAccessPdf'] = ''

        data = self._make_request('paper/search', params)

        papers = [self._parse_paper(p) for p in data.get('data', [])]

        return SearchResult(
            query=query,
            total=data.get('total', len(papers)),
            offset=offset,
            papers=papers,
            raw_response=data
        )

    def search_era(
        self,
        era_name: str,
        limit: int = 20
    ) -> SearchResult:
        """
        Find academic papers about a historical era.

        Args:
            era_name: Name of the historical era
            limit: Maximum number of results

        Returns:
            SearchResult with papers about the era

        Example:
            >>> result = client.search_era("Protestant Reformation")
        """
        # Build a scholarly query for the era
        query = f'{era_name} church history Christianity'
        return self.search_papers(
            query,
            limit=limit,
            fields_of_study=['History', 'Philosophy', 'Sociology']
        )

    def search_event(
        self,
        event_name: str,
        limit: int = 20
    ) -> SearchResult:
        """
        Find academic papers about a historical event.

        Args:
            event_name: Name of the event
            limit: Maximum number of results

        Returns:
            SearchResult with papers about the event

        Example:
            >>> result = client.search_event("Council of Nicaea")
        """
        query = f'{event_name} history analysis'
        return self.search_papers(
            query,
            limit=limit,
            fields_of_study=['History', 'Philosophy']
        )

    def get_paper_details(self, paper_id: str) -> Paper:
        """
        Get detailed information about a specific paper.

        Args:
            paper_id: Semantic Scholar paper ID or DOI/ArXiv ID

        Returns:
            Paper object with full details

        Example:
            >>> paper = client.get_paper_details("649def34f8be52c8b66281af98ae884c09aef38b")
        """
        params = {'fields': ','.join(self.PAPER_FIELDS)}
        data = self._make_request(f'paper/{paper_id}', params)
        return self._parse_paper(data)

    def get_paper_citations(
        self,
        paper_id: str,
        limit: int = 100
    ) -> List[Paper]:
        """
        Get papers that cite the specified paper.

        Args:
            paper_id: Semantic Scholar paper ID
            limit: Maximum number of citations

        Returns:
            List of Paper objects that cite this paper
        """
        params = {
            'fields': ','.join(self.PAPER_FIELDS),
            'limit': min(limit, 1000)
        }
        data = self._make_request(f'paper/{paper_id}/citations', params)

        papers = []
        for item in data.get('data', []):
            citing_paper = item.get('citingPaper', {})
            if citing_paper:
                papers.append(self._parse_paper(citing_paper))

        return papers

    def get_paper_references(
        self,
        paper_id: str,
        limit: int = 100
    ) -> List[Paper]:
        """
        Get papers referenced by the specified paper.

        Args:
            paper_id: Semantic Scholar paper ID
            limit: Maximum number of references

        Returns:
            List of Paper objects referenced by this paper
        """
        params = {
            'fields': ','.join(self.PAPER_FIELDS),
            'limit': min(limit, 1000)
        }
        data = self._make_request(f'paper/{paper_id}/references', params)

        papers = []
        for item in data.get('data', []):
            cited_paper = item.get('citedPaper', {})
            if cited_paper:
                papers.append(self._parse_paper(cited_paper))

        return papers


# Convenience functions
def search_papers(query: str, limit: int = 10) -> SearchResult:
    """
    Search for academic papers.

    Convenience function that creates a client instance.

    Args:
        query: Search query
        limit: Maximum results

    Returns:
        SearchResult with matching papers
    """
    client = SemanticScholarClient()
    return client.search_papers(query, limit)


def search_era(era_name: str) -> SearchResult:
    """
    Search for papers about a historical era.

    Convenience function that creates a client instance.

    Args:
        era_name: Name of the era

    Returns:
        SearchResult with matching papers
    """
    client = SemanticScholarClient()
    return client.search_era(era_name)


def search_event(event_name: str) -> SearchResult:
    """
    Search for papers about a historical event.

    Convenience function that creates a client instance.

    Args:
        event_name: Name of the event

    Returns:
        SearchResult with matching papers
    """
    client = SemanticScholarClient()
    return client.search_event(event_name)


def get_paper_details(paper_id: str) -> Paper:
    """
    Get details about a specific paper.

    Convenience function that creates a client instance.

    Args:
        paper_id: Semantic Scholar paper ID

    Returns:
        Paper object with full details
    """
    client = SemanticScholarClient()
    return client.get_paper_details(paper_id)


def test():
    """Test function demonstrating usage of Semantic Scholar search."""
    print("=" * 60)
    print("Semantic Scholar Search Test")
    print("=" * 60)

    # Check API key (optional for basic access)
    if SEMANTIC_SCHOLAR_API_KEY:
        print("[OK] API key configured (higher rate limits)")
    else:
        print("[INFO] No API key - using public access (limited rate)")

    client = SemanticScholarClient()
    print("[OK] Client initialized")

    # Test 1: Search papers
    print("\n" + "-" * 60)
    print("Test 1: Searching for papers on 'Augustine theology'")
    print("-" * 60)

    try:
        result = client.search_papers("Augustine theology", limit=5)
        print(f"\nFound {result.total} papers (showing {len(result.papers)})")

        for i, paper in enumerate(result.papers, 1):
            print(f"\n{i}. {paper.title}")
            if paper.year:
                print(f"   Year: {paper.year}")
            if paper.authors:
                author_names = [a['name'] for a in paper.authors[:3]]
                print(f"   Authors: {', '.join(author_names)}")
            print(f"   Citations: {paper.citation_count}")
            if paper.tldr:
                print(f"   TLDR: {paper.tldr[:100]}...")

        print("\n[OK] Search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 2: Search era
    print("\n" + "-" * 60)
    print("Test 2: Searching for papers on 'Protestant Reformation' era")
    print("-" * 60)

    try:
        result = client.search_era("Protestant Reformation", limit=3)
        print(f"\nFound {result.total} papers (showing {len(result.papers)})")

        for paper in result.papers:
            print(f"\n- {paper.title}")
            if paper.venue:
                print(f"  Venue: {paper.venue}")

        print("\n[OK] Era search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 3: Get paper details (if we have results)
    if result.papers:
        print("\n" + "-" * 60)
        print("Test 3: Getting details for first paper")
        print("-" * 60)

        try:
            paper = client.get_paper_details(result.papers[0].paper_id)
            print(f"\nTitle: {paper.title}")
            print(f"Abstract: {paper.abstract[:200] if paper.abstract else 'N/A'}...")
            print(f"Fields: {', '.join(paper.fields_of_study)}")
            print(f"URL: {paper.url}")

            print("\n[OK] Paper details retrieved successfully")

        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] API request failed: {e}")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
