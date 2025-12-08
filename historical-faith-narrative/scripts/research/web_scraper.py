"""
Web Scraper Module for Historical Faith Narrative.

This module provides functions to scrape web content using Firecrawl
and Jina Reader, with special support for Church Fathers and Christian
classics websites.

Firecrawl: Full-featured web scraping with JavaScript rendering
Jina Reader: Quick, lightweight URL-to-text conversion
"""
import os
import sys
import time
import re
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from urllib.parse import urljoin, quote

import requests

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    firecrawl_client,
    jina_client,
    NEW_ADVENT_BASE_URL,
    CCEL_BASE_URL,
    validate_config
)


@dataclass
class ScrapedContent:
    """Container for scraped web content."""
    url: str
    title: Optional[str] = None
    markdown: Optional[str] = None
    html: Optional[str] = None
    text: Optional[str] = None
    links: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    raw_response: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ChurchFatherText:
    """Container for Church Father text from New Advent or CCEL."""
    title: str
    author: str
    url: str
    content: str
    source: str  # 'new_advent' or 'ccel'
    metadata: Dict[str, Any] = field(default_factory=dict)


class RateLimiter:
    """Simple rate limiter for API requests."""

    def __init__(self, requests_per_minute: int = 20):
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


class WebScraper:
    """
    Web scraper using Firecrawl and Jina Reader.

    Attributes:
        firecrawl_key: Firecrawl API key
        jina_key: Optional Jina API key (works without for basic use)
    """

    def __init__(
        self,
        firecrawl_key: Optional[str] = None,
        jina_key: Optional[str] = None
    ):
        """
        Initialize the web scraper.

        Args:
            firecrawl_key: Optional Firecrawl API key
            jina_key: Optional Jina API key
        """
        self.firecrawl_key = firecrawl_key or os.getenv('FIRECRAWL_API_KEY')
        self.jina_key = jina_key or os.getenv('JINA_API_KEY')
        self.jina_prefix = os.getenv('JINA_READER_PREFIX', 'https://r.jina.ai/')

        self.firecrawl_rate_limiter = RateLimiter(requests_per_minute=20)
        self.jina_rate_limiter = RateLimiter(requests_per_minute=60)

        self.firecrawl_base_url = 'https://api.firecrawl.dev/v1'

    def scrape_url(
        self,
        url: str,
        formats: Optional[List[str]] = None,
        wait_for: Optional[str] = None,
        timeout: int = 30
    ) -> ScrapedContent:
        """
        Scrape a URL using Firecrawl.

        Firecrawl handles JavaScript rendering and complex pages.

        Args:
            url: URL to scrape
            formats: Output formats ('markdown', 'html', 'rawHtml', 'links')
            wait_for: CSS selector to wait for before scraping
            timeout: Request timeout in seconds

        Returns:
            ScrapedContent with scraped data

        Example:
            >>> content = scraper.scrape_url("https://example.com")
        """
        if not self.firecrawl_key:
            raise ValueError("Firecrawl API key is required")

        self.firecrawl_rate_limiter.wait()

        if formats is None:
            formats = ['markdown', 'html']

        headers = {
            'Authorization': f'Bearer {self.firecrawl_key}',
            'Content-Type': 'application/json'
        }

        payload = {
            'url': url,
            'formats': formats
        }

        if wait_for:
            payload['waitFor'] = wait_for

        response = requests.post(
            f'{self.firecrawl_base_url}/scrape',
            headers=headers,
            json=payload,
            timeout=timeout
        )

        response.raise_for_status()
        data = response.json()

        scrape_data = data.get('data', {})

        return ScrapedContent(
            url=url,
            title=scrape_data.get('metadata', {}).get('title'),
            markdown=scrape_data.get('markdown'),
            html=scrape_data.get('html'),
            text=None,
            links=scrape_data.get('links', []),
            metadata=scrape_data.get('metadata', {}),
            raw_response=data
        )

    def read_url(self, url: str, timeout: int = 30) -> ScrapedContent:
        """
        Quick read of a URL using Jina Reader.

        Jina Reader is fast and lightweight, good for simple pages.

        Args:
            url: URL to read
            timeout: Request timeout in seconds

        Returns:
            ScrapedContent with text content

        Example:
            >>> content = scraper.read_url("https://example.com")
        """
        self.jina_rate_limiter.wait()

        headers = {}
        if self.jina_key and not self.jina_key.startswith('jina_your'):
            headers['Authorization'] = f'Bearer {self.jina_key}'

        jina_url = f'{self.jina_prefix}{url}'

        response = requests.get(
            jina_url,
            headers=headers,
            timeout=timeout
        )

        response.raise_for_status()
        text = response.text

        # Try to extract title from the text
        title = None
        lines = text.split('\n')
        for line in lines[:5]:
            line = line.strip()
            if line and not line.startswith('http'):
                title = line
                break

        return ScrapedContent(
            url=url,
            title=title,
            markdown=None,
            html=None,
            text=text,
            links=[],
            metadata={},
            raw_response={'text': text}
        )

    def scrape_new_advent(self, path: str) -> ChurchFatherText:
        """
        Scrape Church Fathers text from New Advent.

        New Advent hosts the complete Ante-Nicene Fathers and
        Nicene and Post-Nicene Fathers collections.

        Args:
            path: Path relative to the fathers section
                  (e.g., "0101.htm" for Clement's First Epistle)

        Returns:
            ChurchFatherText with the scraped content

        Example:
            >>> text = scraper.scrape_new_advent("0101.htm")
        """
        url = urljoin(NEW_ADVENT_BASE_URL, path)

        # Use Jina for simpler pages like New Advent
        content = self.read_url(url)

        # Parse the content to extract title and author
        text = content.text or ''
        title = ''
        author = ''

        # New Advent has a consistent format we can parse
        lines = text.split('\n')
        for i, line in enumerate(lines):
            line = line.strip()
            if 'by' in line.lower() and not author:
                # Try to extract author
                parts = line.split('by', 1)
                if len(parts) > 1:
                    author = parts[1].strip()
            if line and not title and i < 10:
                # First non-empty line is often the title
                if not line.startswith('http') and len(line) < 200:
                    title = line

        return ChurchFatherText(
            title=title or content.title or 'Unknown',
            author=author or 'Unknown',
            url=url,
            content=text,
            source='new_advent',
            metadata={'path': path}
        )

    def scrape_ccel(self, path: str) -> ChurchFatherText:
        """
        Scrape Christian Classics from CCEL.

        CCEL (Christian Classics Ethereal Library) hosts a large
        collection of public domain Christian literature.

        Args:
            path: Path relative to CCEL base URL
                  (e.g., "schaff/npnf101/npnf101.vii.html")

        Returns:
            ChurchFatherText with the scraped content

        Example:
            >>> text = scraper.scrape_ccel("schaff/npnf101/npnf101.vii.html")
        """
        url = urljoin(CCEL_BASE_URL, path)

        # Use Jina for reading
        content = self.read_url(url)

        text = content.text or ''
        title = content.title or ''
        author = ''

        # CCEL format parsing
        lines = text.split('\n')
        for line in lines[:20]:
            line = line.strip()
            if 'by' in line.lower() and not author:
                parts = line.lower().split('by', 1)
                if len(parts) > 1:
                    author = parts[1].strip().title()

        return ChurchFatherText(
            title=title or 'Unknown',
            author=author or 'Unknown',
            url=url,
            content=text,
            source='ccel',
            metadata={'path': path}
        )

    def crawl_site(
        self,
        url: str,
        limit: int = 10,
        include_paths: Optional[List[str]] = None,
        exclude_paths: Optional[List[str]] = None
    ) -> List[ScrapedContent]:
        """
        Crawl a website starting from a URL.

        Args:
            url: Starting URL
            limit: Maximum pages to crawl
            include_paths: Only include URLs matching these patterns
            exclude_paths: Exclude URLs matching these patterns

        Returns:
            List of ScrapedContent for crawled pages
        """
        if not self.firecrawl_key:
            raise ValueError("Firecrawl API key is required for crawling")

        self.firecrawl_rate_limiter.wait()

        headers = {
            'Authorization': f'Bearer {self.firecrawl_key}',
            'Content-Type': 'application/json'
        }

        payload = {
            'url': url,
            'limit': limit,
            'scrapeOptions': {
                'formats': ['markdown']
            }
        }

        if include_paths:
            payload['includePaths'] = include_paths
        if exclude_paths:
            payload['excludePaths'] = exclude_paths

        # Start crawl
        response = requests.post(
            f'{self.firecrawl_base_url}/crawl',
            headers=headers,
            json=payload,
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        crawl_id = data.get('id')
        if not crawl_id:
            raise ValueError("No crawl ID returned")

        # Poll for results
        results = []
        max_wait = 300  # 5 minutes
        start_time = time.time()

        while time.time() - start_time < max_wait:
            time.sleep(5)

            status_response = requests.get(
                f'{self.firecrawl_base_url}/crawl/{crawl_id}',
                headers=headers,
                timeout=30
            )

            status_data = status_response.json()
            status = status_data.get('status')

            if status == 'completed':
                for page in status_data.get('data', []):
                    results.append(ScrapedContent(
                        url=page.get('metadata', {}).get('sourceURL', ''),
                        title=page.get('metadata', {}).get('title'),
                        markdown=page.get('markdown'),
                        html=page.get('html'),
                        text=None,
                        links=page.get('links', []),
                        metadata=page.get('metadata', {}),
                        raw_response=page
                    ))
                break

            elif status == 'failed':
                raise Exception(f"Crawl failed: {status_data.get('error', 'Unknown error')}")

        return results


# Convenience functions
def scrape_url(url: str) -> ScrapedContent:
    """
    Scrape a URL using Firecrawl.

    Convenience function that creates a scraper instance.

    Args:
        url: URL to scrape

    Returns:
        ScrapedContent with scraped data
    """
    scraper = WebScraper()
    return scraper.scrape_url(url)


def read_url(url: str) -> ScrapedContent:
    """
    Quick read of a URL using Jina Reader.

    Convenience function that creates a scraper instance.

    Args:
        url: URL to read

    Returns:
        ScrapedContent with text content
    """
    scraper = WebScraper()
    return scraper.read_url(url)


def scrape_new_advent(path: str) -> ChurchFatherText:
    """
    Scrape Church Fathers from New Advent.

    Convenience function that creates a scraper instance.

    Args:
        path: Path relative to fathers section

    Returns:
        ChurchFatherText with content
    """
    scraper = WebScraper()
    return scraper.scrape_new_advent(path)


def scrape_ccel(path: str) -> ChurchFatherText:
    """
    Scrape Christian Classics from CCEL.

    Convenience function that creates a scraper instance.

    Args:
        path: Path relative to CCEL base URL

    Returns:
        ChurchFatherText with content
    """
    scraper = WebScraper()
    return scraper.scrape_ccel(path)


def test():
    """Test function demonstrating usage of web scraper."""
    print("=" * 60)
    print("Web Scraper Test")
    print("=" * 60)

    scraper = WebScraper()

    # Check configuration
    if scraper.firecrawl_key:
        print("[OK] Firecrawl API key configured")
    else:
        print("[WARN] No Firecrawl API key - Firecrawl features unavailable")

    if scraper.jina_key and not scraper.jina_key.startswith('jina_your'):
        print("[OK] Jina API key configured")
    else:
        print("[INFO] Jina Reader works without API key (rate limited)")

    print("[OK] Scraper initialized")

    # Test 1: Jina Reader (works without API key)
    print("\n" + "-" * 60)
    print("Test 1: Reading example.com with Jina Reader")
    print("-" * 60)

    try:
        content = scraper.read_url("https://www.example.com")
        print(f"\nURL: {content.url}")
        print(f"Title: {content.title}")
        print(f"\nContent preview ({len(content.text or '')} chars):")
        if content.text:
            print(content.text[:500])

        print("\n[OK] Jina Reader working successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] Request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 2: Firecrawl (requires API key)
    if scraper.firecrawl_key:
        print("\n" + "-" * 60)
        print("Test 2: Scraping example.com with Firecrawl")
        print("-" * 60)

        try:
            content = scraper.scrape_url("https://www.example.com")
            print(f"\nURL: {content.url}")
            print(f"Title: {content.title}")
            print(f"Markdown length: {len(content.markdown or '')} chars")
            print(f"Links found: {len(content.links)}")

            if content.markdown:
                print(f"\nMarkdown preview:")
                print(content.markdown[:500])

            print("\n[OK] Firecrawl working successfully")

        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] Request failed: {e}")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")
    else:
        print("\n[SKIP] Firecrawl test - no API key")

    # Test 3: New Advent scraping
    print("\n" + "-" * 60)
    print("Test 3: Scraping New Advent - Didache (0713.htm)")
    print("-" * 60)

    try:
        text = scraper.scrape_new_advent("0713.htm")
        print(f"\nTitle: {text.title}")
        print(f"Author: {text.author}")
        print(f"URL: {text.url}")
        print(f"Source: {text.source}")
        print(f"Content length: {len(text.content)} chars")

        if text.content:
            print(f"\nContent preview:")
            print(text.content[:500])

        print("\n[OK] New Advent scraping working successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] Request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
