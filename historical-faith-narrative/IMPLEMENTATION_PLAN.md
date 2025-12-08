# Historical Faith Narrative - Implementation Plan

## Content Generation System for 4 BC - 2024 AD

Last Updated: December 8, 2025

---

## Executive Summary

This implementation plan provides a comprehensive architecture for the Historical Faith Narrative content generation system. The system will use **ALL 13 configured APIs** to research, generate, verify, and ingest historical content about Christianity and Judaism.

---

## 1. API USAGE MATRIX

| API | Purpose | Rate Limit | Usage |
|-----|---------|------------|-------|
| **Perplexity** | Research queries, fact-finding | Standard | Primary research for each era/event |
| **OpenAI** | Embeddings (text-embedding-3-small) | Standard | All content gets embeddings |
| **API.Bible** | Bible texts (2,500+ versions) | 5,000/day | Scripture references, multiple translations |
| **Sefaria** | Jewish texts (Torah, Talmud, commentaries) | Respectful | Judaism track, rabbinic sources |
| **Semantic Scholar** | Academic papers | 1 req/sec | Scholarly citations |
| **CORE** | Open access papers | Standard | Full-text academic sources |
| **OpenAlex** | Scholarly metadata | 100K/day | Citation networks, author data |
| **Internet Archive** | Church Fathers, manuscripts | Standard | Primary historical sources |
| **Firecrawl** | Web scraping | 500/month | Complex web sources |
| **Jina Reader** | URL to markdown | Unlimited | Quick web content |
| **Google Cloud Vision** | OCR | 1,000/month | Manuscript images |
| **Supabase** | Database + vectors | Unlimited | Storage and retrieval |
| **Mapbox** | Geographic data | 50K/month | Location coordinates |

---

## 2. FOLDER STRUCTURE

```
historical-faith-narrative/
├── IMPLEMENTATION_PLAN.md          # This file
├── README.md                       # Overview
│
├── scripts/
│   ├── config.py                   # API configuration & clients
│   ├── models.py                   # Data models
│   │
│   ├── research/                   # RESEARCH SCRIPTS
│   │   ├── perplexity_researcher.py    # Query Perplexity for facts
│   │   ├── semantic_scholar_search.py  # Academic paper search
│   │   ├── core_search.py              # Open access papers
│   │   ├── openalex_search.py          # Scholarly metadata
│   │   ├── internet_archive_fetch.py   # Church Fathers, manuscripts
│   │   ├── sefaria_fetch.py            # Jewish texts
│   │   ├── bible_fetch.py              # Bible passages
│   │   ├── web_scraper.py              # Firecrawl + Jina
│   │   └── ocr_processor.py            # Google Cloud Vision
│   │
│   ├── generation/                 # GENERATION SCRIPTS
│   │   ├── era_generator.py            # Era-by-era content
│   │   ├── event_generator.py          # Individual events
│   │   ├── figure_generator.py         # Historical figures
│   │   ├── movement_generator.py       # Religious movements
│   │   ├── perspective_generator.py    # Multi-perspective content
│   │   └── scripture_usage_generator.py # Scripture tracking
│   │
│   ├── verification/               # VERIFICATION SCRIPTS
│   │   ├── fact_checker.py             # Cross-reference sources
│   │   ├── source_validator.py         # Validate citations
│   │   └── consensus_checker.py        # Check scholarly consensus
│   │
│   └── ingestion/                  # DATABASE INGESTION
│       ├── embedding_generator.py      # OpenAI embeddings
│       ├── supabase_loader.py          # Load to database
│       └── batch_processor.py          # Batch operations
│
├── sources/                        # PRIMARY SOURCES
│   ├── christianity/
│   │   ├── church_fathers/
│   │   ├── councils/
│   │   └── historical_documents/
│   ├── judaism/
│   │   ├── talmudic/
│   │   ├── rabbinic/
│   │   └── historical/
│   └── academic/
│       ├── papers/
│       └── citations/
│
├── content/                        # GENERATED CONTENT
│   ├── eras/
│   │   ├── 01_apostolic_4bc_100ad.md
│   │   ├── 02_ante_nicene_100_325.md
│   │   ├── 03_post_nicene_325_600.md
│   │   ├── 04_early_medieval_600_1000.md
│   │   ├── 05_high_medieval_1000_1300.md
│   │   ├── 06_late_medieval_1300_1517.md
│   │   ├── 07_reformation_1517_1648.md
│   │   ├── 08_post_reformation_1648_1800.md
│   │   ├── 09_modern_1800_1950.md
│   │   └── 10_contemporary_1950_2024.md
│   ├── figures/
│   ├── events/
│   ├── perspectives/
│   └── scripture-usage/
│
├── data/                           # STRUCTURED DATA (JSON)
│   ├── eras.json
│   ├── events.json
│   ├── figures.json
│   ├── movements.json
│   ├── scripture_usage.json
│   └── perspectives.json
│
└── output/
    └── historical_faith_narrative.md   # Final combined document
```

---

## 3. DATA MODELS

### 3.1 Era Model
```python
@dataclass
class Era:
    id: str
    name: str
    start_year: int
    end_year: int
    description: str
    key_events: List[str]
    key_figures: List[str]
    christianity_status: str
    judaism_status: str
```

### 3.2 Event Model
```python
@dataclass
class Event:
    id: str
    title: str
    year_start: int
    year_end: Optional[int]
    era_id: str
    event_type: str  # council, persecution, reform, schism, etc.
    traditions_affected: List[str]
    location: str
    location_lat: float
    location_lng: float
    summary: str
    detailed_narrative: str
    significance: str
    scholarly_consensus: str
    primary_sources: List[str]
    interpretations: Dict[str, str]  # perspective -> interpretation
    scripture_used: List[str]
    embedding: List[float]
```

### 3.3 Figure Model
```python
@dataclass
class Figure:
    id: str
    name: str
    alternate_names: List[str]
    birth_year: Optional[int]
    death_year: Optional[int]
    tradition: str
    roles: List[str]
    biography: str
    key_contributions: List[str]
    controversies: List[str]
    related_events: List[str]
    embedding: List[float]
```

### 3.4 Scripture Usage Model (KILLER FEATURE)
```python
@dataclass
class ScriptureUsage:
    id: str
    passage_reference: str
    passage_text: str
    event_id: Optional[str]
    figure_id: Optional[str]
    movement_id: Optional[str]
    usage_year: int
    usage_era_id: str
    usage_type: str  # justification, proof-text, liturgical, polemic, inspirational
    usage_context: str
    how_used: str
    interpretation_given: str
    faithful_to_original_context: str  # yes, partial, no, debated
    impact_description: str
    perspective_views: Dict[str, str]
    embedding: List[float]
```

### 3.5 Perspective Model
```python
@dataclass
class Perspective:
    id: str
    name: str  # Orthodox, Catholic, Protestant, Jewish, Academic
    tradition: str
    description: str
    methodology: str
    key_assumptions: List[str]
```

---

## 4. SCRIPT SPECIFICATIONS

### 4.1 config.py - API Configuration

```python
"""
Central configuration for all API clients.
Loads from .env and provides initialized clients.
"""

import os
from dotenv import load_dotenv

load_dotenv('/home/sherrod/biblical-political-analyzer-v2/.env')

# API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
API_BIBLE_KEY = os.getenv('API_BIBLE_KEY')
API_BIBLE_URL = os.getenv('API_BIBLE_URL', 'https://rest.api.bible/v1')
SEFARIA_BASE_URL = os.getenv('SEFARIA_BASE_URL', 'https://www.sefaria.org/api')
SEMANTIC_SCHOLAR_API_KEY = os.getenv('SEMANTIC_SCHOLAR_API_KEY')
CORE_API_KEY = os.getenv('CORE_API_KEY')
INTERNET_ARCHIVE_ACCESS_KEY = os.getenv('INTERNET_ARCHIVE_ACCESS_KEY')
INTERNET_ARCHIVE_SECRET_KEY = os.getenv('INTERNET_ARCHIVE_SECRET_KEY')
FIRECRAWL_API_KEY = os.getenv('FIRECRAWL_API_KEY')
GOOGLE_CLOUD_VISION_API_KEY = os.getenv('GOOGLE_CLOUD_VISION_API_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
MAPBOX_API_KEY = os.getenv('MAPBOX_API_KEY')

# Rate limiting
RATE_LIMITS = {
    'semantic_scholar': 1.0,  # 1 request per second
    'perplexity': 0.5,
    'api_bible': 0.1,
    'sefaria': 0.5,
    'core': 0.5,
    'internet_archive': 0.5,
    'firecrawl': 2.0,
    'openai': 0.1,
}
```

### 4.2 perplexity_researcher.py - Research Engine

```python
"""
Uses Perplexity API to research historical facts.
Primary research tool for each era and event.
"""

import requests
import time
from config import PERPLEXITY_API_KEY, RATE_LIMITS

class PerplexityResearcher:
    def __init__(self):
        self.api_key = PERPLEXITY_API_KEY
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.model = "sonar"  # or "sonar-pro" for deeper research

    def research_era(self, era_name: str, start_year: int, end_year: int) -> dict:
        """Research a historical era comprehensively."""
        prompt = f"""
        Research the period {era_name} ({start_year} to {end_year}) in religious history.

        Provide detailed information on:
        1. Major events in Christianity during this period
        2. Major events in Judaism during this period
        3. Key figures and their contributions
        4. Theological developments
        5. Persecutions or conflicts
        6. Scripture usage and interpretation trends
        7. Geographic spread of faith

        Include specific dates, names, and cite scholarly sources.
        """
        return self._query(prompt)

    def research_event(self, event_name: str, year: int) -> dict:
        """Deep research on a specific historical event."""
        prompt = f"""
        Research the historical event: {event_name} ({year} AD/BC)

        Provide:
        1. Detailed description of what happened
        2. Key participants
        3. Causes and context
        4. Immediate and long-term consequences
        5. How different traditions view this event:
           - Eastern Orthodox perspective
           - Roman Catholic perspective
           - Protestant perspective
           - Jewish perspective
           - Academic/secular perspective
        6. Primary sources that document this event
        7. Scripture passages used or cited in connection with this event

        Cite scholarly sources.
        """
        return self._query(prompt)

    def research_scripture_usage(self, passage: str, era: str) -> dict:
        """Research how a scripture passage was used in a specific era."""
        prompt = f"""
        Research how {passage} was used and interpreted during {era}.

        Provide:
        1. Who used this passage and when
        2. In what context was it used
        3. How was it interpreted
        4. Was this interpretation faithful to the original context?
        5. What impact did this usage have
        6. Different perspectives on this usage

        Cite specific historical sources.
        """
        return self._query(prompt)

    def _query(self, prompt: str) -> dict:
        """Execute a query against Perplexity API."""
        time.sleep(RATE_LIMITS['perplexity'])

        response = requests.post(
            self.base_url,
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        return response.json()
```

### 4.3 semantic_scholar_search.py - Academic Sources

```python
"""
Search Semantic Scholar for academic papers on religious history.
"""

import requests
import time
from config import SEMANTIC_SCHOLAR_API_KEY, RATE_LIMITS

class SemanticScholarSearch:
    def __init__(self):
        self.api_key = SEMANTIC_SCHOLAR_API_KEY
        self.base_url = "https://api.semanticscholar.org/graph/v1"

    def search_papers(self, query: str, limit: int = 10) -> list:
        """Search for academic papers."""
        time.sleep(RATE_LIMITS['semantic_scholar'])

        response = requests.get(
            f"{self.base_url}/paper/search",
            params={"query": query, "limit": limit, "fields": "title,authors,year,abstract,citationCount,url"},
            headers={"x-api-key": self.api_key}
        )
        return response.json().get('data', [])

    def search_era(self, era_name: str) -> list:
        """Search for papers about a specific era."""
        queries = [
            f"{era_name} Christianity history",
            f"{era_name} Judaism history",
            f"{era_name} religious history"
        ]
        results = []
        for q in queries:
            results.extend(self.search_papers(q, limit=5))
        return results

    def search_event(self, event_name: str) -> list:
        """Search for papers about a specific event."""
        return self.search_papers(event_name, limit=10)
```

### 4.4 internet_archive_fetch.py - Church Fathers & Historical Texts

```python
"""
Fetch texts from Internet Archive - Church Fathers, manuscripts, historical documents.
"""

import requests
from config import INTERNET_ARCHIVE_ACCESS_KEY, INTERNET_ARCHIVE_SECRET_KEY

class InternetArchiveFetch:
    def __init__(self):
        self.access_key = INTERNET_ARCHIVE_ACCESS_KEY
        self.secret_key = INTERNET_ARCHIVE_SECRET_KEY

    def search_texts(self, query: str, collection: str = None) -> list:
        """Search Internet Archive for texts."""
        params = {"q": query, "output": "json", "rows": 20}
        if collection:
            params["q"] += f" AND collection:{collection}"

        response = requests.get(
            "https://archive.org/advancedsearch.php",
            params=params
        )
        return response.json().get('response', {}).get('docs', [])

    def get_church_fathers(self, father_name: str) -> list:
        """Get writings of a specific Church Father."""
        return self.search_texts(
            f"{father_name}",
            collection="churchfathers"
        )

    def get_ante_nicene_fathers(self) -> list:
        """Get Ante-Nicene Fathers collection."""
        return self.search_texts("ante-nicene fathers")

    def get_nicene_fathers(self) -> list:
        """Get Nicene and Post-Nicene Fathers collection."""
        return self.search_texts("nicene post-nicene fathers")

    def get_item_text(self, identifier: str) -> str:
        """Get full text of an item."""
        response = requests.get(
            f"https://archive.org/download/{identifier}/{identifier}_djvu.txt"
        )
        return response.text if response.ok else None
```

### 4.5 sefaria_fetch.py - Jewish Texts

```python
"""
Fetch Jewish texts from Sefaria API - Torah, Talmud, commentaries.
"""

import requests
from config import SEFARIA_BASE_URL

class SefariaFetch:
    def __init__(self):
        self.base_url = SEFARIA_BASE_URL

    def get_text(self, reference: str) -> dict:
        """Get a specific text by reference."""
        response = requests.get(f"{self.base_url}/texts/{reference}")
        return response.json()

    def search(self, query: str) -> list:
        """Search Sefaria texts."""
        response = requests.get(
            f"{self.base_url}/search-wrapper",
            params={"q": query, "type": "text"}
        )
        return response.json()

    def get_torah_portion(self, portion: str) -> dict:
        """Get a Torah portion."""
        return self.get_text(portion)

    def get_talmud_passage(self, tractate: str, page: str) -> dict:
        """Get a Talmud passage."""
        return self.get_text(f"{tractate}.{page}")

    def get_commentary(self, reference: str, commentator: str) -> dict:
        """Get commentary on a passage."""
        return self.get_text(f"{commentator} on {reference}")
```

### 4.6 bible_fetch.py - Bible Texts

```python
"""
Fetch Bible texts from API.Bible - multiple versions and languages.
"""

import requests
from config import API_BIBLE_KEY, API_BIBLE_URL

class BibleFetch:
    def __init__(self):
        self.api_key = API_BIBLE_KEY
        self.base_url = API_BIBLE_URL
        self.headers = {"api-key": self.api_key}

        # Common Bible IDs
        self.versions = {
            "KJV": "de4e12af7f28f599-02",
            "ESV": "f421fe261da7624f-01",
            "NIV": "78a9f6124f344018-01",
            "NASB": "...",
            # Add more as needed
        }

    def get_passage(self, reference: str, version: str = "KJV") -> dict:
        """Get a Bible passage."""
        bible_id = self.versions.get(version, self.versions["KJV"])

        # Parse reference to API format
        passage_id = self._parse_reference(reference)

        response = requests.get(
            f"{self.base_url}/bibles/{bible_id}/passages/{passage_id}",
            headers=self.headers,
            params={"content-type": "text"}
        )
        return response.json()

    def search(self, query: str, version: str = "KJV") -> list:
        """Search Bible for text."""
        bible_id = self.versions.get(version, self.versions["KJV"])

        response = requests.get(
            f"{self.base_url}/bibles/{bible_id}/search",
            headers=self.headers,
            params={"query": query}
        )
        return response.json().get('data', {}).get('verses', [])

    def _parse_reference(self, reference: str) -> str:
        """Convert human reference to API format."""
        # Matthew 16:18 -> MAT.16.18
        # Implementation needed
        pass
```

### 4.7 era_generator.py - Era Content Generation

```python
"""
Generate comprehensive content for each historical era.
Orchestrates all research APIs to create era narratives.
"""

from research.perplexity_researcher import PerplexityResearcher
from research.semantic_scholar_search import SemanticScholarSearch
from research.internet_archive_fetch import InternetArchiveFetch
from research.sefaria_fetch import SefariaFetch
from research.bible_fetch import BibleFetch

class EraGenerator:
    def __init__(self):
        self.perplexity = PerplexityResearcher()
        self.scholar = SemanticScholarSearch()
        self.archive = InternetArchiveFetch()
        self.sefaria = SefariaFetch()
        self.bible = BibleFetch()

    def generate_era(self, era: dict) -> dict:
        """Generate complete content for an era."""

        # 1. Research the era using Perplexity
        research = self.perplexity.research_era(
            era['name'], era['start_year'], era['end_year']
        )

        # 2. Get academic sources
        papers = self.scholar.search_era(era['name'])

        # 3. Get primary sources from Internet Archive
        if era['start_year'] < 600:
            primary_sources = self.archive.get_church_fathers()
        else:
            primary_sources = self.archive.search_texts(era['name'])

        # 4. Get relevant Jewish texts
        jewish_context = self.sefaria.search(era['name'])

        # 5. Compile into structured content
        content = {
            'era': era,
            'research': research,
            'academic_sources': papers,
            'primary_sources': primary_sources,
            'jewish_context': jewish_context,
            'narrative': self._compile_narrative(research, papers, primary_sources),
            'events': self._extract_events(research),
            'figures': self._extract_figures(research),
            'scripture_usage': self._extract_scripture_usage(research)
        }

        return content

    def _compile_narrative(self, research, papers, sources) -> str:
        """Compile all research into a cohesive narrative."""
        # Implementation
        pass

    def _extract_events(self, research) -> list:
        """Extract individual events from research."""
        # Implementation
        pass

    def _extract_figures(self, research) -> list:
        """Extract historical figures from research."""
        # Implementation
        pass

    def _extract_scripture_usage(self, research) -> list:
        """Extract scripture usage instances from research."""
        # Implementation
        pass
```

### 4.8 embedding_generator.py - OpenAI Embeddings

```python
"""
Generate embeddings for all content using OpenAI.
"""

import openai
from config import OPENAI_API_KEY

class EmbeddingGenerator:
    def __init__(self):
        openai.api_key = OPENAI_API_KEY
        self.model = "text-embedding-3-small"

    def generate_embedding(self, text: str) -> list:
        """Generate embedding for a single text."""
        response = openai.embeddings.create(
            model=self.model,
            input=text
        )
        return response.data[0].embedding

    def generate_batch(self, texts: list) -> list:
        """Generate embeddings for multiple texts."""
        response = openai.embeddings.create(
            model=self.model,
            input=texts
        )
        return [item.embedding for item in response.data]

    def embed_event(self, event: dict) -> list:
        """Generate embedding for an event."""
        text = f"{event['title']} {event['summary']} {event['detailed_narrative']}"
        return self.generate_embedding(text)

    def embed_figure(self, figure: dict) -> list:
        """Generate embedding for a figure."""
        text = f"{figure['name']} {figure['biography']} {' '.join(figure['key_contributions'])}"
        return self.generate_embedding(text)

    def embed_scripture_usage(self, usage: dict) -> list:
        """Generate embedding for a scripture usage."""
        text = f"{usage['passage_reference']} {usage['how_used']} {usage['interpretation_given']}"
        return self.generate_embedding(text)
```

### 4.9 supabase_loader.py - Database Ingestion

```python
"""
Load generated content into Supabase database.
"""

from supabase import create_client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

class SupabaseLoader:
    def __init__(self):
        self.client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    def load_era(self, era: dict):
        """Load an era into the database."""
        return self.client.table('eras').upsert(era).execute()

    def load_event(self, event: dict):
        """Load an event into the database."""
        return self.client.table('events').upsert(event).execute()

    def load_figure(self, figure: dict):
        """Load a figure into the database."""
        return self.client.table('figures').upsert(figure).execute()

    def load_scripture_usage(self, usage: dict):
        """Load a scripture usage into the database."""
        return self.client.table('scripture_usage').upsert(usage).execute()

    def load_event_interpretation(self, interpretation: dict):
        """Load an event interpretation into the database."""
        return self.client.table('event_interpretations').upsert(interpretation).execute()

    def bulk_load(self, table: str, records: list):
        """Bulk load records into a table."""
        return self.client.table(table).upsert(records).execute()
```

---

## 5. ERAS TO GENERATE

| # | Era Name | Years | Key Focus |
|---|----------|-------|-----------|
| 1 | Apostolic Era | 4 BC - 100 AD | Jesus, Apostles, early church, Jewish context |
| 2 | Ante-Nicene Period | 100 - 325 AD | Church Fathers, persecutions, heresies |
| 3 | Post-Nicene/Byzantine | 325 - 600 AD | Councils, creeds, East-West divide |
| 4 | Early Medieval | 600 - 1000 AD | Islam rise, monasticism, Charlemagne |
| 5 | High Medieval | 1000 - 1300 AD | Crusades, Scholasticism, Jewish persecution |
| 6 | Late Medieval | 1300 - 1517 AD | Pre-Reformation, Black Death, mysticism |
| 7 | Reformation | 1517 - 1648 AD | Luther, Calvin, Counter-Reformation |
| 8 | Post-Reformation | 1648 - 1800 AD | Enlightenment, pietism, revivals |
| 9 | Modern Era | 1800 - 1950 AD | Liberalism, fundamentalism, Holocaust |
| 10 | Contemporary | 1950 - 2024 AD | Vatican II, ecumenism, Israel, secularization |

---

## 6. IMPLEMENTATION ORDER

### Phase 1: Foundation (Days 1-2)
1. Set up `scripts/config.py` with all API clients
2. Create `scripts/models.py` with data models
3. Test each API connection

### Phase 2: Research Scripts (Days 3-5)
4. Implement `perplexity_researcher.py`
5. Implement `semantic_scholar_search.py`
6. Implement `internet_archive_fetch.py`
7. Implement `sefaria_fetch.py`
8. Implement `bible_fetch.py`
9. Implement `web_scraper.py` (Firecrawl + Jina)

### Phase 3: Generation Scripts (Days 6-8)
10. Implement `era_generator.py`
11. Implement `event_generator.py`
12. Implement `figure_generator.py`
13. Implement `perspective_generator.py`
14. Implement `scripture_usage_generator.py`

### Phase 4: Verification (Days 9-10)
15. Implement `fact_checker.py`
16. Implement `source_validator.py`

### Phase 5: Ingestion (Days 11-12)
17. Implement `embedding_generator.py`
18. Implement `supabase_loader.py`
19. Implement `batch_processor.py`

### Phase 6: Content Generation (Days 13-30)
20. Generate Era 1: Apostolic (4 BC - 100 AD)
21. Generate Era 2: Ante-Nicene (100 - 325 AD)
22. Continue through all 10 eras...

---

## 7. OUTPUT FORMATS

### Markdown Narrative (per era)
```markdown
# Era Name (Start - End)

## Overview
[Comprehensive summary]

## Christianity Track
### Major Events
### Key Figures
### Theological Developments
### Scripture Usage

## Judaism Track
### Major Events
### Key Figures
### Rabbinic Developments
### Scripture Interpretation

## Intersections
### Jewish-Christian Relations
### Shared History
### Conflicts

## Multi-Perspective Analysis
### Orthodox View
### Catholic View
### Protestant View
### Jewish View
### Academic View

## Sources
### Primary Sources
### Academic Citations
```

### JSON Data (for database)
```json
{
  "events": [...],
  "figures": [...],
  "movements": [...],
  "scripture_usage": [...],
  "sources": [...]
}
```

---

## 8. QUALITY ASSURANCE

1. **Source Verification**: Every claim must have a citation
2. **Multi-Source Confirmation**: Major facts confirmed by 2+ sources
3. **Perspective Balance**: All 5 perspectives represented
4. **Scripture Accuracy**: All references verified against API.Bible/Sefaria
5. **Embedding Quality**: Test semantic search accuracy
6. **Academic Rigor**: Include scholarly consensus indicators

---

## Ready to Begin

This plan provides a comprehensive architecture for generating the Historical Faith Narrative using all 13 configured APIs. The modular design allows for parallel development and incremental content generation.

**Next Step**: Run `python scripts/config.py` to verify all API connections.
