"""
Historical Faith Narrative - Central Configuration

This module initializes all API clients for the content generation system.
It provides a unified interface for accessing 13 different APIs used in
the Historical Faith Narrative project.

APIs Initialized:
    1. OpenAI - For text embeddings
    2. Perplexity - For AI-powered research
    3. API.Bible - Access to 2,500+ Bible versions
    4. Sefaria - Jewish texts and commentaries
    5. Semantic Scholar - Academic paper search
    6. CORE - Open access papers
    7. OpenAlex - Scholarly metadata
    8. Internet Archive - Historical texts
    9. Firecrawl - Web scraping
    10. Jina Reader - URL to text conversion
    11. Google Cloud Vision - OCR processing
    12. Supabase - Database operations
    13. Mapbox - Geographic data and maps

Usage:
    from config import (
        openai_client,
        supabase_client,
        test_all_connections
    )
"""

import os
import time
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Tuple, List
from dataclasses import dataclass
from functools import wraps

import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===============================================================================
# LOAD ENVIRONMENT VARIABLES
# ===============================================================================

# Load .env from parent directory (biblical-political-analyzer-v2/.env)
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = ROOT_DIR / '.env'
load_dotenv(ENV_PATH)

logger.info(f"Loading environment from: {ENV_PATH}")

# ===============================================================================
# API KEYS AND CONSTANTS (for research scripts)
# ===============================================================================

# Perplexity
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_MODEL = "sonar"
PERPLEXITY_BASE_URL = "https://api.perplexity.ai"
PERPLEXITY_RPM = 20

# Semantic Scholar
SEMANTIC_SCHOLAR_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
SEMANTIC_SCHOLAR_BASE_URL = "https://api.semanticscholar.org/graph/v1"
SEMANTIC_SCHOLAR_RPM = 100
SEMANTIC_SCHOLAR_RPS = 1  # 1 request per second limit

# CORE
CORE_API_KEY = os.getenv("CORE_API_KEY")
CORE_BASE_URL = "https://api.core.ac.uk/v3"
CORE_RPM = 30

# OpenAlex
OPENALEX_EMAIL = os.getenv("OPENALEX_EMAIL", "user@example.com")
OPENALEX_BASE_URL = "https://api.openalex.org"
OPENALEX_RPM = 100

# Internet Archive
INTERNET_ARCHIVE_ACCESS_KEY = os.getenv("INTERNET_ARCHIVE_ACCESS_KEY")
INTERNET_ARCHIVE_SECRET_KEY = os.getenv("INTERNET_ARCHIVE_SECRET_KEY")
INTERNET_ARCHIVE_BASE_URL = "https://archive.org"
INTERNET_ARCHIVE_RPM = 30

# API.Bible
API_BIBLE_KEY = os.getenv("API_BIBLE_KEY")
API_BIBLE_URL = os.getenv("API_BIBLE_URL", "https://rest.api.bible/v1")
API_BIBLE_RPM = 100

# Sefaria (no key needed)
SEFARIA_BASE_URL = os.getenv("SEFARIA_BASE_URL", "https://www.sefaria.org/api")
SEFARIA_RPM = 60

# Firecrawl
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1"
FIRECRAWL_RPM = 20

# Jina Reader
JINA_API_KEY = os.getenv("JINA_API_KEY")
JINA_READER_PREFIX = os.getenv("JINA_READER_PREFIX", "https://r.jina.ai/")
JINA_RPM = 60

# ===============================================================================
# DATA DIRECTORIES
# ===============================================================================

DATA_DIR = ROOT_DIR / 'historical-faith-narrative' / 'data'
OUTPUT_DIR = ROOT_DIR / 'historical-faith-narrative' / 'output'
SOURCES_DIR = ROOT_DIR / 'historical-faith-narrative' / 'sources'

# Free resource base URLs
NEW_ADVENT_BASE_URL = os.getenv('NEW_ADVENT_BASE_URL', 'https://www.newadvent.org/fathers/')
CCEL_BASE_URL = os.getenv('CCEL_BASE_URL', 'https://www.ccel.org/')
PERSEUS_BASE_URL = os.getenv('PERSEUS_BASE_URL', 'http://www.perseus.tufts.edu/hopper/')
EARLY_CHRISTIAN_WRITINGS_URL = os.getenv('EARLY_CHRISTIAN_WRITINGS_URL', 'https://www.earlychristianwritings.com/')

# ===============================================================================
# RATE LIMITING CONFIGURATION
# ===============================================================================

@dataclass
class RateLimitConfig:
    """Configuration for API rate limiting."""
    requests_per_minute: int
    requests_per_day: Optional[int] = None
    burst_limit: Optional[int] = None
    retry_after_seconds: int = 60


RATE_LIMITS: Dict[str, RateLimitConfig] = {
    "openai": RateLimitConfig(
        requests_per_minute=60,
        requests_per_day=10000,
        burst_limit=20
    ),
    "perplexity": RateLimitConfig(
        requests_per_minute=20,
        requests_per_day=1000
    ),
    "api_bible": RateLimitConfig(
        requests_per_minute=100,
        requests_per_day=5000
    ),
    "sefaria": RateLimitConfig(
        requests_per_minute=60,
        retry_after_seconds=30
    ),
    "semantic_scholar": RateLimitConfig(
        requests_per_minute=100,
        requests_per_day=5000
    ),
    "core": RateLimitConfig(
        requests_per_minute=30,
        requests_per_day=10000
    ),
    "openalex": RateLimitConfig(
        requests_per_minute=100,
        requests_per_day=100000
    ),
    "internet_archive": RateLimitConfig(
        requests_per_minute=30,
        retry_after_seconds=60
    ),
    "firecrawl": RateLimitConfig(
        requests_per_minute=20,
        requests_per_day=500
    ),
    "jina": RateLimitConfig(
        requests_per_minute=60,
        requests_per_day=1000
    ),
    "google_vision": RateLimitConfig(
        requests_per_minute=60,
        requests_per_day=1000
    ),
    "supabase": RateLimitConfig(
        requests_per_minute=1000,
        burst_limit=100
    ),
    "mapbox": RateLimitConfig(
        requests_per_minute=600,
        requests_per_day=100000
    ),
}


class RateLimiter:
    """Simple rate limiter for API calls."""

    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.requests: List[float] = []
        self.daily_requests: List[float] = []

    def wait_if_needed(self) -> None:
        """Wait if rate limit would be exceeded."""
        now = time.time()

        # Clean old requests
        self.requests = [t for t in self.requests if now - t < 60]
        self.daily_requests = [t for t in self.daily_requests if now - t < 86400]

        # Check minute limit
        if len(self.requests) >= self.config.requests_per_minute:
            sleep_time = 60 - (now - self.requests[0])
            if sleep_time > 0:
                logger.info(f"Rate limit reached. Sleeping for {sleep_time:.2f}s")
                time.sleep(sleep_time)

        # Check daily limit
        if self.config.requests_per_day:
            if len(self.daily_requests) >= self.config.requests_per_day:
                logger.warning("Daily rate limit reached!")
                raise Exception("Daily rate limit exceeded")

        self.requests.append(now)
        self.daily_requests.append(now)


# Initialize rate limiters
rate_limiters: Dict[str, RateLimiter] = {
    name: RateLimiter(config) for name, config in RATE_LIMITS.items()
}


def rate_limited(api_name: str):
    """Decorator to apply rate limiting to API calls."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if api_name in rate_limiters:
                rate_limiters[api_name].wait_if_needed()
            return func(*args, **kwargs)
        return wrapper
    return decorator


# ===============================================================================
# API CLIENT CLASSES
# ===============================================================================

class OpenAIClient:
    """OpenAI API client for embeddings."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1"
        self._client = None

    @property
    def client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key)
            except ImportError:
                logger.warning("openai package not installed. Using requests fallback.")
        return self._client

    @rate_limited("openai")
    def create_embedding(self, text: str, model: str = "text-embedding-3-small") -> List[float]:
        """Create an embedding for the given text."""
        if self.client:
            response = self.client.embeddings.create(
                input=text,
                model=model
            )
            return response.data[0].embedding
        else:
            # Fallback to requests
            response = requests.post(
                f"{self.base_url}/embeddings",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={"input": text, "model": model}
            )
            response.raise_for_status()
            return response.json()["data"][0]["embedding"]

    def test_connection(self) -> Tuple[bool, str]:
        """Test the OpenAI API connection."""
        try:
            embedding = self.create_embedding("test")
            return True, f"Connected. Embedding dimension: {len(embedding)}"
        except Exception as e:
            return False, str(e)


class PerplexityClient:
    """Perplexity AI client for research queries."""

    def __init__(self):
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai"

    @rate_limited("perplexity")
    def search(self, query: str, model: str = "sonar") -> Dict[str, Any]:
        """Perform a research query using Perplexity."""
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": query}]
            }
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Perplexity API connection."""
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "sonar",
                    "messages": [{"role": "user", "content": "Say 'connected' in one word."}]
                },
                timeout=30
            )
            response.raise_for_status()
            return True, "Connected successfully"
        except Exception as e:
            return False, str(e)


class APIBibleClient:
    """API.Bible client for accessing Bible texts."""

    def __init__(self):
        self.api_key = os.getenv("API_BIBLE_KEY")
        self.base_url = os.getenv("API_BIBLE_URL", "https://api.scripture.api.bible/v1")

    @rate_limited("api_bible")
    def get_bibles(self) -> Dict[str, Any]:
        """Get list of available Bible versions."""
        response = requests.get(
            f"{self.base_url}/bibles",
            headers={"api-key": self.api_key}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("api_bible")
    def get_passage(self, bible_id: str, passage_id: str) -> Dict[str, Any]:
        """Get a specific Bible passage."""
        response = requests.get(
            f"{self.base_url}/bibles/{bible_id}/passages/{passage_id}",
            headers={"api-key": self.api_key},
            params={"content-type": "text"}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("api_bible")
    def get_books(self, bible_id: str) -> Dict[str, Any]:
        """Get list of books for a Bible version."""
        response = requests.get(
            f"{self.base_url}/bibles/{bible_id}/books",
            headers={"api-key": self.api_key}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("api_bible")
    def search(self, bible_id: str, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search within a Bible version."""
        response = requests.get(
            f"{self.base_url}/bibles/{bible_id}/search",
            headers={"api-key": self.api_key},
            params={"query": query, "limit": limit}
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the API.Bible connection."""
        try:
            result = self.get_bibles()
            bible_count = len(result.get("data", []))
            return True, f"Connected. {bible_count} Bible versions available"
        except Exception as e:
            return False, str(e)


class SefariaClient:
    """Sefaria client for Jewish texts (no API key required)."""

    def __init__(self):
        self.base_url = os.getenv("SEFARIA_BASE_URL", "https://www.sefaria.org/api")

    @rate_limited("sefaria")
    def get_text(self, ref: str) -> Dict[str, Any]:
        """Get a text by reference (e.g., 'Genesis.1')."""
        response = requests.get(f"{self.base_url}/texts/{ref}")
        response.raise_for_status()
        return response.json()

    @rate_limited("sefaria")
    def search(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search Sefaria texts."""
        response = requests.get(
            f"{self.base_url}/search-wrapper",
            params={"q": query, "size": limit}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("sefaria")
    def get_index(self) -> Dict[str, Any]:
        """Get the full index of available texts."""
        response = requests.get(f"{self.base_url}/index")
        response.raise_for_status()
        return response.json()

    @rate_limited("sefaria")
    def get_links(self, ref: str) -> List[Dict[str, Any]]:
        """Get links/connections for a text reference."""
        response = requests.get(f"{self.base_url}/links/{ref}")
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Sefaria API connection."""
        try:
            result = self.get_text("Genesis.1.1")
            return True, f"Connected. Retrieved: {result.get('ref', 'Unknown')}"
        except Exception as e:
            return False, str(e)


class SemanticScholarClient:
    """Semantic Scholar client for academic papers."""

    def __init__(self):
        self.api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
        self.base_url = "https://api.semanticscholar.org/graph/v1"

    def _get_headers(self) -> Dict[str, str]:
        """Get headers with API key if available."""
        headers = {}
        if self.api_key:
            headers["x-api-key"] = self.api_key
        return headers

    @rate_limited("semantic_scholar")
    def search_papers(self, query: str, limit: int = 10, fields: str = None) -> Dict[str, Any]:
        """Search for academic papers."""
        if fields is None:
            fields = "title,authors,year,abstract,citationCount"

        response = requests.get(
            f"{self.base_url}/paper/search",
            headers=self._get_headers(),
            params={"query": query, "limit": limit, "fields": fields}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("semantic_scholar")
    def get_paper(self, paper_id: str, fields: str = None) -> Dict[str, Any]:
        """Get details for a specific paper."""
        if fields is None:
            fields = "title,authors,year,abstract,citationCount,references"

        response = requests.get(
            f"{self.base_url}/paper/{paper_id}",
            headers=self._get_headers(),
            params={"fields": fields}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("semantic_scholar")
    def get_author(self, author_id: str, fields: str = None) -> Dict[str, Any]:
        """Get author information."""
        if fields is None:
            fields = "name,paperCount,citationCount,hIndex"

        response = requests.get(
            f"{self.base_url}/author/{author_id}",
            headers=self._get_headers(),
            params={"fields": fields}
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Semantic Scholar API connection."""
        try:
            result = self.search_papers("biblical archaeology", limit=1)
            total = result.get("total", 0)
            return True, f"Connected. Found {total} papers for test query"
        except Exception as e:
            return False, str(e)


class COREClient:
    """CORE API client for open access papers."""

    def __init__(self):
        self.api_key = os.getenv("CORE_API_KEY")
        self.base_url = "https://api.core.ac.uk/v3"

    @rate_limited("core")
    def search_works(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search for open access works."""
        response = requests.get(
            f"{self.base_url}/search/works",
            headers={"Authorization": f"Bearer {self.api_key}"},
            params={"q": query, "limit": limit}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("core")
    def get_work(self, work_id: str) -> Dict[str, Any]:
        """Get a specific work by ID."""
        response = requests.get(
            f"{self.base_url}/works/{work_id}",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("core")
    def search_outputs(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search for research outputs."""
        response = requests.get(
            f"{self.base_url}/search/outputs",
            headers={"Authorization": f"Bearer {self.api_key}"},
            params={"q": query, "limit": limit}
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the CORE API connection."""
        try:
            result = self.search_works("church fathers", limit=1)
            total = result.get("totalHits", 0)
            return True, f"Connected. Found {total} works for test query"
        except Exception as e:
            return False, str(e)


class OpenAlexClient:
    """OpenAlex client for scholarly metadata (no key needed, uses polite pool)."""

    def __init__(self):
        self.email = os.getenv("OPENALEX_EMAIL", "user@example.com")
        self.base_url = "https://api.openalex.org"

    @rate_limited("openalex")
    def search_works(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search for scholarly works."""
        response = requests.get(
            f"{self.base_url}/works",
            params={
                "search": query,
                "per_page": limit,
                "mailto": self.email
            }
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("openalex")
    def get_work(self, work_id: str) -> Dict[str, Any]:
        """Get a specific work by OpenAlex ID."""
        response = requests.get(
            f"{self.base_url}/works/{work_id}",
            params={"mailto": self.email}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("openalex")
    def search_authors(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search for authors."""
        response = requests.get(
            f"{self.base_url}/authors",
            params={
                "search": query,
                "per_page": limit,
                "mailto": self.email
            }
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("openalex")
    def get_concepts(self, concept_id: str) -> Dict[str, Any]:
        """Get information about a concept/topic."""
        response = requests.get(
            f"{self.base_url}/concepts/{concept_id}",
            params={"mailto": self.email}
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the OpenAlex API connection."""
        try:
            result = self.search_works("biblical studies", limit=1)
            count = result.get("meta", {}).get("count", 0)
            return True, f"Connected. Found {count} works for test query"
        except Exception as e:
            return False, str(e)


class InternetArchiveClient:
    """Internet Archive client for historical texts."""

    def __init__(self):
        self.access_key = os.getenv("INTERNET_ARCHIVE_ACCESS_KEY")
        self.secret_key = os.getenv("INTERNET_ARCHIVE_SECRET_KEY")
        self.base_url = "https://archive.org"

    @rate_limited("internet_archive")
    def search(self, query: str, collection: str = None, limit: int = 10) -> Dict[str, Any]:
        """Search the Internet Archive."""
        search_query = query
        if collection:
            search_query = f"collection:{collection} AND {query}"

        response = requests.get(
            f"{self.base_url}/advancedsearch.php",
            params={
                "q": search_query,
                "output": "json",
                "rows": limit
            }
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("internet_archive")
    def get_metadata(self, identifier: str) -> Dict[str, Any]:
        """Get metadata for an item."""
        response = requests.get(f"{self.base_url}/metadata/{identifier}")
        response.raise_for_status()
        return response.json()

    @rate_limited("internet_archive")
    def get_item_files(self, identifier: str) -> List[Dict[str, Any]]:
        """Get list of files for an item."""
        metadata = self.get_metadata(identifier)
        return metadata.get("files", [])

    @rate_limited("internet_archive")
    def download_file(self, identifier: str, filename: str) -> bytes:
        """Download a specific file from an item."""
        response = requests.get(
            f"{self.base_url}/download/{identifier}/{filename}",
            auth=(self.access_key, self.secret_key) if self.access_key else None
        )
        response.raise_for_status()
        return response.content

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Internet Archive API connection."""
        try:
            result = self.search("ante-nicene fathers", limit=1)
            num_found = result.get("response", {}).get("numFound", 0)
            return True, f"Connected. Found {num_found} items for test query"
        except Exception as e:
            return False, str(e)


class FirecrawlClient:
    """Firecrawl client for web scraping."""

    def __init__(self):
        self.api_key = os.getenv("FIRECRAWL_API_KEY")
        self.base_url = "https://api.firecrawl.dev/v1"

    @rate_limited("firecrawl")
    def scrape(self, url: str, formats: List[str] = None) -> Dict[str, Any]:
        """Scrape a URL and get content."""
        if formats is None:
            formats = ["markdown", "html"]

        response = requests.post(
            f"{self.base_url}/scrape",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={"url": url, "formats": formats}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("firecrawl")
    def crawl(self, url: str, limit: int = 10) -> Dict[str, Any]:
        """Crawl a website starting from URL."""
        response = requests.post(
            f"{self.base_url}/crawl",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={"url": url, "limit": limit}
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("firecrawl")
    def get_crawl_status(self, crawl_id: str) -> Dict[str, Any]:
        """Get the status of a crawl job."""
        response = requests.get(
            f"{self.base_url}/crawl/{crawl_id}",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Firecrawl API connection."""
        try:
            result = self.scrape("https://www.example.com", formats=["markdown"])
            if result.get("success") or result.get("data"):
                return True, "Connected successfully"
            return True, "Connected (API responded)"
        except Exception as e:
            return False, str(e)


class JinaReaderClient:
    """Jina Reader client for URL to text conversion."""

    def __init__(self):
        self.api_key = os.getenv("JINA_API_KEY")
        self.prefix = os.getenv("JINA_READER_PREFIX", "https://r.jina.ai/")

    @rate_limited("jina")
    def read_url(self, url: str) -> str:
        """Convert a URL to clean text/markdown."""
        headers = {}
        if self.api_key and not self.api_key.startswith("jina_your"):
            headers["Authorization"] = f"Bearer {self.api_key}"

        response = requests.get(
            f"{self.prefix}{url}",
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.text

    @rate_limited("jina")
    def read_url_with_options(self, url: str,
                               target_selector: str = None,
                               wait_for_selector: str = None,
                               remove_selector: str = None) -> str:
        """Read URL with advanced options."""
        headers = {
            "Accept": "text/plain"
        }
        if self.api_key and not self.api_key.startswith("jina_your"):
            headers["Authorization"] = f"Bearer {self.api_key}"
        if target_selector:
            headers["X-Target-Selector"] = target_selector
        if wait_for_selector:
            headers["X-Wait-For-Selector"] = wait_for_selector
        if remove_selector:
            headers["X-Remove-Selector"] = remove_selector

        response = requests.get(
            f"{self.prefix}{url}",
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.text

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Jina Reader connection."""
        try:
            result = self.read_url("https://www.example.com")
            return True, f"Connected. Retrieved {len(result)} characters"
        except Exception as e:
            return False, str(e)


class GoogleVisionClient:
    """Google Cloud Vision client for OCR."""

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_CLOUD_VISION_API_KEY")
        self.base_url = "https://vision.googleapis.com/v1"

    @rate_limited("google_vision")
    def detect_text(self, image_url: str = None, image_content: bytes = None) -> Dict[str, Any]:
        """Detect text in an image (OCR)."""
        if image_url:
            image_data = {"source": {"imageUri": image_url}}
        elif image_content:
            import base64
            image_data = {"content": base64.b64encode(image_content).decode()}
        else:
            raise ValueError("Either image_url or image_content must be provided")

        response = requests.post(
            f"{self.base_url}/images:annotate",
            params={"key": self.api_key},
            json={
                "requests": [{
                    "image": image_data,
                    "features": [{"type": "TEXT_DETECTION"}]
                }]
            }
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("google_vision")
    def detect_document_text(self, image_url: str = None, image_content: bytes = None) -> Dict[str, Any]:
        """Detect dense text in a document image."""
        if image_url:
            image_data = {"source": {"imageUri": image_url}}
        elif image_content:
            import base64
            image_data = {"content": base64.b64encode(image_content).decode()}
        else:
            raise ValueError("Either image_url or image_content must be provided")

        response = requests.post(
            f"{self.base_url}/images:annotate",
            params={"key": self.api_key},
            json={
                "requests": [{
                    "image": image_data,
                    "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
                }]
            }
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("google_vision")
    def detect_labels(self, image_url: str = None, image_content: bytes = None) -> Dict[str, Any]:
        """Detect labels/objects in an image."""
        if image_url:
            image_data = {"source": {"imageUri": image_url}}
        elif image_content:
            import base64
            image_data = {"content": base64.b64encode(image_content).decode()}
        else:
            raise ValueError("Either image_url or image_content must be provided")

        response = requests.post(
            f"{self.base_url}/images:annotate",
            params={"key": self.api_key},
            json={
                "requests": [{
                    "image": image_data,
                    "features": [{"type": "LABEL_DETECTION", "maxResults": 10}]
                }]
            }
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Google Vision API connection."""
        try:
            result = self.detect_text(
                image_url="https://cloud.google.com/vision/docs/images/sign_text.png"
            )
            if "responses" in result:
                return True, "Connected successfully"
            return False, "Unexpected response format"
        except Exception as e:
            return False, str(e)


class SupabaseClient:
    """Supabase client for database operations."""

    def __init__(self):
        self.url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.anon_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self._client = None

    @property
    def client(self):
        """Lazy initialization of Supabase client."""
        if self._client is None:
            try:
                from supabase import create_client, Client
                self._client = create_client(self.url, self.service_key or self.anon_key)
            except ImportError:
                logger.warning("supabase package not installed. Using requests fallback.")
        return self._client

    def _get_headers(self, use_service_key: bool = True) -> Dict[str, str]:
        """Get headers for REST API requests."""
        key = self.service_key if use_service_key else self.anon_key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

    @rate_limited("supabase")
    def select(self, table: str, columns: str = "*", limit: int = None,
               filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Select data from a table."""
        if self.client:
            query = self.client.table(table).select(columns)
            if limit:
                query = query.limit(limit)
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            return query.execute().data
        else:
            headers = self._get_headers()
            params = {"select": columns}
            if limit:
                headers["Range"] = f"0-{limit-1}"

            url = f"{self.url}/rest/v1/{table}"
            if filters:
                filter_parts = [f"{k}=eq.{v}" for k, v in filters.items()]
                url += "?" + "&".join(filter_parts)

            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()

    @rate_limited("supabase")
    def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert data into a table."""
        if self.client:
            return self.client.table(table).insert(data).execute().data
        else:
            headers = self._get_headers()
            headers["Prefer"] = "return=representation"
            response = requests.post(
                f"{self.url}/rest/v1/{table}",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            return response.json()

    @rate_limited("supabase")
    def update(self, table: str, data: Dict[str, Any], filters: Dict[str, Any]) -> Dict[str, Any]:
        """Update data in a table."""
        if self.client:
            query = self.client.table(table).update(data)
            for key, value in filters.items():
                query = query.eq(key, value)
            return query.execute().data
        else:
            headers = self._get_headers()
            headers["Prefer"] = "return=representation"
            filter_parts = [f"{k}=eq.{v}" for k, v in filters.items()]
            url = f"{self.url}/rest/v1/{table}?" + "&".join(filter_parts)
            response = requests.patch(url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()

    @rate_limited("supabase")
    def delete(self, table: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Delete data from a table."""
        if self.client:
            query = self.client.table(table).delete()
            for key, value in filters.items():
                query = query.eq(key, value)
            return query.execute().data
        else:
            headers = self._get_headers()
            filter_parts = [f"{k}=eq.{v}" for k, v in filters.items()]
            url = f"{self.url}/rest/v1/{table}?" + "&".join(filter_parts)
            response = requests.delete(url, headers=headers)
            response.raise_for_status()
            return response.json()

    @rate_limited("supabase")
    def rpc(self, function_name: str, params: Dict[str, Any] = None) -> Any:
        """Call a Postgres function."""
        if self.client:
            return self.client.rpc(function_name, params or {}).execute().data
        else:
            headers = self._get_headers()
            response = requests.post(
                f"{self.url}/rest/v1/rpc/{function_name}",
                headers=headers,
                json=params or {}
            )
            response.raise_for_status()
            return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Supabase connection."""
        try:
            headers = {
                "apikey": self.anon_key,
                "Authorization": f"Bearer {self.anon_key}"
            }
            response = requests.get(
                f"{self.url}/rest/v1/",
                headers=headers
            )
            if response.status_code in [200, 404]:
                return True, f"Connected to {self.url}"
            return False, f"Unexpected status: {response.status_code}"
        except Exception as e:
            return False, str(e)


class MapboxClient:
    """Mapbox client for geographic data."""

    def __init__(self):
        self.api_key = os.getenv("MAPBOX_API_KEY")
        self.base_url = "https://api.mapbox.com"

    @rate_limited("mapbox")
    def geocode(self, place: str, limit: int = 5, types: str = None) -> Dict[str, Any]:
        """Forward geocode a place name to coordinates."""
        params = {"access_token": self.api_key, "limit": limit}
        if types:
            params["types"] = types

        response = requests.get(
            f"{self.base_url}/geocoding/v5/mapbox.places/{place}.json",
            params=params
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("mapbox")
    def reverse_geocode(self, longitude: float, latitude: float, types: str = None) -> Dict[str, Any]:
        """Reverse geocode coordinates to a place name."""
        params = {"access_token": self.api_key}
        if types:
            params["types"] = types

        response = requests.get(
            f"{self.base_url}/geocoding/v5/mapbox.places/{longitude},{latitude}.json",
            params=params
        )
        response.raise_for_status()
        return response.json()

    @rate_limited("mapbox")
    def get_static_map(
        self,
        longitude: float,
        latitude: float,
        zoom: int = 10,
        width: int = 600,
        height: int = 400,
        style: str = "streets-v12",
        marker: bool = True
    ) -> bytes:
        """Get a static map image."""
        marker_str = f"pin-s+ff0000({longitude},{latitude})/" if marker else ""
        response = requests.get(
            f"{self.base_url}/styles/v1/mapbox/{style}/static/{marker_str}{longitude},{latitude},{zoom}/{width}x{height}",
            params={"access_token": self.api_key}
        )
        response.raise_for_status()
        return response.content

    @rate_limited("mapbox")
    def get_directions(
        self,
        start: Tuple[float, float],
        end: Tuple[float, float],
        profile: str = "driving"
    ) -> Dict[str, Any]:
        """Get directions between two points."""
        coords = f"{start[0]},{start[1]};{end[0]},{end[1]}"
        response = requests.get(
            f"{self.base_url}/directions/v5/mapbox/{profile}/{coords}",
            params={"access_token": self.api_key, "geometries": "geojson"}
        )
        response.raise_for_status()
        return response.json()

    def test_connection(self) -> Tuple[bool, str]:
        """Test the Mapbox API connection."""
        try:
            result = self.geocode("Jerusalem", limit=1)
            features = result.get("features", [])
            if features:
                return True, f"Connected. Test geocode returned: {features[0].get('place_name', 'Unknown')}"
            return True, "Connected (no features returned for test)"
        except Exception as e:
            return False, str(e)


# ===============================================================================
# INITIALIZE CLIENTS
# ===============================================================================

# Primary clients
openai_client = OpenAIClient()
perplexity_client = PerplexityClient()
supabase_client = SupabaseClient()

# Religious text clients
api_bible_client = APIBibleClient()
sefaria_client = SefariaClient()

# Research/academic clients
semantic_scholar_client = SemanticScholarClient()
core_client = COREClient()
openalex_client = OpenAlexClient()

# Historical texts
internet_archive_client = InternetArchiveClient()

# Web scraping
firecrawl_client = FirecrawlClient()
jina_client = JinaReaderClient()

# Other services
google_vision_client = GoogleVisionClient()
mapbox_client = MapboxClient()


# ===============================================================================
# HELPER FUNCTIONS
# ===============================================================================

def get_all_clients() -> Dict[str, Any]:
    """Get a dictionary of all initialized clients."""
    return {
        "openai": openai_client,
        "perplexity": perplexity_client,
        "api_bible": api_bible_client,
        "sefaria": sefaria_client,
        "semantic_scholar": semantic_scholar_client,
        "core": core_client,
        "openalex": openalex_client,
        "internet_archive": internet_archive_client,
        "firecrawl": firecrawl_client,
        "jina": jina_client,
        "google_vision": google_vision_client,
        "supabase": supabase_client,
        "mapbox": mapbox_client,
    }


def get_rate_limit_status(api_name: str) -> Dict[str, Any]:
    """Get the current rate limit status for an API."""
    if api_name not in rate_limiters:
        return {"error": f"Unknown API: {api_name}"}

    limiter = rate_limiters[api_name]
    config = RATE_LIMITS[api_name]
    now = time.time()

    recent_requests = len([t for t in limiter.requests if now - t < 60])
    daily_requests = len([t for t in limiter.daily_requests if now - t < 86400])

    return {
        "api": api_name,
        "requests_last_minute": recent_requests,
        "limit_per_minute": config.requests_per_minute,
        "requests_today": daily_requests,
        "limit_per_day": config.requests_per_day,
        "can_request": recent_requests < config.requests_per_minute
    }


def batch_embed(texts: List[str], batch_size: int = 100) -> List[List[float]]:
    """Create embeddings for multiple texts in batches."""
    embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        for text in batch:
            embedding = openai_client.create_embedding(text)
            embeddings.append(embedding)
    return embeddings


def search_across_sources(query: str, limit_per_source: int = 5) -> Dict[str, Any]:
    """Search across multiple scholarly sources."""
    results = {}

    try:
        results["semantic_scholar"] = semantic_scholar_client.search_papers(query, limit=limit_per_source)
    except Exception as e:
        results["semantic_scholar"] = {"error": str(e)}

    try:
        results["core"] = core_client.search_works(query, limit=limit_per_source)
    except Exception as e:
        results["core"] = {"error": str(e)}

    try:
        results["openalex"] = openalex_client.search_works(query, limit=limit_per_source)
    except Exception as e:
        results["openalex"] = {"error": str(e)}

    return results


def search_religious_texts(query: str, limit: int = 5) -> Dict[str, Any]:
    """Search across religious text sources."""
    results = {}

    try:
        results["sefaria"] = sefaria_client.search(query, limit=limit)
    except Exception as e:
        results["sefaria"] = {"error": str(e)}

    return results


def validate_config(*required_keys: str) -> bool:
    """
    Validate that required configuration keys are present.

    Args:
        *required_keys: Variable number of config key names to check

    Returns:
        bool: True if all keys are present

    Raises:
        ValueError: If any required keys are missing
    """
    config_map = {
        'PERPLEXITY_API_KEY': os.getenv('PERPLEXITY_API_KEY'),
        'SEMANTIC_SCHOLAR_API_KEY': os.getenv('SEMANTIC_SCHOLAR_API_KEY'),
        'CORE_API_KEY': os.getenv('CORE_API_KEY'),
        'API_BIBLE_KEY': os.getenv('API_BIBLE_KEY'),
        'FIRECRAWL_API_KEY': os.getenv('FIRECRAWL_API_KEY'),
        'INTERNET_ARCHIVE_ACCESS_KEY': os.getenv('INTERNET_ARCHIVE_ACCESS_KEY'),
        'INTERNET_ARCHIVE_SECRET_KEY': os.getenv('INTERNET_ARCHIVE_SECRET_KEY'),
        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY'),
        'GOOGLE_CLOUD_VISION_API_KEY': os.getenv('GOOGLE_CLOUD_VISION_API_KEY'),
        'MAPBOX_API_KEY': os.getenv('MAPBOX_API_KEY'),
        'SUPABASE_URL': os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
        'SUPABASE_KEY': os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    }

    missing = []
    for key in required_keys:
        if key in config_map and not config_map[key]:
            missing.append(key)

    if missing:
        raise ValueError(f"Missing required configuration: {', '.join(missing)}")

    return True


def get_config_status() -> Dict[str, str]:
    """
    Get the status of all configuration keys.

    Returns:
        dict: Status of each configuration key
    """
    config_items = {
        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY'),
        'PERPLEXITY_API_KEY': os.getenv('PERPLEXITY_API_KEY'),
        'API_BIBLE_KEY': os.getenv('API_BIBLE_KEY'),
        'SEFARIA': 'no key needed',
        'SEMANTIC_SCHOLAR_API_KEY': os.getenv('SEMANTIC_SCHOLAR_API_KEY'),
        'CORE_API_KEY': os.getenv('CORE_API_KEY'),
        'OPENALEX_EMAIL': os.getenv('OPENALEX_EMAIL'),
        'INTERNET_ARCHIVE_ACCESS_KEY': os.getenv('INTERNET_ARCHIVE_ACCESS_KEY'),
        'FIRECRAWL_API_KEY': os.getenv('FIRECRAWL_API_KEY'),
        'JINA_API_KEY': os.getenv('JINA_API_KEY'),
        'GOOGLE_CLOUD_VISION_API_KEY': os.getenv('GOOGLE_CLOUD_VISION_API_KEY'),
        'SUPABASE_URL': os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
        'MAPBOX_API_KEY': os.getenv('MAPBOX_API_KEY'),
    }

    status = {}
    for key, value in config_items.items():
        if value == 'no key needed':
            status[key] = 'no key needed'
        elif value and not value.startswith('your_') and value != 'your@email.com':
            status[key] = 'configured'
        else:
            status[key] = 'not configured'

    return status


# ===============================================================================
# TEST FUNCTION
# ===============================================================================

def test_all_connections() -> Dict[str, Tuple[bool, str]]:
    """
    Test connections to all 13 APIs.

    Returns:
        Dictionary mapping API name to (success, message) tuple.
    """
    print("\n" + "=" * 70)
    print("TESTING ALL API CONNECTIONS")
    print("=" * 70 + "\n")

    clients = get_all_clients()
    results = {}

    for name, client in clients.items():
        print(f"Testing {name}...", end=" ", flush=True)
        try:
            success, message = client.test_connection()
            results[name] = (success, message)
            status = "[OK]" if success else "[FAIL]"
            print(f"{status} {message}")
        except Exception as e:
            results[name] = (False, str(e))
            print(f"[ERROR] {str(e)}")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    successful = sum(1 for success, _ in results.values() if success)
    total = len(results)

    print(f"\nConnected: {successful}/{total} APIs")

    if successful < total:
        print("\nFailed connections:")
        for name, (success, message) in results.items():
            if not success:
                print(f"  - {name}: {message}")

    print()
    return results


def test_single_connection(api_name: str) -> Tuple[bool, str]:
    """
    Test a single API connection.

    Args:
        api_name: Name of the API to test (e.g., 'openai', 'supabase')

    Returns:
        Tuple of (success, message)
    """
    clients = get_all_clients()
    if api_name not in clients:
        return False, f"Unknown API: {api_name}. Available: {list(clients.keys())}"

    client = clients[api_name]
    try:
        return client.test_connection()
    except Exception as e:
        return False, str(e)


# ===============================================================================
# MAIN EXECUTION
# ===============================================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        # Test specific API
        api_name = sys.argv[1]
        print(f"\nTesting {api_name}...")
        success, message = test_single_connection(api_name)
        status = "[OK]" if success else "[FAIL]"
        print(f"{status} {message}")
    else:
        # Test all APIs
        test_all_connections()
