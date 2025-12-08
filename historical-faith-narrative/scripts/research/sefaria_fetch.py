"""
Sefaria Fetch Module for Historical Faith Narrative.

This module provides functions to retrieve Jewish texts from the Sefaria API,
including Torah, Talmud, Midrash, and commentaries.

No API key is required - Sefaria provides free public access.
API Documentation: https://www.sefaria.org/developers
"""
import os
import sys
import time
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, field
from urllib.parse import quote

import requests

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import SEFARIA_BASE_URL


@dataclass
class SefariaText:
    """Container for text retrieved from Sefaria."""
    reference: str
    he_text: Union[str, List[str], List[List[str]]]
    en_text: Union[str, List[str], List[List[str]]]
    book: str
    categories: List[str]
    version_title: Optional[str] = None
    version_source: Optional[str] = None
    section_names: List[str] = field(default_factory=list)
    commentary: List[Dict[str, Any]] = field(default_factory=list)
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchResult:
    """Container for search results from Sefaria."""
    query: str
    total: int
    hits: List[Dict[str, Any]]
    raw_response: Dict[str, Any]


class RateLimiter:
    """Simple rate limiter for API requests."""

    def __init__(self, requests_per_second: float = 2.0):
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0

    def wait(self):
        """Wait if necessary to respect rate limits."""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request_time = time.time()


class SefariaClient:
    """
    Client for the Sefaria API.

    Attributes:
        base_url: API base URL
    """

    # Major Torah portions (Parashot)
    TORAH_PORTIONS = [
        # Genesis
        'Bereshit', 'Noach', 'Lech_Lecha', 'Vayera', 'Chayei_Sara',
        'Toldot', 'Vayetzei', 'Vayishlach', 'Vayeshev', 'Miketz',
        'Vayigash', 'Vayechi',
        # Exodus
        'Shemot', 'Vaera', 'Bo', 'Beshalach', 'Yitro', 'Mishpatim',
        'Terumah', 'Tetzaveh', 'Ki_Tisa', 'Vayakhel', 'Pekudei',
        # Leviticus
        'Vayikra', 'Tzav', 'Shmini', 'Tazria', 'Metzora', 'Achrei_Mot',
        'Kedoshim', 'Emor', 'Behar', 'Bechukotai',
        # Numbers
        'Bamidbar', 'Nasso', 'Behaalotcha', 'Shelach', 'Korach',
        'Chukat', 'Balak', 'Pinchas', 'Matot', 'Masei',
        # Deuteronomy
        'Devarim', 'Vaetchanan', 'Eikev', 'Re_eh', 'Shoftim',
        'Ki_Teitzei', 'Ki_Tavo', 'Nitzavim', 'Vayeilech', 'Ha_azinu',
        'V_Zot_HaBerachah'
    ]

    # Talmud tractates
    TALMUD_TRACTATES = [
        'Berakhot', 'Shabbat', 'Eruvin', 'Pesachim', 'Shekalim',
        'Yoma', 'Sukkah', 'Beitzah', 'Rosh_Hashanah', 'Taanit',
        'Megillah', 'Moed_Katan', 'Chagigah', 'Yevamot', 'Ketubot',
        'Nedarim', 'Nazir', 'Sotah', 'Gittin', 'Kiddushin',
        'Bava_Kamma', 'Bava_Metzia', 'Bava_Batra', 'Sanhedrin',
        'Makkot', 'Shevuot', 'Avodah_Zarah', 'Horayot', 'Zevachim',
        'Menachot', 'Chullin', 'Bekhorot', 'Arakhin', 'Temurah',
        'Keritot', 'Meilah', 'Tamid', 'Niddah'
    ]

    # Major commentators
    COMMENTATORS = [
        'Rashi', 'Tosafot', 'Ramban', 'Ibn_Ezra', 'Sforno',
        'Or_HaChaim', 'Kli_Yakar', 'Malbim', 'Meshech_Hochma'
    ]

    def __init__(self, base_url: str = SEFARIA_BASE_URL):
        """
        Initialize the Sefaria client.

        Args:
            base_url: API base URL
        """
        self.base_url = base_url
        self.rate_limiter = RateLimiter(requests_per_second=2.0)
        self.session = requests.Session()

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
        response = self.session.get(url, params=params, timeout=30)
        response.raise_for_status()

        return response.json()

    def _normalize_reference(self, reference: str) -> str:
        """
        Normalize a text reference for the API.

        Args:
            reference: Text reference (e.g., "Genesis 1:1", "Berakhot 2a")

        Returns:
            URL-safe reference string
        """
        # Replace spaces with underscores for multi-word books
        ref = reference.replace(' ', '_')
        return quote(ref, safe=':._-')

    def get_text(
        self,
        reference: str,
        with_commentary: bool = False,
        language: str = 'all'
    ) -> SefariaText:
        """
        Get a specific text by reference.

        Args:
            reference: Text reference (e.g., "Genesis 1:1-10", "Berakhot 2a")
            with_commentary: Include commentaries
            language: 'all', 'he' (Hebrew), or 'en' (English)

        Returns:
            SefariaText with the requested text

        Example:
            >>> text = client.get_text("Genesis 1:1-5")
            >>> text = client.get_text("Berakhot 2a")
        """
        endpoint = f'texts/{self._normalize_reference(reference)}'

        params = {
            'context': 0,
            'commentary': 1 if with_commentary else 0
        }

        if language != 'all':
            params['lang'] = language

        data = self._make_request(endpoint, params)

        commentary = []
        if with_commentary and 'commentary' in data:
            commentary = data['commentary']

        return SefariaText(
            reference=data.get('ref', reference),
            he_text=data.get('he', ''),
            en_text=data.get('text', ''),
            book=data.get('book', ''),
            categories=data.get('categories', []),
            version_title=data.get('versionTitle'),
            version_source=data.get('versionSource'),
            section_names=data.get('sectionNames', []),
            commentary=commentary,
            raw_data=data
        )

    def search(
        self,
        query: str,
        filters: Optional[List[str]] = None,
        size: int = 20
    ) -> SearchResult:
        """
        Search all texts on Sefaria.

        Args:
            query: Search query
            filters: Optional category filters
            size: Number of results

        Returns:
            SearchResult with matching texts

        Example:
            >>> result = client.search("love your neighbor")
        """
        params = {
            'q': query,
            'size': size
        }

        if filters:
            params['filters'] = ','.join(filters)

        data = self._make_request('search-wrapper/merged', params)

        hits = data.get('hits', {}).get('hits', [])
        total = data.get('hits', {}).get('total', {})

        if isinstance(total, dict):
            total = total.get('value', len(hits))

        return SearchResult(
            query=query,
            total=total,
            hits=hits,
            raw_response=data
        )

    def get_torah_portion(
        self,
        portion: str,
        with_commentary: bool = False
    ) -> SefariaText:
        """
        Get a Torah portion (Parasha).

        Args:
            portion: Portion name (e.g., "Bereshit", "Noach")
            with_commentary: Include commentaries

        Returns:
            SefariaText with the Torah portion

        Example:
            >>> text = client.get_torah_portion("Bereshit")
        """
        # Normalize portion name
        portion_normalized = portion.replace(' ', '_')

        # Get the parasha
        endpoint = f'texts/{quote(portion_normalized)}'
        params = {
            'context': 0,
            'commentary': 1 if with_commentary else 0
        }

        try:
            data = self._make_request(endpoint, params)
        except requests.exceptions.HTTPError:
            # Try as a parasha reference
            endpoint = f'texts/Parashat_{quote(portion_normalized)}'
            data = self._make_request(endpoint, params)

        return SefariaText(
            reference=data.get('ref', portion),
            he_text=data.get('he', ''),
            en_text=data.get('text', ''),
            book=data.get('book', ''),
            categories=data.get('categories', []),
            version_title=data.get('versionTitle'),
            version_source=data.get('versionSource'),
            section_names=data.get('sectionNames', []),
            commentary=data.get('commentary', []),
            raw_data=data
        )

    def get_talmud(
        self,
        tractate: str,
        page: str,
        with_commentary: bool = False
    ) -> SefariaText:
        """
        Get a Talmud passage.

        Args:
            tractate: Tractate name (e.g., "Berakhot", "Shabbat")
            page: Page reference (e.g., "2a", "10b")
            with_commentary: Include commentaries

        Returns:
            SefariaText with the Talmud passage

        Example:
            >>> text = client.get_talmud("Berakhot", "2a")
        """
        reference = f'{tractate}_{page}'
        return self.get_text(reference, with_commentary=with_commentary)

    def get_commentary(
        self,
        reference: str,
        commentator: str
    ) -> SefariaText:
        """
        Get a specific commentary on a text.

        Args:
            reference: Base text reference (e.g., "Genesis 1:1")
            commentator: Commentator name (e.g., "Rashi", "Ibn Ezra")

        Returns:
            SefariaText with the commentary

        Example:
            >>> text = client.get_commentary("Genesis 1:1", "Rashi")
        """
        # Build the commentary reference
        # Format varies by commentator
        ref_normalized = self._normalize_reference(reference)
        commentator_normalized = commentator.replace(' ', '_')

        # Try different reference formats
        formats_to_try = [
            f'{commentator_normalized}_on_{ref_normalized}',
            f'{commentator_normalized},_{ref_normalized}',
        ]

        last_error = None
        for ref_format in formats_to_try:
            try:
                return self.get_text(ref_format)
            except requests.exceptions.HTTPError as e:
                last_error = e
                continue

        raise last_error

    def get_links(self, reference: str) -> List[Dict[str, Any]]:
        """
        Get all links (connections) to a text.

        Args:
            reference: Text reference

        Returns:
            List of linked texts
        """
        endpoint = f'links/{self._normalize_reference(reference)}'
        return self._make_request(endpoint)

    def get_related(self, reference: str) -> Dict[str, Any]:
        """
        Get related texts (commentaries, parallels, etc.).

        Args:
            reference: Text reference

        Returns:
            Dict with related texts by category
        """
        endpoint = f'related/{self._normalize_reference(reference)}'
        return self._make_request(endpoint)

    def list_books(self) -> List[str]:
        """
        Get a list of all available books/texts.

        Returns:
            List of book titles
        """
        return self._make_request('index')

    def get_book_info(self, book: str) -> Dict[str, Any]:
        """
        Get information about a specific book.

        Args:
            book: Book name

        Returns:
            Dict with book metadata
        """
        endpoint = f'index/{self._normalize_reference(book)}'
        return self._make_request(endpoint)


# Convenience functions
def get_text(reference: str) -> SefariaText:
    """
    Get a specific text by reference.

    Convenience function that creates a client instance.

    Args:
        reference: Text reference

    Returns:
        SefariaText with the requested text
    """
    client = SefariaClient()
    return client.get_text(reference)


def search(query: str) -> SearchResult:
    """
    Search all texts on Sefaria.

    Convenience function that creates a client instance.

    Args:
        query: Search query

    Returns:
        SearchResult with matching texts
    """
    client = SefariaClient()
    return client.search(query)


def get_torah_portion(portion: str) -> SefariaText:
    """
    Get a Torah portion.

    Convenience function that creates a client instance.

    Args:
        portion: Portion name

    Returns:
        SefariaText with the Torah portion
    """
    client = SefariaClient()
    return client.get_torah_portion(portion)


def get_talmud(tractate: str, page: str) -> SefariaText:
    """
    Get a Talmud passage.

    Convenience function that creates a client instance.

    Args:
        tractate: Tractate name
        page: Page reference

    Returns:
        SefariaText with the passage
    """
    client = SefariaClient()
    return client.get_talmud(tractate, page)


def get_commentary(reference: str, commentator: str) -> SefariaText:
    """
    Get a commentary on a text.

    Convenience function that creates a client instance.

    Args:
        reference: Base text reference
        commentator: Commentator name

    Returns:
        SefariaText with the commentary
    """
    client = SefariaClient()
    return client.get_commentary(reference, commentator)


def _flatten_text(text_data: Union[str, List]) -> str:
    """
    Flatten nested text arrays to a single string.

    Args:
        text_data: Text data (string or nested list)

    Returns:
        Flattened string
    """
    if isinstance(text_data, str):
        return text_data

    result = []
    for item in text_data:
        if isinstance(item, list):
            result.append(_flatten_text(item))
        elif item:
            result.append(str(item))

    return ' '.join(result)


def test():
    """Test function demonstrating usage of Sefaria fetch."""
    print("=" * 60)
    print("Sefaria Fetch Test")
    print("=" * 60)

    print("[INFO] Sefaria API requires no authentication")

    client = SefariaClient()
    print(f"[OK] Client initialized with base URL: {client.base_url}")

    # Test 1: Get a specific text
    print("\n" + "-" * 60)
    print("Test 1: Getting Genesis 1:1-5")
    print("-" * 60)

    try:
        text = client.get_text("Genesis 1:1-5")
        print(f"\nReference: {text.reference}")
        print(f"Book: {text.book}")
        print(f"Categories: {', '.join(text.categories)}")

        en_text = _flatten_text(text.en_text)
        print(f"\nEnglish text:\n{en_text[:500]}...")

        print("\n[OK] Text retrieved successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 2: Search
    print("\n" + "-" * 60)
    print("Test 2: Searching for 'love your neighbor'")
    print("-" * 60)

    try:
        result = client.search("love your neighbor", size=5)
        print(f"\nFound {result.total} results (showing {len(result.hits)})")

        for i, hit in enumerate(result.hits[:5], 1):
            source = hit.get('_source', {})
            ref = source.get('ref', 'Unknown')
            text = source.get('exact', source.get('naive_lemmatizer', ''))
            print(f"\n{i}. {ref}")
            if text:
                print(f"   {text[:100]}...")

        print("\n[OK] Search completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 3: Get Talmud
    print("\n" + "-" * 60)
    print("Test 3: Getting Talmud Berakhot 2a")
    print("-" * 60)

    try:
        text = client.get_talmud("Berakhot", "2a")
        print(f"\nReference: {text.reference}")
        print(f"Categories: {', '.join(text.categories)}")

        en_text = _flatten_text(text.en_text)
        if en_text:
            print(f"\nEnglish text:\n{en_text[:500]}...")
        else:
            print("\n[INFO] No English translation available")

        print("\n[OK] Talmud retrieved successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    # Test 4: Get commentary
    print("\n" + "-" * 60)
    print("Test 4: Getting Rashi commentary on Genesis 1:1")
    print("-" * 60)

    try:
        text = client.get_commentary("Genesis 1:1", "Rashi")
        print(f"\nReference: {text.reference}")

        en_text = _flatten_text(text.en_text)
        if en_text:
            print(f"\nRashi's commentary:\n{en_text[:500]}...")
        else:
            print("\n[INFO] No English translation available")

        print("\n[OK] Commentary retrieved successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
