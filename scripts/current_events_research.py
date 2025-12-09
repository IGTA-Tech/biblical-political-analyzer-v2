"""
Current Events Research Module for Biblical Political Analyzer V2.

This module provides real-time current events research using Perplexity AI,
with intelligent caching via Supabase to avoid rate limits and repeated queries.

Features:
- Extract biblical themes from text using keyword matching
- Research current events related to identified themes
- Cache results in Supabase for 24 hours
- Multi-perspective analysis (religious, political, historical)
- Source citations for all news content

Usage:
    from current_events_research import CurrentEventsResearcher

    researcher = CurrentEventsResearcher()

    # Analyze a political statement
    result = researcher.analyze_statement(
        "The government is targeting religious minorities"
    )

    # Get current events for a specific theme
    events = researcher.get_current_events_for_theme("religiousPersecution")
"""

import os
import sys
import time
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, asdict

import requests
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT_DIR, '.env'))

# ===============================================================================
# BIBLICAL THEMES (Python version of biblicalThemes.js)
# ===============================================================================

BIBLICAL_THEMES = {
    "exile": {
        "name": "Exile & Diaspora",
        "description": "Forced removal from homeland, displacement, refugee situations",
        "keywords": [
            "exile", "diaspora", "displacement", "refugee", "deportation", "forced migration",
            "expelled", "banished", "scattered", "captivity", "captive", "homeless",
            "migration crisis", "internally displaced", "asylum", "ethnic cleansing"
        ],
        "biblicalExamples": [
            "Babylonian Exile (586 BCE)",
            "Assyrian deportations (722 BCE)",
            "Egyptian sojourn",
            "Post-70 CE Jewish diaspora"
        ],
        "severity": "high"
    },
    "empireCollapse": {
        "name": "Empire Collapse",
        "description": "Fall of empires, dissolution of major powers, regime change",
        "keywords": [
            "empire fall", "collapse", "downfall", "regime change", "revolution",
            "coup", "overthrow", "dissolution", "independence", "secession",
            "civil war", "uprising", "rebellion", "transition of power"
        ],
        "biblicalExamples": [
            "Babylonian conquest of Judah",
            "Persian conquest of Babylon",
            "Greek conquest of Persia",
            "Roman destruction of Jerusalem"
        ],
        "severity": "high"
    },
    "empireRise": {
        "name": "Empire Rise",
        "description": "Rise of new powers, expansion of empires, consolidation of power",
        "keywords": [
            "rise", "expansion", "conquest", "annexation", "imperialism",
            "superpower", "hegemony", "dominance", "empire building",
            "territorial expansion", "military buildup"
        ],
        "biblicalExamples": [
            "Assyrian Empire expansion",
            "Babylonian rise under Nebuchadnezzar",
            "Roman Empire expansion",
            "Macedonian empire under Alexander"
        ],
        "severity": "medium"
    },
    "religiousPersecution": {
        "name": "Religious Persecution",
        "description": "Persecution based on faith, religious freedom violations",
        "keywords": [
            "persecution", "martyrdom", "religious freedom", "faith-based violence",
            "genocide", "pogrom", "inquisition", "blasphemy laws", "apostasy",
            "religious minorities", "sectarian violence", "forced conversion",
            "church persecution", "mosque destruction", "temple desecration"
        ],
        "biblicalExamples": [
            "Maccabean persecution under Antiochus IV",
            "Roman persecution of Christians",
            "Babylonian idol worship coercion",
            "Egyptian oppression of Hebrews"
        ],
        "severity": "high"
    },
    "socialOppression": {
        "name": "Social Oppression",
        "description": "Slavery, forced labor, systemic injustice, human rights violations",
        "keywords": [
            "slavery", "forced labor", "human trafficking", "oppression",
            "exploitation", "indentured servitude", "child labor", "bonded labor",
            "systemic injustice", "human rights", "labor abuse", "sweatshops"
        ],
        "biblicalExamples": [
            "Hebrew slavery in Egypt",
            "Babylonian forced labor",
            "Roman slavery system",
            "Prophetic denouncement of oppression"
        ],
        "severity": "high"
    },
    "economicInjustice": {
        "name": "Economic Injustice",
        "description": "Wealth inequality, poverty, exploitation of poor",
        "keywords": [
            "inequality", "poverty", "wealth gap", "exploitation", "debt crisis",
            "foreclosure", "usury", "wage theft", "economic justice",
            "income inequality", "wealth distribution", "land grabbing",
            "monopoly", "corruption", "bribery", "exploitation of poor"
        ],
        "biblicalExamples": [
            "Prophetic calls for justice (Amos, Micah)",
            "Jubilee year concept",
            "Nehemiah's reforms against usury",
            "Jesus and money changers"
        ],
        "severity": "medium"
    },
    "socialJustice": {
        "name": "Social Justice Movements",
        "description": "Movements for equality, civil rights, reform",
        "keywords": [
            "civil rights", "equality", "justice movement", "reform",
            "protest", "demonstration", "activism", "advocacy",
            "women's rights", "minority rights", "labor rights",
            "abolition", "emancipation", "suffrage"
        ],
        "biblicalExamples": [
            "Prophets calling for justice",
            "Jesus challenging religious hierarchy",
            "Early church community of goods",
            "Liberation themes in Exodus"
        ],
        "severity": "medium"
    },
    "famine": {
        "name": "Famine & Food Crisis",
        "description": "Severe food shortages, agricultural collapse, starvation",
        "keywords": [
            "famine", "hunger", "starvation", "food crisis", "drought",
            "crop failure", "food shortage", "malnutrition", "food insecurity",
            "agricultural crisis", "food scarcity"
        ],
        "biblicalExamples": [
            "Joseph and seven-year famine in Egypt",
            "Famine in time of Elijah",
            "Siege famines in Jerusalem",
            "Prophetic warnings of famine"
        ],
        "severity": "high"
    },
    "plague": {
        "name": "Plague & Pandemic",
        "description": "Disease outbreaks, epidemics, public health crises",
        "keywords": [
            "plague", "pandemic", "epidemic", "disease outbreak", "virus",
            "contagion", "health crisis", "pestilence", "infection",
            "public health emergency", "quarantine", "vaccination",
            "COVID", "coronavirus", "influenza", "cholera", "smallpox"
        ],
        "biblicalExamples": [
            "Egyptian plagues",
            "Plague in David's census",
            "Pestilence as judgment",
            "Healing narratives"
        ],
        "severity": "high"
    },
    "naturalDisaster": {
        "name": "Natural Disasters",
        "description": "Earthquakes, floods, storms, environmental catastrophes",
        "keywords": [
            "earthquake", "flood", "tsunami", "hurricane", "tornado",
            "storm", "wildfire", "volcanic eruption", "landslide",
            "natural disaster", "environmental catastrophe", "climate disaster"
        ],
        "biblicalExamples": [
            "Noah's flood",
            "Sodom and Gomorrah destruction",
            "Earthquake at Jesus' crucifixion",
            "Storms at sea"
        ],
        "severity": "high"
    },
    "war": {
        "name": "War & Armed Conflict",
        "description": "Wars, battles, military conflicts, invasions",
        "keywords": [
            "war", "conflict", "battle", "invasion", "military action",
            "armed conflict", "warfare", "siege", "combat", "attack",
            "military intervention", "occupation", "bombardment", "air strike"
        ],
        "biblicalExamples": [
            "Conquest of Canaan",
            "Babylonian siege of Jerusalem",
            "Maccabean revolt",
            "Roman wars"
        ],
        "severity": "high"
    },
    "peace": {
        "name": "Peace & Reconciliation",
        "description": "Peace treaties, conflict resolution, reconciliation",
        "keywords": [
            "peace treaty", "ceasefire", "armistice", "reconciliation",
            "peace accord", "peace talks", "negotiation", "mediation",
            "conflict resolution", "peace process", "peace agreement"
        ],
        "biblicalExamples": [
            "Abraham and Lot's separation",
            "Jacob and Esau reconciliation",
            "Prophetic visions of peace",
            "Prince of Peace prophecies"
        ],
        "severity": "low"
    },
    "prophecyFulfillment": {
        "name": "Prophetic Warning & Fulfillment",
        "description": "Warnings being vindicated, predictions coming true",
        "keywords": [
            "warning", "prediction", "forecast", "prophecy", "foretold",
            "predicted", "warning signs", "vindicated", "came to pass",
            "fulfillment", "realization", "validation"
        ],
        "biblicalExamples": [
            "Jeremiah's warnings about Babylon",
            "Isaiah's prophecies",
            "Daniel's visions",
            "Jesus' predictions about temple"
        ],
        "severity": "medium"
    },
    "templeDestruction": {
        "name": "Temple/Holy Site Destruction",
        "description": "Destruction of religious sites, cultural heritage destruction",
        "keywords": [
            "temple destruction", "church destruction", "mosque destruction",
            "holy site", "cultural heritage", "religious site", "shrine",
            "iconoclasm", "desecration", "vandalism of religious sites",
            "cultural destruction", "heritage site"
        ],
        "biblicalExamples": [
            "Solomon's Temple destruction (586 BCE)",
            "Second Temple destruction (70 CE)",
            "Altars destroyed by reformers",
            "Idol temple destructions"
        ],
        "severity": "medium"
    },
    "restoration": {
        "name": "Restoration & Rebuilding",
        "description": "Rebuilding after destruction, restoration of nations",
        "keywords": [
            "restoration", "rebuilding", "reconstruction", "revival",
            "renewal", "return", "repatriation", "independence",
            "nation building", "recovery", "reconstruction"
        ],
        "biblicalExamples": [
            "Return from Babylonian exile",
            "Rebuilding of temple (Ezra-Nehemiah)",
            "Restoration prophecies",
            "Promise of renewal"
        ],
        "severity": "low"
    },
    "spiritualAwakening": {
        "name": "Spiritual Awakening & Revival",
        "description": "Religious revivals, spiritual movements, conversions",
        "keywords": [
            "revival", "awakening", "religious movement", "conversion",
            "spiritual renewal", "reformation", "evangelism", "missionary",
            "church growth", "religious renaissance", "great awakening"
        ],
        "biblicalExamples": [
            "Josiah's reforms",
            "Nehemiah's covenant renewal",
            "Pentecost",
            "Early church growth"
        ],
        "severity": "low"
    },
    "leadershipTransition": {
        "name": "Leadership Transition",
        "description": "Changes in leadership, succession, political transitions",
        "keywords": [
            "leadership change", "succession", "transition", "new leader",
            "election", "inauguration", "coronation", "abdication",
            "regime change", "power transfer", "new government"
        ],
        "biblicalExamples": [
            "Saul to David",
            "David to Solomon",
            "Kings of Israel/Judah",
            "Roman emperors"
        ],
        "severity": "low"
    },
    "corruption": {
        "name": "Corruption & Moral Decay",
        "description": "Political corruption, moral decline, societal decay",
        "keywords": [
            "corruption", "scandal", "bribery", "embezzlement", "fraud",
            "moral decay", "decadence", "vice", "immorality",
            "abuse of power", "nepotism", "cronyism"
        ],
        "biblicalExamples": [
            "Judges period: 'everyone did what was right in their own eyes'",
            "Kings' apostasy and corruption",
            "Prophetic denouncements",
            "Jesus condemning Pharisees"
        ],
        "severity": "medium"
    },
    "covenant": {
        "name": "Covenant & Treaty Making",
        "description": "International agreements, treaties, covenants",
        "keywords": [
            "treaty", "agreement", "covenant", "pact", "accord",
            "alliance", "international agreement", "compact", "charter",
            "convention", "protocol", "memorandum", "United Nations"
        ],
        "biblicalExamples": [
            "Abrahamic covenant",
            "Mosaic covenant",
            "Davidic covenant",
            "New covenant"
        ],
        "severity": "low"
    },
    "environmental": {
        "name": "Environmental Crisis",
        "description": "Climate change, environmental destruction, ecological disaster",
        "keywords": [
            "climate change", "global warming", "environmental crisis",
            "deforestation", "pollution", "extinction", "biodiversity loss",
            "ecological disaster", "environmental destruction",
            "sea level rise", "greenhouse gases", "carbon emissions"
        ],
        "biblicalExamples": [
            "Creation care mandate",
            "Sabbath year for land",
            "Prophetic imagery of land mourning",
            "Noah's flood (climate catastrophe)"
        ],
        "severity": "high"
    }
}


# ===============================================================================
# DATA CLASSES
# ===============================================================================

@dataclass
class ThemeMatch:
    """Represents a matched biblical theme in text."""
    theme_id: str
    theme_name: str
    matched_keywords: List[str]
    confidence: float  # 0.0 to 1.0
    severity: str


@dataclass
class CurrentEventsResult:
    """Container for current events research results."""
    theme: ThemeMatch
    news_summary: str
    sources: List[str]
    biblical_parallels: List[str]
    researched_at: str
    cached: bool


@dataclass
class AnalysisResult:
    """Complete analysis result with themes and current events."""
    original_text: str
    identified_themes: List[ThemeMatch]
    current_events: List[CurrentEventsResult]
    historical_context: str
    analyzed_at: str


# ===============================================================================
# THEME EXTRACTOR
# ===============================================================================

class ThemeExtractor:
    """Extract biblical themes from text using keyword matching."""

    def __init__(self, themes: Dict[str, Any] = None):
        self.themes = themes or BIBLICAL_THEMES

    def extract_themes(self, text: str, min_confidence: float = 0.3) -> List[ThemeMatch]:
        """
        Extract biblical themes from text.

        Args:
            text: Text to analyze
            min_confidence: Minimum confidence threshold (0.0 to 1.0)

        Returns:
            List of matched themes sorted by confidence
        """
        text_lower = text.lower()
        matches = []

        for theme_id, theme_data in self.themes.items():
            matched_keywords = []

            for keyword in theme_data["keywords"]:
                if keyword.lower() in text_lower:
                    matched_keywords.append(keyword)

            if matched_keywords:
                # Calculate confidence based on keyword matches
                confidence = min(len(matched_keywords) / 3.0, 1.0)

                # Boost confidence for high-severity themes
                if theme_data["severity"] == "high":
                    confidence = min(confidence * 1.2, 1.0)

                if confidence >= min_confidence:
                    matches.append(ThemeMatch(
                        theme_id=theme_id,
                        theme_name=theme_data["name"],
                        matched_keywords=matched_keywords,
                        confidence=confidence,
                        severity=theme_data["severity"]
                    ))

        # Sort by confidence (highest first)
        matches.sort(key=lambda x: x.confidence, reverse=True)
        return matches

    def get_theme_info(self, theme_id: str) -> Optional[Dict[str, Any]]:
        """Get full information about a theme."""
        return self.themes.get(theme_id)

    def get_all_theme_ids(self) -> List[str]:
        """Get list of all theme IDs."""
        return list(self.themes.keys())


# ===============================================================================
# SUPABASE CACHE
# ===============================================================================

class NewsCache:
    """Cache for current events results using Supabase."""

    def __init__(self):
        self.url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.cache_hours = 24  # Cache duration

    def _get_headers(self) -> Dict[str, str]:
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def _generate_cache_key(self, theme_id: str) -> str:
        """Generate a unique cache key for a theme."""
        today = datetime.now().strftime("%Y-%m-%d")
        return hashlib.md5(f"{theme_id}:{today}".encode()).hexdigest()

    def get_cached(self, theme_id: str) -> Optional[Dict[str, Any]]:
        """Get cached result for a theme if not expired."""
        try:
            cache_key = self._generate_cache_key(theme_id)

            response = requests.get(
                f"{self.url}/rest/v1/news_cache",
                headers=self._get_headers(),
                params={
                    "select": "*",
                    "cache_key": f"eq.{cache_key}"
                }
            )

            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    cached = data[0]
                    # Check if still valid
                    cached_at = datetime.fromisoformat(cached["cached_at"].replace("Z", "+00:00"))
                    if datetime.now(cached_at.tzinfo) - cached_at < timedelta(hours=self.cache_hours):
                        return cached

            return None
        except Exception as e:
            print(f"Cache read error: {e}")
            return None

    def set_cached(self, theme_id: str, result: Dict[str, Any]) -> bool:
        """Cache a result for a theme."""
        try:
            cache_key = self._generate_cache_key(theme_id)

            # Upsert the cache entry
            data = {
                "cache_key": cache_key,
                "theme_id": theme_id,
                "result": json.dumps(result),
                "cached_at": datetime.utcnow().isoformat() + "Z"
            }

            # Try to delete existing first
            requests.delete(
                f"{self.url}/rest/v1/news_cache",
                headers=self._get_headers(),
                params={"cache_key": f"eq.{cache_key}"}
            )

            # Insert new
            response = requests.post(
                f"{self.url}/rest/v1/news_cache",
                headers=self._get_headers(),
                json=data
            )

            return response.status_code in [200, 201]
        except Exception as e:
            print(f"Cache write error: {e}")
            return False


# ===============================================================================
# CURRENT EVENTS RESEARCHER
# ===============================================================================

class CurrentEventsResearcher:
    """
    Research current events using Perplexity AI with smart caching.

    This class provides the main interface for current events research,
    combining theme extraction, Perplexity AI queries, and Supabase caching.
    """

    def __init__(self):
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY is required")

        self.base_url = "https://api.perplexity.ai"
        self.model = "sonar"
        self.theme_extractor = ThemeExtractor()
        self.cache = NewsCache()

        # Rate limiting
        self.requests_per_minute = 20
        self.last_request_time = 0

    def _wait_for_rate_limit(self):
        """Wait if needed to respect rate limits."""
        min_interval = 60.0 / self.requests_per_minute
        elapsed = time.time() - self.last_request_time
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
        self.last_request_time = time.time()

    def _query_perplexity(self, query: str, system_prompt: str = None) -> Dict[str, Any]:
        """Make a query to Perplexity API."""
        self._wait_for_rate_limit()

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
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

    def get_current_events_for_theme(
        self,
        theme_id: str,
        use_cache: bool = True
    ) -> CurrentEventsResult:
        """
        Get current events related to a biblical theme.

        Args:
            theme_id: The theme ID (e.g., "religiousPersecution")
            use_cache: Whether to use cached results

        Returns:
            CurrentEventsResult with news and analysis
        """
        theme_info = self.theme_extractor.get_theme_info(theme_id)
        if not theme_info:
            raise ValueError(f"Unknown theme: {theme_id}")

        # Check cache first
        if use_cache:
            cached = self.cache.get_cached(theme_id)
            if cached:
                result_data = json.loads(cached["result"])
                return CurrentEventsResult(
                    theme=ThemeMatch(
                        theme_id=theme_id,
                        theme_name=theme_info["name"],
                        matched_keywords=[],
                        confidence=1.0,
                        severity=theme_info["severity"]
                    ),
                    news_summary=result_data["news_summary"],
                    sources=result_data["sources"],
                    biblical_parallels=result_data["biblical_parallels"],
                    researched_at=cached["cached_at"],
                    cached=True
                )

        # Query Perplexity for current events
        system_prompt = """You are a research analyst specializing in identifying
        connections between current events and biblical/historical themes. Provide
        factual, sourced information about recent news events. Always cite your sources."""

        keywords_str = ", ".join(theme_info["keywords"][:10])
        biblical_examples = "\n".join(f"- {ex}" for ex in theme_info["biblicalExamples"])

        query = f"""Find the most significant current news stories (from the last 30 days)
        related to the theme of "{theme_info['name']}".

        Theme description: {theme_info['description']}
        Related keywords: {keywords_str}

        Biblical parallels for context:
        {biblical_examples}

        Please provide:
        1. A summary of 3-5 major current news stories related to this theme
        2. For each story, explain how it connects to the biblical theme
        3. Include specific dates, locations, and key figures
        4. Cite your news sources (publication name and date)

        Format your response as:

        ## Current Events Summary
        [2-3 paragraph overview]

        ## Key Stories
        1. [Story headline]
           - Details: [What happened]
           - Connection: [How it relates to biblical theme]
           - Source: [Publication, Date]

        ## Biblical Parallels
        - [Modern event] parallels [Biblical event] because...

        ## Sources
        - [List of all sources cited]
        """

        response = self._query_perplexity(query, system_prompt)
        content = response["choices"][0]["message"]["content"]
        citations = response.get("citations", [])

        # Parse the response
        news_summary = content
        sources = citations if citations else self._extract_sources(content)
        biblical_parallels = theme_info["biblicalExamples"]

        # Cache the result
        result_data = {
            "news_summary": news_summary,
            "sources": sources,
            "biblical_parallels": biblical_parallels
        }

        if use_cache:
            self.cache.set_cached(theme_id, result_data)

        return CurrentEventsResult(
            theme=ThemeMatch(
                theme_id=theme_id,
                theme_name=theme_info["name"],
                matched_keywords=[],
                confidence=1.0,
                severity=theme_info["severity"]
            ),
            news_summary=news_summary,
            sources=sources,
            biblical_parallels=biblical_parallels,
            researched_at=datetime.utcnow().isoformat() + "Z",
            cached=False
        )

    def _extract_sources(self, content: str) -> List[str]:
        """Extract source citations from response content."""
        sources = []
        lines = content.split("\n")
        in_sources_section = False

        for line in lines:
            if "## Sources" in line or "Sources:" in line:
                in_sources_section = True
                continue
            if in_sources_section and line.strip().startswith("-"):
                sources.append(line.strip()[2:].strip())
            elif in_sources_section and line.startswith("##"):
                break

        return sources

    def analyze_statement(
        self,
        statement: str,
        max_themes: int = 3,
        use_cache: bool = True
    ) -> AnalysisResult:
        """
        Analyze a political statement for biblical themes and current events.

        Args:
            statement: The political statement to analyze
            max_themes: Maximum number of themes to research
            use_cache: Whether to use cached results

        Returns:
            AnalysisResult with themes, current events, and historical context
        """
        # Extract themes from the statement
        themes = self.theme_extractor.extract_themes(statement)[:max_themes]

        if not themes:
            # If no themes found, try a broader search
            themes = [ThemeMatch(
                theme_id="general",
                theme_name="General Political Statement",
                matched_keywords=[],
                confidence=0.5,
                severity="low"
            )]

        # Get current events for each theme
        current_events = []
        for theme in themes:
            if theme.theme_id != "general":
                try:
                    events = self.get_current_events_for_theme(
                        theme.theme_id,
                        use_cache=use_cache
                    )
                    current_events.append(events)
                except Exception as e:
                    print(f"Error researching theme {theme.theme_id}: {e}")

        # Get historical context
        historical_context = self._get_historical_context(statement, themes)

        return AnalysisResult(
            original_text=statement,
            identified_themes=themes,
            current_events=current_events,
            historical_context=historical_context,
            analyzed_at=datetime.utcnow().isoformat() + "Z"
        )

    def _get_historical_context(
        self,
        statement: str,
        themes: List[ThemeMatch]
    ) -> str:
        """Get historical context for the statement."""
        if not themes:
            return ""

        theme_names = [t.theme_name for t in themes[:3]]
        themes_str = ", ".join(theme_names)

        system_prompt = """You are a biblical scholar providing historical context
        for modern political statements. Connect modern issues to biblical themes
        and historical precedents."""

        query = f"""Provide brief historical and biblical context for a statement
        related to these themes: {themes_str}

        The statement: "{statement[:500]}"

        In 2-3 paragraphs, explain:
        1. How these themes appear in biblical history
        2. Historical parallels from church history
        3. How this context informs understanding of the modern statement

        Keep it concise and scholarly."""

        try:
            response = self._query_perplexity(query, system_prompt)
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error getting historical context: {e}")
            return ""

    def get_trending_themes(self) -> List[Dict[str, Any]]:
        """
        Get currently trending biblical themes based on news.

        Returns:
            List of themes with relevance scores
        """
        system_prompt = """You are a news analyst identifying which biblical/religious
        themes are most relevant to current global events."""

        theme_list = "\n".join(
            f"- {tid}: {tinfo['name']} - {tinfo['description']}"
            for tid, tinfo in BIBLICAL_THEMES.items()
        )

        query = f"""Based on current global news from the past week, rank which of these
        biblical themes are most relevant today:

        {theme_list}

        Return the top 5 most relevant themes with:
        1. Theme name
        2. Why it's relevant now (specific news events)
        3. Relevance score (1-10)

        Format as a numbered list."""

        try:
            response = self._query_perplexity(query, system_prompt)
            content = response["choices"][0]["message"]["content"]

            # Return raw content - can be parsed further if needed
            return [{
                "analysis": content,
                "researched_at": datetime.utcnow().isoformat() + "Z"
            }]
        except Exception as e:
            print(f"Error getting trending themes: {e}")
            return []


# ===============================================================================
# CONVENIENCE FUNCTIONS
# ===============================================================================

def extract_themes(text: str) -> List[ThemeMatch]:
    """Extract biblical themes from text."""
    extractor = ThemeExtractor()
    return extractor.extract_themes(text)


def get_current_events(theme_id: str) -> CurrentEventsResult:
    """Get current events for a biblical theme."""
    researcher = CurrentEventsResearcher()
    return researcher.get_current_events_for_theme(theme_id)


def analyze_statement(statement: str) -> AnalysisResult:
    """Analyze a political statement for biblical themes and current events."""
    researcher = CurrentEventsResearcher()
    return researcher.analyze_statement(statement)


# ===============================================================================
# TEST FUNCTION
# ===============================================================================

def test():
    """Test the current events research system."""
    print("=" * 70)
    print("CURRENT EVENTS RESEARCH SYSTEM TEST")
    print("=" * 70)

    # Test 1: Theme extraction
    print("\n1. Testing Theme Extraction")
    print("-" * 50)

    test_statement = """The government is targeting religious minorities and
    forcing them to leave their homeland. This is a clear case of persecution
    and ethnic cleansing."""

    extractor = ThemeExtractor()
    themes = extractor.extract_themes(test_statement)

    print(f"Statement: {test_statement[:100]}...")
    print(f"\nIdentified {len(themes)} themes:")
    for theme in themes:
        print(f"  - {theme.theme_name} (confidence: {theme.confidence:.2f})")
        print(f"    Keywords: {', '.join(theme.matched_keywords)}")

    # Test 2: Current events research
    print("\n2. Testing Current Events Research")
    print("-" * 50)

    try:
        researcher = CurrentEventsResearcher()

        # Research a specific theme
        theme_to_research = "religiousPersecution"
        print(f"\nResearching current events for: {theme_to_research}")

        result = researcher.get_current_events_for_theme(theme_to_research)

        print(f"\nTheme: {result.theme.theme_name}")
        print(f"Cached: {result.cached}")
        print(f"Researched at: {result.researched_at}")
        print(f"\nNews Summary (first 500 chars):")
        print(result.news_summary[:500] + "...")

        if result.sources:
            print(f"\nSources ({len(result.sources)}):")
            for source in result.sources[:5]:
                print(f"  - {source}")

        print("\n[OK] Current events research successful")

    except Exception as e:
        print(f"[ERROR] {e}")

    # Test 3: Full statement analysis
    print("\n3. Testing Full Statement Analysis")
    print("-" * 50)

    try:
        analysis = researcher.analyze_statement(test_statement, max_themes=2)

        print(f"\nAnalyzed statement with {len(analysis.identified_themes)} themes")
        print(f"Found {len(analysis.current_events)} current event results")

        if analysis.historical_context:
            print(f"\nHistorical context (first 300 chars):")
            print(analysis.historical_context[:300] + "...")

        print("\n[OK] Full analysis successful")

    except Exception as e:
        print(f"[ERROR] {e}")

    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    test()
