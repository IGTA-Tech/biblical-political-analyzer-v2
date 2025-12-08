"""
Perplexity AI Research Module for Historical Faith Narrative.

This module provides functions to research historical eras, events,
figures, and scripture usage using the Perplexity AI API.

The Perplexity API uses the "sonar" model which is optimized for
research and information retrieval with web access.
"""
import os
import sys
import time
import json
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

import requests

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    PERPLEXITY_API_KEY,
    PERPLEXITY_MODEL,
    PERPLEXITY_BASE_URL,
    PERPLEXITY_RPM,
    validate_config
)


@dataclass
class ResearchResult:
    """Container for research results from Perplexity."""
    query: str
    content: str
    citations: List[str]
    model: str
    usage: Dict[str, int]
    raw_response: Dict[str, Any]


class RateLimiter:
    """Simple rate limiter for API requests."""

    def __init__(self, requests_per_minute: int):
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


class PerplexityResearcher:
    """
    Client for conducting research using Perplexity AI.

    Attributes:
        api_key: Perplexity API key
        model: Model to use (default: sonar)
        base_url: API base URL
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = PERPLEXITY_MODEL,
        base_url: str = PERPLEXITY_BASE_URL
    ):
        """
        Initialize the Perplexity researcher.

        Args:
            api_key: Optional API key (defaults to env variable)
            model: Model name to use
            base_url: API base URL
        """
        self.api_key = api_key or PERPLEXITY_API_KEY
        if not self.api_key:
            raise ValueError("Perplexity API key is required")

        self.model = model
        self.base_url = base_url
        self.rate_limiter = RateLimiter(PERPLEXITY_RPM)

        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    def _make_request(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the Perplexity API.

        Args:
            messages: List of message dicts with role and content
            system_prompt: Optional system prompt

        Returns:
            API response as dict
        """
        self.rate_limiter.wait()

        payload = {
            'model': self.model,
            'messages': messages
        }

        if system_prompt:
            payload['messages'] = [
                {'role': 'system', 'content': system_prompt}
            ] + payload['messages']

        response = requests.post(
            f'{self.base_url}/chat/completions',
            headers=self.headers,
            json=payload,
            timeout=120
        )

        response.raise_for_status()
        return response.json()

    def _parse_response(
        self,
        query: str,
        response: Dict[str, Any]
    ) -> ResearchResult:
        """
        Parse API response into ResearchResult.

        Args:
            query: Original query
            response: Raw API response

        Returns:
            ResearchResult object
        """
        content = response['choices'][0]['message']['content']
        citations = response.get('citations', [])
        usage = response.get('usage', {})

        return ResearchResult(
            query=query,
            content=content,
            citations=citations,
            model=response.get('model', self.model),
            usage=usage,
            raw_response=response
        )

    def research_era(
        self,
        era_name: str,
        start_year: int,
        end_year: int
    ) -> ResearchResult:
        """
        Research a historical era comprehensively.

        Args:
            era_name: Name of the era (e.g., "Apostolic Age", "Protestant Reformation")
            start_year: Start year (use negative for BCE)
            end_year: End year (use negative for BCE)

        Returns:
            ResearchResult with comprehensive era information

        Example:
            >>> result = researcher.research_era("Apostolic Age", 30, 100)
        """
        year_range = self._format_year_range(start_year, end_year)

        system_prompt = """You are a scholarly historian specializing in church history
        and the intersection of faith with political and social movements. Provide
        comprehensive, academically rigorous research with citations where possible."""

        query = f"""Provide a comprehensive scholarly analysis of the {era_name} ({year_range}).

        Please cover:
        1. Historical Context: Political, social, and religious landscape
        2. Key Events: Major developments and turning points
        3. Important Figures: Leaders, theologians, and influential persons
        4. Theological Developments: Doctrinal evolution and debates
        5. Scripture Usage: How biblical texts were interpreted and applied
        6. Political Implications: Relationship between faith and political authority
        7. Legacy: Long-term impact on Christianity and society
        8. Primary Sources: Key texts and documents from this period

        Focus on scholarly consensus while noting significant debates among historians."""

        messages = [{'role': 'user', 'content': query}]
        response = self._make_request(messages, system_prompt)
        return self._parse_response(query, response)

    def research_event(
        self,
        event_name: str,
        year: int
    ) -> ResearchResult:
        """
        Research a specific historical event in detail.

        Args:
            event_name: Name of the event (e.g., "Council of Nicaea")
            year: Year of the event (use negative for BCE)

        Returns:
            ResearchResult with detailed event information

        Example:
            >>> result = researcher.research_event("Council of Nicaea", 325)
        """
        year_str = self._format_year(year)

        system_prompt = """You are a scholarly historian specializing in church history.
        Provide detailed, academically rigorous research on historical events with
        primary source references where available."""

        query = f"""Provide a detailed scholarly analysis of {event_name} ({year_str}).

        Please cover:
        1. Background: Events and circumstances leading to this event
        2. Key Participants: Who was involved and their roles
        3. Proceedings: What happened during the event
        4. Outcomes: Decisions made, documents produced
        5. Biblical Basis: Scripture passages cited or debated
        6. Theological Implications: Doctrinal significance
        7. Political Context: Relationship to political powers
        8. Historical Significance: Impact on subsequent history
        9. Primary Sources: Original documents and accounts
        10. Scholarly Debates: Areas of historical controversy

        Cite specific primary sources and scholarly works where possible."""

        messages = [{'role': 'user', 'content': query}]
        response = self._make_request(messages, system_prompt)
        return self._parse_response(query, response)

    def research_figure(self, name: str) -> ResearchResult:
        """
        Research a historical figure in depth.

        Args:
            name: Name of the historical figure

        Returns:
            ResearchResult with biographical and theological information

        Example:
            >>> result = researcher.research_figure("Augustine of Hippo")
        """
        system_prompt = """You are a scholarly historian specializing in church history
        and biography. Provide comprehensive biographical and intellectual analysis
        with attention to primary sources."""

        query = f"""Provide a comprehensive scholarly biography and analysis of {name}.

        Please cover:
        1. Biographical Details: Birth, death, major life events
        2. Historical Context: Political and religious environment
        3. Education and Influences: Intellectual formation
        4. Major Works: Key writings and their significance
        5. Theological Contributions: Doctrinal positions and innovations
        6. Biblical Interpretation: Approach to Scripture, key interpretations
        7. Political Views: Relationship to political authority
        8. Legacy: Influence on subsequent Christianity
        9. Controversies: Debates and conflicts during their life
        10. Primary Sources: Key texts by and about this figure
        11. Modern Scholarly Assessment: How historians evaluate them today

        Include specific quotes and references where possible."""

        messages = [{'role': 'user', 'content': query}]
        response = self._make_request(messages, system_prompt)
        return self._parse_response(query, response)

    def research_scripture_usage(
        self,
        passage: str,
        era: str
    ) -> ResearchResult:
        """
        Research how a scripture passage was used in a specific era.

        Args:
            passage: Biblical reference (e.g., "Romans 13:1-7")
            era: Historical era or period name

        Returns:
            ResearchResult with history of scripture interpretation

        Example:
            >>> result = researcher.research_scripture_usage(
            ...     "Romans 13:1-7", "Medieval Period"
            ... )
        """
        system_prompt = """You are a scholar specializing in the history of biblical
        interpretation and hermeneutics. Provide detailed analysis of how specific
        passages have been understood across different historical contexts."""

        query = f"""Analyze how {passage} was interpreted and used during the {era}.

        Please cover:
        1. The Passage: Brief overview of the text and its original context
        2. Era Context: Political and religious situation of the {era}
        3. Major Interpreters: Key figures who commented on this passage
        4. Interpretive Approaches: How the passage was understood
        5. Political Applications: How it was used regarding political authority
        6. Theological Implications: Doctrinal conclusions drawn
        7. Controversies: Debates about the passage's meaning
        8. Comparative Analysis: How this interpretation differed from other eras
        9. Primary Sources: Original commentaries and uses of this passage
        10. Modern Assessment: How scholars today view these interpretations

        Provide specific quotes from interpreters where available."""

        messages = [{'role': 'user', 'content': query}]
        response = self._make_request(messages, system_prompt)
        return self._parse_response(query, response)

    def custom_research(
        self,
        query: str,
        system_prompt: Optional[str] = None
    ) -> ResearchResult:
        """
        Conduct custom research with a free-form query.

        Args:
            query: Research question or topic
            system_prompt: Optional custom system prompt

        Returns:
            ResearchResult with research findings
        """
        default_system = """You are a scholarly researcher specializing in church
        history, theology, and the intersection of faith and politics. Provide
        comprehensive, academically rigorous responses with citations."""

        messages = [{'role': 'user', 'content': query}]
        response = self._make_request(messages, system_prompt or default_system)
        return self._parse_response(query, response)

    @staticmethod
    def _format_year(year: int) -> str:
        """Format a year, handling BCE/CE notation."""
        if year < 0:
            return f"{abs(year)} BCE"
        return f"{year} CE"

    @staticmethod
    def _format_year_range(start: int, end: int) -> str:
        """Format a year range, handling BCE/CE notation."""
        start_str = PerplexityResearcher._format_year(start)
        end_str = PerplexityResearcher._format_year(end)
        return f"{start_str} - {end_str}"


def research_era(
    era_name: str,
    start_year: int,
    end_year: int
) -> ResearchResult:
    """
    Research a historical era comprehensively.

    Convenience function that creates a researcher instance.

    Args:
        era_name: Name of the era
        start_year: Start year (negative for BCE)
        end_year: End year (negative for BCE)

    Returns:
        ResearchResult with comprehensive era information
    """
    researcher = PerplexityResearcher()
    return researcher.research_era(era_name, start_year, end_year)


def research_event(event_name: str, year: int) -> ResearchResult:
    """
    Research a specific historical event.

    Convenience function that creates a researcher instance.

    Args:
        event_name: Name of the event
        year: Year of the event (negative for BCE)

    Returns:
        ResearchResult with detailed event information
    """
    researcher = PerplexityResearcher()
    return researcher.research_event(event_name, year)


def research_figure(name: str) -> ResearchResult:
    """
    Research a historical figure.

    Convenience function that creates a researcher instance.

    Args:
        name: Name of the historical figure

    Returns:
        ResearchResult with biographical information
    """
    researcher = PerplexityResearcher()
    return researcher.research_figure(name)


def research_scripture_usage(passage: str, era: str) -> ResearchResult:
    """
    Research how scripture was used in a specific era.

    Convenience function that creates a researcher instance.

    Args:
        passage: Biblical reference
        era: Historical era name

    Returns:
        ResearchResult with interpretation history
    """
    researcher = PerplexityResearcher()
    return researcher.research_scripture_usage(passage, era)


def test():
    """Test function demonstrating usage of the Perplexity researcher."""
    print("=" * 60)
    print("Perplexity Researcher Test")
    print("=" * 60)

    try:
        validate_config('PERPLEXITY_API_KEY')
        print("[OK] API key configured")
    except ValueError as e:
        print(f"[ERROR] {e}")
        print("Please set PERPLEXITY_API_KEY in your .env file")
        return

    researcher = PerplexityResearcher()
    print(f"[OK] Researcher initialized with model: {researcher.model}")

    # Test: Research a historical figure
    print("\n" + "-" * 60)
    print("Test: Researching Augustine of Hippo")
    print("-" * 60)

    try:
        result = researcher.research_figure("Augustine of Hippo")
        print(f"\nQuery: {result.query[:80]}...")
        print(f"\nContent preview ({len(result.content)} chars):")
        print(result.content[:500] + "...")

        if result.citations:
            print(f"\nCitations ({len(result.citations)}):")
            for i, citation in enumerate(result.citations[:5], 1):
                print(f"  {i}. {citation}")

        print(f"\nUsage: {result.usage}")
        print("\n[OK] Research completed successfully")

    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] API request failed: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == '__main__':
    test()
