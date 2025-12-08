#!/usr/bin/env python3
"""
Generate Historical Faith Narrative Content for All Eras

This script generates comprehensive historical narrative content for each era
from 4 BC to 2024 AD using multiple APIs:
- Perplexity for research
- Semantic Scholar for academic sources
- Sefaria for Jewish texts
- API.Bible for Bible passages
- Internet Archive for historical texts

Usage:
    python generate_all_eras.py [era_number]

    If era_number is provided (2-10), generates only that era.
    If no argument, generates all eras 2-10.
"""

import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    PERPLEXITY_API_KEY,
    PERPLEXITY_MODEL,
    PERPLEXITY_BASE_URL,
    SEMANTIC_SCHOLAR_API_KEY,
    SEMANTIC_SCHOLAR_BASE_URL,
    API_BIBLE_KEY,
    API_BIBLE_URL,
    SEFARIA_BASE_URL,
    INTERNET_ARCHIVE_BASE_URL,
    DATA_DIR,
)

import requests

# ============================================================================
# ERA DEFINITIONS
# ============================================================================

ERAS = {
    2: {
        "name": "Ante-Nicene Period",
        "start_year": 100,
        "end_year": 325,
        "description": "The age of the Church Fathers before the Council of Nicaea",
        "key_figures": [
            "Ignatius of Antioch",
            "Polycarp",
            "Justin Martyr",
            "Irenaeus of Lyon",
            "Tertullian",
            "Origen",
            "Cyprian of Carthage",
            "Clement of Alexandria"
        ],
        "key_events": [
            "Persecution under Trajan",
            "Persecution under Marcus Aurelius",
            "Persecution under Decius",
            "Great Persecution under Diocletian",
            "Edict of Milan (313)"
        ],
        "key_scriptures": [
            "Matthew 28:19-20",
            "John 1:1-14",
            "Romans 13:1-7",
            "1 Timothy 3:1-7",
            "Hebrews 11:1"
        ],
        "themes": [
            "Martyrdom and persecution",
            "Development of Christian theology",
            "Canon formation",
            "Early church organization",
            "Apologetics against paganism"
        ]
    },
    3: {
        "name": "Post-Nicene and Byzantine Period",
        "start_year": 325,
        "end_year": 600,
        "description": "The age of the great councils and the Christianization of the Roman Empire",
        "key_figures": [
            "Constantine the Great",
            "Athanasius of Alexandria",
            "Basil the Great",
            "Gregory of Nazianzus",
            "Gregory of Nyssa",
            "Ambrose of Milan",
            "Jerome",
            "Augustine of Hippo",
            "John Chrysostom"
        ],
        "key_events": [
            "Council of Nicaea (325)",
            "Council of Constantinople (381)",
            "Council of Ephesus (431)",
            "Council of Chalcedon (451)",
            "Fall of Western Roman Empire (476)"
        ],
        "key_scriptures": [
            "John 1:1-14",
            "Philippians 2:5-11",
            "Colossians 1:15-20",
            "Romans 5:12-21",
            "Matthew 16:18-19"
        ],
        "themes": [
            "Trinitarian theology",
            "Christological debates",
            "Church-state relations",
            "Monasticism",
            "Biblical canon finalization"
        ]
    },
    4: {
        "name": "Early Medieval Period",
        "start_year": 600,
        "end_year": 1000,
        "description": "The age of missionary expansion and the rise of Christendom",
        "key_figures": [
            "Gregory the Great",
            "Isidore of Seville",
            "Bede the Venerable",
            "Boniface",
            "Charlemagne",
            "John of Damascus",
            "Alcuin of York"
        ],
        "key_events": [
            "Mission to England (597)",
            "Rise of Islam (622+)",
            "Iconoclast Controversy (726-843)",
            "Coronation of Charlemagne (800)",
            "East-West Schism beginnings"
        ],
        "key_scriptures": [
            "Matthew 28:19-20",
            "Romans 13:1-7",
            "1 Peter 2:13-17",
            "Exodus 20:4-5",
            "Deuteronomy 4:15-18"
        ],
        "themes": [
            "Missionary expansion",
            "Papal authority development",
            "Christian kingship",
            "Monasticism and learning",
            "Iconoclasm debate"
        ]
    },
    5: {
        "name": "High Medieval Period",
        "start_year": 1000,
        "end_year": 1300,
        "description": "The age of Scholasticism, Crusades, and papal supremacy",
        "key_figures": [
            "Anselm of Canterbury",
            "Bernard of Clairvaux",
            "Peter Abelard",
            "Thomas Aquinas",
            "Bonaventure",
            "Francis of Assisi",
            "Dominic de Guzman",
            "Innocent III"
        ],
        "key_events": [
            "East-West Schism (1054)",
            "First Crusade (1095-1099)",
            "Fourth Lateran Council (1215)",
            "Fall of Constantinople to Fourth Crusade (1204)",
            "Inquisition established"
        ],
        "key_scriptures": [
            "Romans 1:20",
            "Hebrews 11:1",
            "Matthew 16:18-19",
            "John 20:23",
            "Luke 22:38"
        ],
        "themes": [
            "Faith and reason",
            "Scholastic theology",
            "Papal authority at its height",
            "Crusading movement",
            "Mendicant orders"
        ]
    },
    6: {
        "name": "Late Medieval and Pre-Reformation Period",
        "start_year": 1300,
        "end_year": 1517,
        "description": "The age of crisis, reform movements, and Renaissance humanism",
        "key_figures": [
            "Dante Alighieri",
            "John Wycliffe",
            "Jan Hus",
            "Catherine of Siena",
            "Thomas a Kempis",
            "Erasmus of Rotterdam",
            "Girolamo Savonarola"
        ],
        "key_events": [
            "Avignon Papacy (1309-1377)",
            "Western Schism (1378-1417)",
            "Council of Constance (1414-1418)",
            "Fall of Constantinople (1453)",
            "Spanish Inquisition (1478)"
        ],
        "key_scriptures": [
            "Romans 1:17",
            "Galatians 2:16",
            "2 Timothy 3:16-17",
            "James 2:24",
            "Matthew 23:1-12"
        ],
        "themes": [
            "Church corruption and reform",
            "Conciliarism",
            "Vernacular scripture",
            "Renaissance humanism",
            "Mysticism"
        ]
    },
    7: {
        "name": "Reformation Era",
        "start_year": 1517,
        "end_year": 1648,
        "description": "The age of Protestant reform and Catholic counter-reform",
        "key_figures": [
            "Martin Luther",
            "Huldrych Zwingli",
            "John Calvin",
            "Thomas Cranmer",
            "Ignatius of Loyola",
            "Teresa of Avila",
            "John Knox",
            "Menno Simons"
        ],
        "key_events": [
            "95 Theses (1517)",
            "Diet of Worms (1521)",
            "Augsburg Confession (1530)",
            "Council of Trent (1545-1563)",
            "Peace of Augsburg (1555)",
            "St. Bartholomew's Day Massacre (1572)",
            "Peace of Westphalia (1648)"
        ],
        "key_scriptures": [
            "Romans 1:17",
            "Romans 3:28",
            "Ephesians 2:8-9",
            "Galatians 5:1",
            "John 6:44"
        ],
        "themes": [
            "Justification by faith",
            "Sola Scriptura",
            "Priesthood of all believers",
            "Catholic reformation",
            "Religious wars"
        ]
    },
    8: {
        "name": "Post-Reformation Period",
        "start_year": 1648,
        "end_year": 1800,
        "description": "The age of confessionalism, Pietism, and Enlightenment challenges",
        "key_figures": [
            "Blaise Pascal",
            "John Bunyan",
            "Philipp Spener",
            "John Wesley",
            "Charles Wesley",
            "Jonathan Edwards",
            "George Whitefield",
            "John Newton"
        ],
        "key_events": [
            "English Civil War and Interregnum",
            "Glorious Revolution (1688)",
            "Great Awakening (1730s-1740s)",
            "American Revolution (1776)",
            "French Revolution (1789)"
        ],
        "key_scriptures": [
            "John 3:3",
            "Acts 2:38",
            "Romans 8:28",
            "2 Corinthians 5:17",
            "Galatians 2:20"
        ],
        "themes": [
            "Pietism and personal piety",
            "Revival movements",
            "Enlightenment rationalism",
            "Religious toleration",
            "Missions beginnings"
        ]
    },
    9: {
        "name": "Modern Era",
        "start_year": 1800,
        "end_year": 1950,
        "description": "The age of missions, liberalism, and fundamentalism",
        "key_figures": [
            "William Carey",
            "Charles Finney",
            "Friedrich Schleiermacher",
            "Charles Spurgeon",
            "D.L. Moody",
            "Karl Barth",
            "Dietrich Bonhoeffer",
            "C.S. Lewis"
        ],
        "key_events": [
            "Second Great Awakening",
            "Edinburgh Missionary Conference (1910)",
            "Fundamentalist-Modernist Controversy",
            "World War I",
            "World War II and Holocaust",
            "World Council of Churches (1948)"
        ],
        "key_scriptures": [
            "Matthew 28:19-20",
            "John 14:6",
            "2 Timothy 3:16",
            "Romans 8:28",
            "Philippians 1:21"
        ],
        "themes": [
            "Global missions",
            "Liberal theology",
            "Fundamentalism",
            "Social Gospel",
            "Ecumenism"
        ]
    },
    10: {
        "name": "Contemporary Period",
        "start_year": 1950,
        "end_year": 2024,
        "description": "The age of globalization, secularization, and Pentecostal growth",
        "key_figures": [
            "Billy Graham",
            "Pope John XXIII",
            "Martin Luther King Jr.",
            "Mother Teresa",
            "Pope John Paul II",
            "Desmond Tutu",
            "Pope Francis",
            "Tim Keller"
        ],
        "key_events": [
            "Vatican II (1962-1965)",
            "Civil Rights Movement",
            "Charismatic Renewal",
            "Fall of Communism (1989-1991)",
            "Rise of Global South Christianity",
            "Digital Age and Online Church"
        ],
        "key_scriptures": [
            "Acts 2:17-18",
            "Galatians 3:28",
            "Matthew 25:35-40",
            "Micah 6:8",
            "John 17:21"
        ],
        "themes": [
            "Pentecostal/Charismatic growth",
            "Secularization in the West",
            "Global South Christianity",
            "Social justice",
            "Interfaith dialogue"
        ]
    }
}


# ============================================================================
# API CLIENTS
# ============================================================================

class PerplexityClient:
    """Client for Perplexity AI research."""

    def __init__(self):
        self.api_key = PERPLEXITY_API_KEY
        self.base_url = PERPLEXITY_BASE_URL
        self.model = PERPLEXITY_MODEL

    def research(self, query: str, system_prompt: str = None) -> Dict[str, Any]:
        """Make a research query."""
        default_system = """You are a scholarly historian specializing in church history
        and religious studies. Provide comprehensive, academically rigorous research with
        citations where possible. Include multiple perspectives: Orthodox, Catholic,
        Protestant, Jewish, and academic/secular views."""

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        else:
            messages.append({"role": "system", "content": default_system})
        messages.append({"role": "user", "content": query})

        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": self.model,
                "messages": messages
            },
            timeout=120
        )
        response.raise_for_status()
        return response.json()


class SemanticScholarClient:
    """Client for Semantic Scholar academic papers."""

    def __init__(self):
        self.api_key = SEMANTIC_SCHOLAR_API_KEY
        self.base_url = SEMANTIC_SCHOLAR_BASE_URL

    def search(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search for academic papers."""
        headers = {}
        if self.api_key:
            headers["x-api-key"] = self.api_key

        response = requests.get(
            f"{self.base_url}/paper/search",
            headers=headers,
            params={
                "query": query,
                "limit": limit,
                "fields": "title,authors,year,abstract,citationCount,url"
            },
            timeout=30
        )
        response.raise_for_status()
        time.sleep(1)  # Rate limit
        return response.json()


class SefariaClient:
    """Client for Sefaria Jewish texts."""

    def __init__(self):
        self.base_url = SEFARIA_BASE_URL

    def get_text(self, ref: str) -> Dict[str, Any]:
        """Get a text by reference."""
        response = requests.get(
            f"{self.base_url}/texts/{ref}",
            timeout=30
        )
        response.raise_for_status()
        return response.json()

    def search(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search Sefaria texts."""
        response = requests.get(
            f"{self.base_url}/search-wrapper",
            params={"q": query, "size": limit},
            timeout=30
        )
        response.raise_for_status()
        return response.json()


class BibleClient:
    """Client for API.Bible."""

    def __init__(self):
        self.api_key = API_BIBLE_KEY
        self.base_url = API_BIBLE_URL
        self.bible_id = "de4e12af7f28f599-02"  # KJV

    def get_passage(self, passage: str) -> Dict[str, Any]:
        """Get a Bible passage."""
        # Convert reference to API format
        passage_id = passage.replace(" ", ".").replace(":", ".")

        response = requests.get(
            f"{self.base_url}/bibles/{self.bible_id}/passages/{passage_id}",
            headers={"api-key": self.api_key},
            params={"content-type": "text"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()


# ============================================================================
# CONTENT GENERATOR
# ============================================================================

class EraContentGenerator:
    """Generate comprehensive content for historical eras."""

    def __init__(self):
        self.perplexity = PerplexityClient()
        self.scholar = SemanticScholarClient()
        self.sefaria = SefariaClient()
        self.bible = BibleClient()

        self.output_dir = Path(__file__).parent.parent.parent / "content" / "eras"
        self.data_dir = Path(__file__).parent.parent.parent / "data"

        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def generate_era(self, era_num: int) -> Dict[str, Any]:
        """Generate complete content for an era."""
        if era_num not in ERAS:
            raise ValueError(f"Era {era_num} not found. Valid: 2-10")

        era = ERAS[era_num]
        print(f"\n{'='*70}")
        print(f"GENERATING ERA {era_num}: {era['name']}")
        print(f"({era['start_year']} - {era['end_year']} AD)")
        print(f"{'='*70}\n")

        # Collect all content
        content = {
            "era_number": era_num,
            "name": era["name"],
            "start_year": era["start_year"],
            "end_year": era["end_year"],
            "description": era["description"],
            "generated_at": datetime.now().isoformat(),
            "sections": {}
        }

        # 1. Research the era overview
        print("1. Researching era overview...")
        try:
            overview = self._research_era_overview(era)
            content["sections"]["overview"] = overview
            print(f"   Got {len(overview)} characters")
        except Exception as e:
            print(f"   Error: {e}")
            content["sections"]["overview"] = f"Error: {e}"

        time.sleep(2)  # Rate limiting

        # 2. Research key events
        print("2. Researching key events...")
        events = []
        for event in era["key_events"]:
            print(f"   - {event}")
            try:
                event_data = self._research_event(event, era)
                events.append(event_data)
            except Exception as e:
                print(f"     Error: {e}")
                events.append({"name": event, "error": str(e)})
            time.sleep(2)
        content["sections"]["events"] = events

        # 3. Research key figures
        print("3. Researching key figures...")
        figures = []
        for figure in era["key_figures"][:5]:  # Limit to 5 for now
            print(f"   - {figure}")
            try:
                figure_data = self._research_figure(figure, era)
                figures.append(figure_data)
            except Exception as e:
                print(f"     Error: {e}")
                figures.append({"name": figure, "error": str(e)})
            time.sleep(2)
        content["sections"]["figures"] = figures

        # 4. Research scripture usage
        print("4. Researching scripture usage...")
        scripture_usage = []
        for passage in era["key_scriptures"][:3]:  # Limit to 3
            print(f"   - {passage}")
            try:
                usage_data = self._research_scripture_usage(passage, era)
                scripture_usage.append(usage_data)
            except Exception as e:
                print(f"     Error: {e}")
                scripture_usage.append({"passage": passage, "error": str(e)})
            time.sleep(2)
        content["sections"]["scripture_usage"] = scripture_usage

        # 5. Get academic sources
        print("5. Finding academic sources...")
        try:
            sources = self._get_academic_sources(era)
            content["sections"]["academic_sources"] = sources
            print(f"   Found {len(sources)} sources")
        except Exception as e:
            print(f"   Error: {e}")
            content["sections"]["academic_sources"] = []

        # 6. Research themes
        print("6. Researching themes...")
        themes = []
        for theme in era["themes"][:3]:  # Limit to 3
            print(f"   - {theme}")
            try:
                theme_data = self._research_theme(theme, era)
                themes.append(theme_data)
            except Exception as e:
                print(f"     Error: {e}")
                themes.append({"theme": theme, "error": str(e)})
            time.sleep(2)
        content["sections"]["themes"] = themes

        # 7. Multi-perspective analysis
        print("7. Getting multi-perspective analysis...")
        try:
            perspectives = self._get_perspectives(era)
            content["sections"]["perspectives"] = perspectives
            print("   Done")
        except Exception as e:
            print(f"   Error: {e}")
            content["sections"]["perspectives"] = {"error": str(e)}

        # Save content
        self._save_content(era_num, era, content)

        return content

    def _research_era_overview(self, era: Dict) -> str:
        """Research era overview using Perplexity."""
        query = f"""Provide a comprehensive scholarly overview of the {era['name']}
        ({era['start_year']} - {era['end_year']} AD).

        Cover:
        1. Historical and political context
        2. Major religious developments
        3. Key theological debates
        4. Relationship between church and state
        5. Impact on subsequent history

        Include specific dates, names, and events. Cite primary sources where possible."""

        response = self.perplexity.research(query)
        return response["choices"][0]["message"]["content"]

    def _research_event(self, event: str, era: Dict) -> Dict[str, Any]:
        """Research a specific event."""
        query = f"""Provide detailed scholarly analysis of {event} during the {era['name']}.

        Cover:
        1. Background and causes
        2. Key participants
        3. What happened
        4. Outcomes and decisions
        5. Biblical/theological basis
        6. Impact on Christianity

        Be specific with dates, names, and primary sources."""

        response = self.perplexity.research(query)
        return {
            "name": event,
            "content": response["choices"][0]["message"]["content"],
            "citations": response.get("citations", [])
        }

    def _research_figure(self, figure: str, era: Dict) -> Dict[str, Any]:
        """Research a key figure."""
        query = f"""Provide comprehensive scholarly biography of {figure}
        ({era['name']}, {era['start_year']}-{era['end_year']} AD).

        Cover:
        1. Life and times
        2. Major works and contributions
        3. Theological positions
        4. Scripture interpretation approach
        5. Political views
        6. Legacy and influence

        Include specific quotes and primary source references."""

        response = self.perplexity.research(query)
        return {
            "name": figure,
            "content": response["choices"][0]["message"]["content"],
            "citations": response.get("citations", [])
        }

    def _research_scripture_usage(self, passage: str, era: Dict) -> Dict[str, Any]:
        """Research how a scripture was used in the era."""
        query = f"""Analyze how {passage} was interpreted and used during the {era['name']}
        ({era['start_year']}-{era['end_year']} AD).

        Cover:
        1. The passage's context
        2. Major interpreters of this passage in the era
        3. How it was understood
        4. Political/social applications
        5. Theological implications
        6. Compare with modern interpretation

        Include specific quotes from interpreters of this era."""

        response = self.perplexity.research(query)

        # Try to get the actual Bible text
        bible_text = None
        try:
            bible_response = self.bible.get_passage(passage)
            bible_text = bible_response.get("data", {}).get("content", None)
        except:
            pass

        return {
            "passage": passage,
            "text": bible_text,
            "analysis": response["choices"][0]["message"]["content"],
            "citations": response.get("citations", [])
        }

    def _get_academic_sources(self, era: Dict) -> List[Dict[str, Any]]:
        """Get academic sources from Semantic Scholar."""
        query = f"{era['name']} Christianity church history"

        try:
            results = self.scholar.search(query, limit=10)
            papers = results.get("data", [])

            return [{
                "title": p.get("title", ""),
                "authors": [a.get("name", "") for a in p.get("authors", [])],
                "year": p.get("year"),
                "abstract": p.get("abstract", "")[:500] if p.get("abstract") else None,
                "citations": p.get("citationCount", 0),
                "url": p.get("url", "")
            } for p in papers]
        except Exception as e:
            print(f"   Semantic Scholar error: {e}")
            return []

    def _research_theme(self, theme: str, era: Dict) -> Dict[str, Any]:
        """Research a major theme of the era."""
        query = f"""Analyze the theme of "{theme}" during the {era['name']}
        ({era['start_year']}-{era['end_year']} AD).

        Cover:
        1. How this theme manifested in the era
        2. Key proponents and opponents
        3. Biblical/theological foundations
        4. Political implications
        5. Legacy and modern relevance

        Include specific examples and primary sources."""

        response = self.perplexity.research(query)
        return {
            "theme": theme,
            "content": response["choices"][0]["message"]["content"],
            "citations": response.get("citations", [])
        }

    def _get_perspectives(self, era: Dict) -> Dict[str, str]:
        """Get multi-perspective analysis of the era."""
        perspectives = {}

        traditions = ["Orthodox Christian", "Catholic", "Protestant", "Jewish", "Academic/Secular"]

        for tradition in traditions:
            query = f"""From a {tradition} perspective, what is the significance of
            the {era['name']} ({era['start_year']}-{era['end_year']} AD)?

            Cover:
            1. How this tradition views this period
            2. Key figures and events from this perspective
            3. Theological assessments
            4. Areas of agreement/disagreement with other traditions

            Be specific and scholarly."""

            try:
                response = self.perplexity.research(query)
                perspectives[tradition] = response["choices"][0]["message"]["content"]
            except Exception as e:
                perspectives[tradition] = f"Error: {e}"
            time.sleep(2)

        return perspectives

    def _save_content(self, era_num: int, era: Dict, content: Dict):
        """Save content as markdown and JSON."""
        # Format era number for filename
        era_str = f"{era_num:02d}"
        start = era["start_year"]
        end = era["end_year"]
        name_slug = era["name"].lower().replace(" ", "_").replace("/", "_")

        # Save JSON
        json_path = self.data_dir / f"era_{era_str}_{name_slug}.json"
        with open(json_path, "w") as f:
            json.dump(content, f, indent=2, default=str)
        print(f"\nSaved JSON: {json_path}")

        # Generate markdown
        md_content = self._generate_markdown(era_num, era, content)

        md_path = self.output_dir / f"{era_str}_{name_slug}_{start}_{end}ad.md"
        with open(md_path, "w") as f:
            f.write(md_content)
        print(f"Saved markdown: {md_path}")

    def _generate_markdown(self, era_num: int, era: Dict, content: Dict) -> str:
        """Generate markdown document from content."""
        sections = content.get("sections", {})

        md = f"""# Era {era_num}: {era['name']}
## {era['start_year']} - {era['end_year']} AD

*{era['description']}*

Generated: {content.get('generated_at', 'Unknown')}

---

## Overview

{sections.get('overview', 'No overview available.')}

---

## Key Events

"""

        for event in sections.get("events", []):
            md += f"### {event.get('name', 'Unknown Event')}\n\n"
            if "error" in event:
                md += f"*Error: {event['error']}*\n\n"
            else:
                md += f"{event.get('content', 'No content.')}\n\n"

        md += """---

## Key Figures

"""

        for figure in sections.get("figures", []):
            md += f"### {figure.get('name', 'Unknown Figure')}\n\n"
            if "error" in figure:
                md += f"*Error: {figure['error']}*\n\n"
            else:
                md += f"{figure.get('content', 'No content.')}\n\n"

        md += """---

## Scripture Usage

"""

        for usage in sections.get("scripture_usage", []):
            md += f"### {usage.get('passage', 'Unknown')}\n\n"
            if usage.get("text"):
                md += f"> {usage['text']}\n\n"
            if "error" in usage:
                md += f"*Error: {usage['error']}*\n\n"
            else:
                md += f"{usage.get('analysis', 'No analysis.')}\n\n"

        md += """---

## Major Themes

"""

        for theme in sections.get("themes", []):
            md += f"### {theme.get('theme', 'Unknown Theme')}\n\n"
            if "error" in theme:
                md += f"*Error: {theme['error']}*\n\n"
            else:
                md += f"{theme.get('content', 'No content.')}\n\n"

        md += """---

## Multi-Perspective Analysis

"""

        perspectives = sections.get("perspectives", {})
        for tradition, analysis in perspectives.items():
            md += f"### {tradition} Perspective\n\n"
            md += f"{analysis}\n\n"

        md += """---

## Academic Sources

"""

        for source in sections.get("academic_sources", []):
            authors = ", ".join(source.get("authors", [])[:3])
            md += f"- **{source.get('title', 'Unknown')}** ({source.get('year', 'n.d.')})\n"
            md += f"  - Authors: {authors}\n"
            md += f"  - Citations: {source.get('citations', 0)}\n"
            if source.get("abstract"):
                md += f"  - Abstract: {source['abstract'][:200]}...\n"
            md += "\n"

        md += """---

*This content was generated using AI-powered research and should be verified against primary sources.*
"""

        return md


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main function to generate era content."""
    generator = EraContentGenerator()

    # Check if specific era requested
    if len(sys.argv) > 1:
        try:
            era_num = int(sys.argv[1])
            if era_num < 2 or era_num > 10:
                print("Error: Era number must be between 2 and 10")
                print("(Era 1 is already generated)")
                sys.exit(1)
            generator.generate_era(era_num)
        except ValueError:
            print(f"Error: Invalid era number: {sys.argv[1]}")
            sys.exit(1)
    else:
        # Generate all eras 2-10
        print("="*70)
        print("GENERATING ALL ERAS (2-10)")
        print("="*70)

        for era_num in range(2, 11):
            try:
                generator.generate_era(era_num)
                print(f"\n{'='*70}")
                print(f"COMPLETED ERA {era_num}")
                print(f"{'='*70}\n")

                # Pause between eras to avoid rate limits
                if era_num < 10:
                    print("Waiting 10 seconds before next era...")
                    time.sleep(10)

            except Exception as e:
                print(f"\nERROR generating era {era_num}: {e}")
                continue

        print("\n" + "="*70)
        print("ALL ERAS COMPLETE!")
        print("="*70)


if __name__ == "__main__":
    main()
