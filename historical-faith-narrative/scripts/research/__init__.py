"""
Research Module for Historical Faith Narrative.

This module provides a collection of API clients and utilities for
researching historical Christian texts, academic papers, and religious
sources for the Historical Faith Narrative content generation system.

Available Modules:
    perplexity_researcher - AI-powered research using Perplexity
    semantic_scholar_search - Academic paper search via Semantic Scholar
    internet_archive_fetch - Historical texts from Internet Archive
    sefaria_fetch - Jewish texts and commentaries from Sefaria
    bible_fetch - Bible passages from API.Bible
    web_scraper - Web scraping using Firecrawl and Jina Reader
    openalex_search - Scholarly metadata from OpenAlex
    core_search - Open access papers from CORE

Usage:
    from research.perplexity_researcher import research_era, research_figure
    from research.bible_fetch import get_passage
    from research.sefaria_fetch import get_talmud
"""

from .perplexity_researcher import (
    PerplexityResearcher,
    research_era,
    research_event,
    research_figure,
    research_scripture_usage,
)

from .semantic_scholar_search import (
    SemanticScholarClient,
    search_papers as semantic_scholar_search_papers,
    search_era as semantic_scholar_search_era,
    search_event as semantic_scholar_search_event,
    get_paper_details,
)

from .internet_archive_fetch import (
    InternetArchiveClient,
    search_texts as archive_search_texts,
    get_church_fathers,
    get_ante_nicene_fathers,
    get_nicene_fathers,
    get_item_text as archive_get_item_text,
)

from .sefaria_fetch import (
    SefariaClient,
    get_text as sefaria_get_text,
    search as sefaria_search,
    get_torah_portion,
    get_talmud,
    get_commentary,
)

from .bible_fetch import (
    BibleClient,
    get_passage,
    search as bible_search,
    get_available_versions,
    parse_reference,
)

from .web_scraper import (
    WebScraper,
    scrape_url,
    read_url,
    scrape_new_advent,
    scrape_ccel,
)

from .openalex_search import (
    OpenAlexClient,
    search_works as openalex_search_works,
    get_author as openalex_get_author,
    get_citations as openalex_get_citations,
)

from .core_search import (
    COREClient,
    search_papers as core_search_papers,
    get_paper as core_get_paper,
    get_full_text as core_get_full_text,
)

__all__ = [
    # Perplexity
    'PerplexityResearcher',
    'research_era',
    'research_event',
    'research_figure',
    'research_scripture_usage',
    # Semantic Scholar
    'SemanticScholarClient',
    'semantic_scholar_search_papers',
    'semantic_scholar_search_era',
    'semantic_scholar_search_event',
    'get_paper_details',
    # Internet Archive
    'InternetArchiveClient',
    'archive_search_texts',
    'get_church_fathers',
    'get_ante_nicene_fathers',
    'get_nicene_fathers',
    'archive_get_item_text',
    # Sefaria
    'SefariaClient',
    'sefaria_get_text',
    'sefaria_search',
    'get_torah_portion',
    'get_talmud',
    'get_commentary',
    # Bible
    'BibleClient',
    'get_passage',
    'bible_search',
    'get_available_versions',
    'parse_reference',
    # Web Scraper
    'WebScraper',
    'scrape_url',
    'read_url',
    'scrape_new_advent',
    'scrape_ccel',
    # OpenAlex
    'OpenAlexClient',
    'openalex_search_works',
    'openalex_get_author',
    'openalex_get_citations',
    # CORE
    'COREClient',
    'core_search_papers',
    'core_get_paper',
    'core_get_full_text',
]
