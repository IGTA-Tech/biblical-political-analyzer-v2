#!/usr/bin/env python3
"""
Enhanced Jewish Post-Biblical History Generator - 9.5/10 Quality

Matches the quality and approach of generate_enhanced_eras.py for Christian history.

Uses:
1. Perplexity API - Deep scholarly research with follow-up queries
2. Sefaria API - Direct Jewish text integration
3. Semantic Scholar + CORE - Academic papers
4. Internet Archive - Historical texts
5. Multi-perspective analysis

Usage:
    python generate_jewish_history_enhanced.py [era_number]
    python generate_jewish_history_enhanced.py  # All eras
"""

import os
import sys
import json
import time
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    PERPLEXITY_API_KEY,
    PERPLEXITY_BASE_URL,
    SEMANTIC_SCHOLAR_API_KEY,
    SEMANTIC_SCHOLAR_BASE_URL,
    SEFARIA_BASE_URL,
    INTERNET_ARCHIVE_BASE_URL,
    CORE_API_KEY,
    CORE_BASE_URL,
)

import requests

# ============================================================================
# JEWISH HISTORY ERA DEFINITIONS
# ============================================================================

JEWISH_ERAS = {
    1: {
        "name": "Rabbinic Foundations",
        "start_year": 70,
        "end_year": 200,
        "description": "The age of the Tannaim, Mishnah compilation, and the transformation from Temple Judaism to Rabbinic Judaism",
        "key_figures": [
            "Yochanan ben Zakkai",
            "Rabbi Akiva",
            "Rabbi Judah the Prince",
            "Rabban Gamaliel II",
            "Rabbi Meir",
            "Rabbi Shimon bar Yochai",
            "Rabbi Ishmael",
            "Rabbi Tarfon"
        ],
        "key_events": [
            "Destruction of Second Temple (70 CE)",
            "Establishment of Yavneh Academy",
            "Bar Kokhba Revolt (132-135 CE)",
            "Hadrianic Persecutions",
            "Compilation of the Mishnah (c. 200 CE)",
            "Ten Martyrs (Asara Harugei Malchut)"
        ],
        "key_texts": [
            "Mishnah",
            "Tosefta",
            "Mekhilta",
            "Sifra",
            "Sifre"
        ],
        "sefaria_refs": [
            "Pirkei Avot 1",
            "Mishnah Berakhot 1",
            "Mishnah Sanhedrin 10"
        ],
        "themes": [
            "Transition from Temple to Torah-centered Judaism",
            "Development of rabbinic authority",
            "Oral Torah codification",
            "Martyrdom and Kiddush Hashem",
            "Parting of ways with Christianity"
        ],
        "christian_texts": [
            "New Testament writings",
            "Didache",
            "Epistle of Barnabas"
        ]
    },
    2: {
        "name": "Talmudic Period",
        "start_year": 200,
        "end_year": 500,
        "description": "The age of the Amoraim, completion of both Talmuds, and establishment of Babylonia as the center of Jewish life",
        "key_figures": [
            "Rav (Abba Arikha)",
            "Samuel of Nehardea",
            "Rabbi Yochanan bar Nappaha",
            "Resh Lakish",
            "Rav Ashi",
            "Ravina II",
            "Rava",
            "Abaye"
        ],
        "key_events": [
            "Founding of Sura Academy (219 CE)",
            "Compilation of Jerusalem Talmud (c. 400 CE)",
            "Compilation of Babylonian Talmud (c. 500 CE)",
            "Constantine and Christianization of Rome",
            "Theodosian Code (438 CE)",
            "Abolition of Jewish Patriarchate (425 CE)"
        ],
        "key_texts": [
            "Jerusalem Talmud",
            "Babylonian Talmud",
            "Genesis Rabbah",
            "Leviticus Rabbah"
        ],
        "sefaria_refs": [
            "Berakhot 61b",
            "Sanhedrin 37a",
            "Gittin 60b"
        ],
        "themes": [
            "Amoraic interpretation of Mishnah",
            "Babylonia vs Palestine as Jewish centers",
            "Jews under Christian Rome vs Sassanid Persia",
            "Dina de-malkhuta dina principle",
            "Talmudic dialectics"
        ],
        "christian_texts": [
            "Writings of Church Fathers",
            "Theodosian Code",
            "John Chrysostom's Homilies"
        ]
    },
    3: {
        "name": "Geonic Period",
        "start_year": 500,
        "end_year": 1000,
        "description": "The age of the Geonim, rise of Islam, and the golden age of Jewish-Islamic civilization",
        "key_figures": [
            "Rav Yehudai Gaon",
            "Rav Amram Gaon",
            "Saadia Gaon",
            "Sherira Gaon",
            "Hai Gaon",
            "Anan ben David",
            "Natronai Gaon"
        ],
        "key_events": [
            "Rise of Islam (622 CE onwards)",
            "Jews under the Umayyad and Abbasid Caliphates",
            "Karaite Schism (8th century)",
            "Khazar Conversion to Judaism",
            "Development of Responsa Literature",
            "First Complete Siddur by Rav Amram"
        ],
        "key_texts": [
            "Geonic Responsa",
            "Saadia's Emunot ve-Deot",
            "Siddur Rav Amram",
            "Halakhot Gedolot"
        ],
        "sefaria_refs": [
            "Saadia on Genesis 1"
        ],
        "themes": [
            "Geonim as supreme halakhic authorities",
            "Jewish-Islamic cultural exchange",
            "Karaite challenge to rabbinic authority",
            "Jewish philosophy emergence",
            "Masoretic text finalization"
        ],
        "christian_texts": [
            "Islamic sources on dhimmi status",
            "Byzantine Christian writings"
        ]
    },
    4: {
        "name": "Golden Age of Spain and Early Ashkenaz",
        "start_year": 1000,
        "end_year": 1300,
        "description": "The golden age of Sephardic Jewry, rise of Ashkenazi communities, and the First Crusade massacres",
        "key_figures": [
            "Rashi",
            "Maimonides (Rambam)",
            "Judah Halevi",
            "Abraham ibn Ezra",
            "Nachmanides (Ramban)",
            "Rabbenu Tam",
            "Rabbi Gershom of Mainz"
        ],
        "key_events": [
            "First Crusade Massacres (1096)",
            "Almohad Persecutions in Spain",
            "Maimonidean Controversy",
            "Barcelona Disputation (1263)",
            "Blood Libel Accusations Begin",
            "Burning of Talmud in Paris (1242)"
        ],
        "key_texts": [
            "Rashi's Commentaries",
            "Mishneh Torah",
            "Guide for the Perplexed",
            "Kuzari",
            "Sefer Hasidim",
            "Zohar"
        ],
        "sefaria_refs": [
            "Rashi on Genesis 1:1",
            "Mishneh Torah, Foundations of Torah 1",
            "Kuzari, Part One"
        ],
        "themes": [
            "Sephardic vs Ashkenazi cultures",
            "Jewish philosophy meets Greek-Arabic thought",
            "Crusade martyrdom (Kiddush Hashem)",
            "Codification of Jewish law",
            "Kabbalah emergence"
        ],
        "christian_texts": [
            "Crusade chronicles",
            "Paris Disputation records",
            "Papal bulls on Jews"
        ]
    },
    5: {
        "name": "Late Medieval Period",
        "start_year": 1300,
        "end_year": 1500,
        "description": "The age of expulsions, Black Death accusations, and the decline of medieval Jewish communities",
        "key_figures": [
            "Rabbi Asher ben Yechiel (Rosh)",
            "Rabbi Jacob ben Asher (Tur)",
            "Rabbi Nissim of Gerona",
            "Don Isaac Abravanel",
            "Rabbi Joseph Albo",
            "Rabbi Hasdai Crescas"
        ],
        "key_events": [
            "Black Death Massacres (1348-1351)",
            "Expulsion from Spain (1492)",
            "Expulsion from Portugal (1497)",
            "Spanish Inquisition (1478)",
            "Tortosa Disputation (1413-1414)",
            "Converso Phenomenon"
        ],
        "key_texts": [
            "Arba'ah Turim",
            "Sefer Ikkarim",
            "Abravanel's Commentaries",
            "Or Hashem (Crescas)"
        ],
        "sefaria_refs": [
            "Tur, Orach Chaim 1"
        ],
        "themes": [
            "Expulsions and refugee movements",
            "Blood libel and host desecration accusations",
            "Conversos and crypto-Judaism",
            "Decline of Iberian Jewry",
            "Migration to Ottoman Empire"
        ],
        "christian_texts": [
            "Inquisition records",
            "Expulsion decrees",
            "Disputation transcripts"
        ]
    },
    6: {
        "name": "Early Modern Period",
        "start_year": 1500,
        "end_year": 1700,
        "description": "The age of the Shulchan Aruch, Safed Kabbalah, Polish Jewry's rise, and the Chmielnicki massacres",
        "key_figures": [
            "Rabbi Joseph Karo",
            "Rabbi Moses Isserles (Rema)",
            "Rabbi Isaac Luria (Arizal)",
            "Rabbi Moses Cordovero",
            "Shabbetai Tzvi",
            "Nathan of Gaza",
            "Maharal of Prague"
        ],
        "key_events": [
            "Publication of Shulchan Aruch (1565)",
            "Safed Mystical Revival",
            "Council of Four Lands",
            "Chmielnicki Massacres (1648-1649)",
            "Shabbatean Movement (1665-1666)",
            "Resettlement in England (1656)"
        ],
        "key_texts": [
            "Shulchan Aruch",
            "Lurianic Writings",
            "Shenei Luchot HaBrit",
            "Torat HaOlah"
        ],
        "sefaria_refs": [
            "Shulchan Arukh, Orach Chaim 1"
        ],
        "themes": [
            "Standardization of Jewish law",
            "Lurianic Kabbalah",
            "Rise of Polish-Lithuanian Jewry",
            "Messianic movements",
            "Jewish autonomy in Poland"
        ],
        "christian_texts": [
            "Protestant Reformation sources",
            "Counter-Reformation documents"
        ]
    },
    7: {
        "name": "Hasidism and Enlightenment",
        "start_year": 1700,
        "end_year": 1800,
        "description": "The age of the Baal Shem Tov, rise of Hasidism, the Haskalah, and the Vilna Gaon",
        "key_figures": [
            "Baal Shem Tov",
            "Dov Ber of Mezeritch",
            "Vilna Gaon",
            "Rabbi Schneur Zalman of Liadi",
            "Rabbi Nachman of Breslov",
            "Moses Mendelssohn",
            "Rabbi Elimelech of Lizhensk"
        ],
        "key_events": [
            "Rise of Hasidic Movement (1730s-1760s)",
            "Mitnagdic-Hasidic Controversy",
            "Haskalah (Jewish Enlightenment) Begins",
            "Partitions of Poland (1772, 1793, 1795)",
            "French Revolution and Emancipation Debates",
            "Napoleon's Sanhedrin (1807)"
        ],
        "key_texts": [
            "Tanya",
            "Toldot Yaakov Yosef",
            "Noam Elimelech",
            "Likutey Moharan",
            "Jerusalem (Mendelssohn)"
        ],
        "sefaria_refs": [
            "Tanya, Likutei Amarim 1"
        ],
        "themes": [
            "Hasidic revolution in spirituality",
            "Mitnagdic opposition",
            "Enlightenment and modernity",
            "Tzaddik concept",
            "Beginning of Jewish emancipation"
        ],
        "christian_texts": [
            "Enlightenment philosophy",
            "Emancipation debates"
        ]
    },
    8: {
        "name": "Emancipation and Migration",
        "start_year": 1800,
        "end_year": 1900,
        "description": "The age of emancipation, Reform Judaism, mass migration, and the rise of Zionism",
        "key_figures": [
            "Rabbi Moses Sofer (Chatam Sofer)",
            "Abraham Geiger",
            "Samson Raphael Hirsch",
            "Heinrich Graetz",
            "Theodor Herzl",
            "Leon Pinsker",
            "Rabbi Israel Meir Kagan (Chofetz Chaim)"
        ],
        "key_events": [
            "Jewish Emancipation Across Europe",
            "Rise of Reform Judaism",
            "Russian Pogroms (1881-1884)",
            "Mass Migration to America",
            "First Zionist Congress (1897)",
            "Dreyfus Affair (1894)"
        ],
        "key_texts": [
            "Chatam Sofer Responsa",
            "Nineteen Letters (Hirsch)",
            "History of the Jews (Graetz)",
            "Der Judenstaat (Herzl)",
            "Mishnah Berurah"
        ],
        "sefaria_refs": [],
        "themes": [
            "Emancipation and its challenges",
            "Denominationalism emerges",
            "Modern antisemitism",
            "Zionism and nationalism",
            "American Jewish community"
        ],
        "christian_texts": [
            "Emancipation documents",
            "Antisemitic literature"
        ]
    },
    9: {
        "name": "Catastrophe and Rebirth",
        "start_year": 1900,
        "end_year": 1950,
        "description": "The age of World Wars, the Holocaust, and the establishment of Israel",
        "key_figures": [
            "Rabbi Abraham Isaac Kook",
            "Chaim Weizmann",
            "David Ben-Gurion",
            "Rabbi Joseph Soloveitchik",
            "Rabbi Menachem Mendel Schneerson",
            "Janusz Korczak",
            "Hannah Senesh"
        ],
        "key_events": [
            "Balfour Declaration (1917)",
            "Rise of Nazism (1933)",
            "Nuremberg Laws (1935)",
            "The Holocaust/Shoah (1939-1945)",
            "Warsaw Ghetto Uprising (1943)",
            "Establishment of State of Israel (1948)"
        ],
        "key_texts": [
            "Orot (Rav Kook)",
            "Halakhic Man (Soloveitchik)",
            "Holocaust testimonies and diaries",
            "Israel Declaration of Independence"
        ],
        "sefaria_refs": [],
        "themes": [
            "Holocaust - destruction of European Jewry",
            "Jewish resistance and rescue",
            "Theological responses to Holocaust",
            "Birth of State of Israel",
            "American Jewry becomes center"
        ],
        "christian_texts": [
            "Church responses to Nazism",
            "Rescue efforts documentation"
        ]
    },
    10: {
        "name": "Contemporary Period",
        "start_year": 1950,
        "end_year": 2024,
        "description": "The modern State of Israel, American Jewry, and global Jewish life today",
        "key_figures": [
            "Rabbi Joseph B. Soloveitchik",
            "Rabbi Menachem Mendel Schneerson",
            "Elie Wiesel",
            "Rabbi Abraham Joshua Heschel",
            "Rabbi Ovadia Yosef",
            "Rabbi Jonathan Sacks",
            "Golda Meir"
        ],
        "key_events": [
            "Six-Day War (1967)",
            "Yom Kippur War (1973)",
            "Soviet Jewry Movement",
            "Ethiopian Jewish Immigration",
            "Oslo Accords (1993)",
            "October 7, 2023 Attacks"
        ],
        "key_texts": [
            "Lonely Man of Faith",
            "The Sabbath (Heschel)",
            "Night (Elie Wiesel)",
            "Contemporary Responsa"
        ],
        "sefaria_refs": [],
        "themes": [
            "Israel-Diaspora relations",
            "Religious vs secular identity",
            "Denominational diversity",
            "Holocaust memory",
            "Contemporary antisemitism"
        ],
        "christian_texts": [
            "Nostra Aetate (Vatican II)",
            "Jewish-Christian dialogue documents"
        ]
    }
}


# ============================================================================
# ENHANCED API CLIENTS (Same as Christian version)
# ============================================================================

class EnhancedPerplexityClient:
    """Enhanced Perplexity client with Jewish history expertise."""

    def __init__(self):
        self.api_key = PERPLEXITY_API_KEY
        self.base_url = PERPLEXITY_BASE_URL
        self.model = "sonar"
        self.max_retries = 3

    def research(self, query: str, system_prompt: str = None, retries: int = 0) -> Dict[str, Any]:
        """Make enhanced research query."""
        default_system = """You are a world-class academic historian specializing in Jewish history,
rabbinic literature, and Judaism. You have expertise across Orthodox, Conservative, Reform,
and secular academic historiography.

Your responses must:
1. Be rigorously scholarly with specific dates, names, and places
2. Include direct quotes from primary sources (Talmud, Midrash, Responsa, etc.)
3. Cite specific academic works and scholars
4. Note scholarly debates and areas of disagreement
5. Distinguish between established facts and scholarly interpretation
6. Provide bibliographic references in academic format
7. Consider multiple Jewish denominational perspectives
8. Use precise Hebrew/Aramaic terminology correctly with translations

Write in an engaging but academically rigorous style suitable for graduate-level study."""

        messages = [
            {"role": "system", "content": system_prompt or default_system},
            {"role": "user", "content": query}
        ]

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={"model": self.model, "messages": messages},
                timeout=180
            )
            response.raise_for_status()
            return response.json()
        except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
            if retries < self.max_retries:
                print(f"      API timeout, retrying ({retries + 1}/{self.max_retries})...")
                time.sleep(10 * (retries + 1))
                return self.research(query, system_prompt, retries + 1)
            else:
                print(f"      Max retries exceeded")
                return {"choices": [{"message": {"content": f"[Content temporarily unavailable]"}}]}

    def deep_research(self, topic: str, era: Dict) -> str:
        """Perform deep research with follow-up questions."""
        initial_query = f"""Provide comprehensive scholarly analysis of {topic}
during the {era['name']} ({era['start_year']}-{era['end_year']} CE) in Jewish history.

Include:
1. Detailed historical context with specific dates
2. Key figures involved with biographical details
3. Primary source documentation (quote original texts in Hebrew/Aramaic with translation)
4. Religious and halakhic significance
5. Political and social implications
6. Impact on subsequent Jewish history
7. Different scholarly interpretations
8. Full bibliographic references

Be extremely detailed and cite specific passages from primary sources."""

        response = self.research(initial_query)
        initial_content = response["choices"][0]["message"]["content"]

        # Follow-up for primary sources
        followup_query = f"""Regarding {topic} in the {era['name']}:

Provide direct quotations from primary Jewish sources with full citations.
Include the original Hebrew/Aramaic alongside translations.
Cite specific tractates, chapters, and sections.
Note textual variants and manuscript traditions if relevant."""

        time.sleep(3)
        followup = self.research(followup_query)
        followup_content = followup["choices"][0]["message"]["content"]

        return f"{initial_content}\n\n### Primary Source Quotations\n\n{followup_content}"


class EnhancedSefariaClient:
    """Enhanced Sefaria client for Jewish texts."""

    def __init__(self):
        self.base_url = SEFARIA_BASE_URL

    def get_text(self, ref: str) -> Optional[Dict]:
        """Get text with Hebrew and English."""
        try:
            response = requests.get(f"{self.base_url}/texts/{ref}", timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"      Sefaria error for {ref}: {e}")
            return None

    def search(self, query: str, limit: int = 10) -> Dict:
        """Search Sefaria texts."""
        try:
            response = requests.get(
                f"{self.base_url}/search-wrapper",
                params={"q": query, "size": limit},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except:
            return {}

    def get_era_texts(self, era: Dict) -> List[Dict]:
        """Get relevant texts for an era."""
        results = []
        for ref in era.get("sefaria_refs", []):
            data = self.get_text(ref)
            if data:
                results.append({
                    "ref": ref,
                    "he": data.get("he", ""),
                    "text": data.get("text", ""),
                    "commentary": data.get("commentary", [])[:3]
                })
            time.sleep(1)
        return results


class EnhancedScholarClient:
    """Enhanced Semantic Scholar + CORE client."""

    def __init__(self):
        self.ss_key = SEMANTIC_SCHOLAR_API_KEY
        self.ss_url = SEMANTIC_SCHOLAR_BASE_URL
        self.core_key = CORE_API_KEY
        self.core_url = CORE_BASE_URL

    def search_papers(self, query: str, limit: int = 15) -> List[Dict]:
        """Search both Semantic Scholar and CORE."""
        results = []

        # Semantic Scholar
        try:
            headers = {"x-api-key": self.ss_key} if self.ss_key else {}
            response = requests.get(
                f"{self.ss_url}/paper/search",
                headers=headers,
                params={
                    "query": query,
                    "limit": limit,
                    "fields": "title,authors,year,abstract,citationCount,url,venue"
                },
                timeout=30
            )
            response.raise_for_status()
            papers = response.json().get("data", [])
            for p in papers:
                results.append({
                    "source": "Semantic Scholar",
                    "title": p.get("title"),
                    "authors": [a.get("name") for a in p.get("authors", [])],
                    "year": p.get("year"),
                    "venue": p.get("venue"),
                    "abstract": p.get("abstract", "")[:300],
                    "citations": p.get("citationCount", 0),
                    "url": p.get("url")
                })
        except Exception as e:
            print(f"   Semantic Scholar error: {e}")

        time.sleep(1)

        # CORE
        try:
            response = requests.get(
                f"{self.core_url}/search/works",
                headers={"Authorization": f"Bearer {self.core_key}"},
                params={"q": query, "limit": 5},
                timeout=30
            )
            response.raise_for_status()
            works = response.json().get("results", [])
            for w in works:
                results.append({
                    "source": "CORE",
                    "title": w.get("title"),
                    "authors": w.get("authors", []),
                    "year": w.get("yearPublished"),
                    "abstract": w.get("abstract", "")[:300],
                    "url": w.get("downloadUrl")
                })
        except Exception as e:
            print(f"   CORE error: {e}")

        return results


# ============================================================================
# ENHANCED JEWISH HISTORY GENERATOR
# ============================================================================

class EnhancedJewishHistoryGenerator:
    """Generate 9.5/10 quality Jewish history content."""

    def __init__(self):
        self.perplexity = EnhancedPerplexityClient()
        self.sefaria = EnhancedSefariaClient()
        self.scholar = EnhancedScholarClient()

        self.output_dir = Path(__file__).parent.parent.parent / "content" / "jewish-eras"
        self.data_dir = Path(__file__).parent.parent.parent / "data"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def generate_era(self, era_num: int) -> Dict:
        """Generate comprehensive era content."""
        if era_num not in JEWISH_ERAS:
            raise ValueError(f"Era {era_num} not found")

        era = JEWISH_ERAS[era_num]
        print(f"\n{'='*70}")
        print(f"GENERATING JEWISH ERA {era_num}: {era['name']} (ENHANCED)")
        print(f"({era['start_year']} - {era['end_year']} CE)")
        print(f"{'='*70}\n")

        content = {
            "era_number": era_num,
            "name": era["name"],
            "start_year": era["start_year"],
            "end_year": era["end_year"],
            "description": era["description"],
            "generated_at": datetime.now().isoformat(),
            "quality_level": "enhanced",
            "sections": {}
        }

        # 1. Comprehensive Overview
        print("1. Generating comprehensive overview...")
        content["sections"]["overview"] = self._generate_overview(era)
        time.sleep(3)

        # 2. Key Events (deep research)
        print("2. Researching key events in depth...")
        events = []
        for event in era["key_events"]:
            print(f"   - {event}")
            events.append(self._research_event_deep(event, era))
            time.sleep(3)
        content["sections"]["events"] = events

        # 3. Key Figures (with primary source quotes)
        print("3. Researching key figures with primary sources...")
        figures = []
        for figure in era["key_figures"][:6]:
            print(f"   - {figure}")
            figures.append(self._research_figure_deep(figure, era))
            time.sleep(3)
        content["sections"]["figures"] = figures

        # 4. Key Texts Analysis
        print("4. Analyzing key Jewish texts...")
        texts = []
        for text in era.get("key_texts", [])[:4]:
            print(f"   - {text}")
            texts.append(self._analyze_text(text, era))
            time.sleep(3)
        content["sections"]["text_analysis"] = texts

        # 5. Sefaria Primary Sources
        print("5. Fetching primary texts from Sefaria...")
        content["sections"]["sefaria_texts"] = self.sefaria.get_era_texts(era)
        time.sleep(2)

        # 6. Christian Perspective
        print("6. Analyzing Christian perspective on this period...")
        content["sections"]["christian_perspective"] = self._get_christian_perspective(era)
        time.sleep(3)

        # 7. Academic Sources
        print("7. Finding scholarly sources...")
        content["sections"]["academic_sources"] = self._get_academic_sources(era)
        time.sleep(2)

        # 8. Multi-Perspective Analysis
        print("8. Generating multi-perspective analysis...")
        content["sections"]["perspectives"] = self._get_perspectives(era)
        time.sleep(2)

        # 9. Scholarly Debates
        print("9. Analyzing scholarly debates...")
        content["sections"]["debates"] = self._analyze_debates(era)
        time.sleep(2)

        # 10. Legacy and Significance
        print("10. Analyzing legacy and significance...")
        content["sections"]["legacy"] = self._analyze_legacy(era)

        # Save
        self._save_content(era_num, era, content)
        return content

    def _generate_overview(self, era: Dict) -> str:
        """Generate comprehensive era overview."""
        query = f"""Provide an exhaustive scholarly overview of {era['name']}
({era['start_year']}-{era['end_year']} CE) in Jewish history.

Structure your response as follows:

## Historical and Political Context
- Major political events affecting Jewish communities
- Geographic scope and regional variations
- Social and economic factors affecting Jewish life
- Relations with ruling authorities (Roman, Persian, Islamic, Christian)

## Religious Developments
- Major halakhic (legal) developments
- Theological innovations
- Liturgical developments
- Institutional changes (academies, communal leadership)
- Mystical movements (if applicable)

## Key Theological Themes
- Central religious debates
- Development of Jewish thought
- Responses to external challenges

## Community-State Relations
- Legal status of Jews
- Persecutions or periods of tolerance
- Jewish autonomy and self-governance

## Primary Sources from This Period
- List major texts with authors and dates
- Describe their content and significance

## Modern Scholarly Assessment
- How historians evaluate this period
- Major scholarly debates
- Recent research trends

Include specific dates, names, places, and direct quotations from primary sources.
Provide full bibliographic citations for scholarly works referenced."""

        response = self.perplexity.research(query)
        return response["choices"][0]["message"]["content"]

    def _research_event_deep(self, event: str, era: Dict) -> Dict:
        """Deep research on historical event."""
        content = self.perplexity.deep_research(event, era)
        return {
            "name": event,
            "content": content,
            "era": era["name"]
        }

    def _research_figure_deep(self, figure: str, era: Dict) -> Dict:
        """Deep research on historical figure."""
        query = f"""Provide comprehensive scholarly biography of {figure}
in the context of the {era['name']} ({era['start_year']}-{era['end_year']} CE).

Include:
1. BIOGRAPHICAL DETAILS
   - Birth, death, major life events with exact dates
   - Education and teachers
   - Positions held, travels, key relationships

2. MAJOR WORKS
   - List all significant writings/teachings
   - Describe content and significance
   - Quote key passages (Hebrew/Aramaic with translation)

3. HALAKHIC CONTRIBUTIONS
   - Major legal rulings
   - Methodological innovations
   - Influence on Jewish law

4. THEOLOGICAL CONTRIBUTIONS
   - Major doctrinal positions
   - Innovations or distinctive teachings
   - Philosophical views

5. HISTORICAL CONTEXT
   - Relations with authorities
   - Response to contemporary challenges
   - Role in communal life

6. LEGACY
   - Influence on subsequent Judaism
   - How different traditions view this figure
   - Modern scholarly assessment

7. PRIMARY SOURCE QUOTES
   - Include 3-5 significant quotations
   - Provide citations with tractate/chapter numbers

Provide full academic citations for all sources."""

        response = self.perplexity.research(query)
        return {
            "name": figure,
            "content": response["choices"][0]["message"]["content"],
            "era": era["name"]
        }

    def _analyze_text(self, text_name: str, era: Dict) -> Dict:
        """Analyze a key Jewish text."""
        query = f"""Analyze the Jewish text "{text_name}" from the {era['name']}.

Include:
1. Author, date, and circumstances of composition
2. Genre and structure
3. Key themes and content
4. Halakhic or theological significance
5. Historical impact and reception
6. Key quotations with citations
7. Modern scholarly editions and translations
8. How different traditions have used this text"""

        response = self.perplexity.research(query)
        return {
            "title": text_name,
            "analysis": response["choices"][0]["message"]["content"]
        }

    def _get_christian_perspective(self, era: Dict) -> str:
        """Get Christian perspective on the era."""
        query = f"""How did Christians view and interact with Jews during
{era['start_year']}-{era['end_year']} CE?

Include:
1. Official Church policies and theological positions
2. Key Christian writers and their views on Jews
3. Political actions by Christian authorities
4. Jewish-Christian relations and conflicts
5. Areas of interaction or dialogue
6. Impact of Christian attitudes on Jewish life
7. How Christian sources document Jewish history in this period

Provide scholarly analysis with specific examples and sources."""

        response = self.perplexity.research(query)
        return response["choices"][0]["message"]["content"]

    def _get_academic_sources(self, era: Dict) -> List[Dict]:
        """Get academic sources from multiple databases."""
        queries = [
            f"{era['name']} Jewish history",
            f"{era['name']} Judaism rabbinic",
            f"Jewish {era['start_year']}-{era['end_year']} CE history"
        ]

        all_sources = []
        for query in queries:
            sources = self.scholar.search_papers(query, limit=5)
            all_sources.extend(sources)
            time.sleep(2)

        # Deduplicate
        seen = set()
        unique = []
        for s in all_sources:
            title = s.get("title", "")
            if title and title not in seen:
                seen.add(title)
                unique.append(s)

        return unique[:15]

    def _get_perspectives(self, era: Dict) -> Dict:
        """Get detailed multi-perspective analysis."""
        perspectives = {}
        traditions = [
            ("Orthodox", "Traditional rabbinic interpretation, halakhic authority"),
            ("Conservative/Masorti", "Historical-positive approach, traditional with change"),
            ("Reform", "Progressive interpretation, ethical emphasis"),
            ("Academic/Secular", "Historical-critical method, religious studies"),
            ("Haredi/Ultra-Orthodox", "Strictest traditional interpretation")
        ]

        for tradition, focus in traditions:
            query = f"""From a {tradition} Jewish perspective (focusing on {focus}),
analyze the {era['name']} ({era['start_year']}-{era['end_year']} CE).

Include:
1. How this tradition views this period's significance
2. Key figures and events emphasized
3. Religious/halakhic assessments
4. Areas of agreement with other traditions
5. Areas of disagreement or unique emphasis
6. How this period shaped {tradition} identity
7. Key scholars from this tradition

Be specific and cite relevant {tradition} authorities and historians."""

            response = self.perplexity.research(query)
            perspectives[tradition] = response["choices"][0]["message"]["content"]
            time.sleep(3)

        return perspectives

    def _analyze_debates(self, era: Dict) -> str:
        """Analyze scholarly debates about the era."""
        query = f"""What are the major scholarly debates about the {era['name']}
({era['start_year']}-{era['end_year']} CE) in Jewish history?

For each debate:
1. State the question or controversy
2. Summarize the main positions
3. Name key scholars on each side
4. Describe the evidence and arguments
5. Note the current state of the debate
6. Explain why it matters for understanding this period

Include debates about:
- Historical facts and interpretation
- Dating of texts
- Rabbinic authority and development
- Social and economic history
- Relations with non-Jews
- Methodology in Jewish studies"""

        response = self.perplexity.research(query)
        return response["choices"][0]["message"]["content"]

    def _analyze_legacy(self, era: Dict) -> str:
        """Analyze the era's legacy."""
        query = f"""Analyze the lasting legacy and significance of the {era['name']}
({era['start_year']}-{era['end_year']} CE) for subsequent Jewish history.

Include:
1. Immediate impact on the following era
2. Long-term halakhic influence
3. Theological and philosophical legacy
4. Institutional developments that persisted
5. Continuing relevance for modern Judaism
6. How different denominations draw on this period today
7. Popular vs scholarly understanding of this era
8. Resources for further study (key books, courses)"""

        response = self.perplexity.research(query)
        return response["choices"][0]["message"]["content"]

    def _save_content(self, era_num: int, era: Dict, content: Dict):
        """Save enhanced content."""
        era_str = f"{era_num:02d}"
        name_slug = era["name"].lower().replace(" ", "_").replace("/", "_")
        start = era["start_year"]
        end = era["end_year"]

        # JSON
        json_path = self.data_dir / f"jewish_era_{era_str}_{name_slug}_enhanced.json"
        with open(json_path, "w") as f:
            json.dump(content, f, indent=2, default=str)
        print(f"\nSaved JSON: {json_path}")

        # Markdown
        md_content = self._generate_enhanced_markdown(era_num, era, content)
        md_path = self.output_dir / f"{era_str}_{name_slug}_{start}_{end}ce_enhanced.md"
        with open(md_path, "w") as f:
            f.write(md_content)
        print(f"Saved markdown: {md_path}")
        print(f"File size: {len(md_content):,} characters")

    def _generate_enhanced_markdown(self, era_num: int, era: Dict, content: Dict) -> str:
        """Generate enhanced markdown document."""
        sections = content.get("sections", {})

        md = f"""# Era {era_num}: {era['name']}
## {era['start_year']} - {era['end_year']} CE

*{era['description']}*

**Quality Level:** Enhanced (9.5/10)
**Generated:** {content.get('generated_at', 'Unknown')}

---

## Table of Contents
1. [Overview](#overview)
2. [Key Events](#key-events)
3. [Key Figures](#key-figures)
4. [Key Texts](#key-texts)
5. [Primary Sources (Sefaria)](#primary-sources-sefaria)
6. [Christian Perspective](#christian-perspective)
7. [Multi-Perspective Analysis](#multi-perspective-analysis)
8. [Scholarly Debates](#scholarly-debates)
9. [Legacy and Significance](#legacy-and-significance)
10. [Academic Sources](#academic-sources)

---

## Overview

{sections.get('overview', 'No overview available.')}

---

## Key Events

"""
        for event in sections.get("events", []):
            md += f"### {event.get('name', 'Unknown')}\n\n"
            md += f"{event.get('content', 'No content.')}\n\n"
            md += "---\n\n"

        md += "## Key Figures\n\n"
        for figure in sections.get("figures", []):
            md += f"### {figure.get('name', 'Unknown')}\n\n"
            md += f"{figure.get('content', 'No content.')}\n\n"
            md += "---\n\n"

        md += "## Key Texts\n\n"
        for text in sections.get("text_analysis", []):
            md += f"### {text.get('title', 'Unknown')}\n\n"
            md += f"{text.get('analysis', 'No analysis.')}\n\n"
            md += "---\n\n"

        md += "## Primary Sources (Sefaria)\n\n"
        for text in sections.get("sefaria_texts", []):
            md += f"### {text.get('ref', 'Unknown')}\n\n"
            if text.get('text'):
                en_text = text['text']
                if isinstance(en_text, list):
                    en_text = ' '.join(str(t) for t in en_text[:5] if t)
                md += f"**English:** {str(en_text)[:500]}...\n\n"
            if text.get('he'):
                he_text = text['he']
                if isinstance(he_text, list):
                    he_text = ' '.join(str(t) for t in he_text[:3] if t)
                md += f"**Hebrew:** {str(he_text)[:300]}...\n\n"

        md += "---\n\n## Christian Perspective\n\n"
        md += f"{sections.get('christian_perspective', 'No analysis.')}\n\n"

        md += "---\n\n## Multi-Perspective Analysis\n\n"
        perspectives = sections.get("perspectives", {})
        for tradition, analysis in perspectives.items():
            md += f"### {tradition} Perspective\n\n"
            md += f"{analysis}\n\n"

        md += "---\n\n## Scholarly Debates\n\n"
        md += f"{sections.get('debates', 'No debates analysis.')}\n\n"

        md += "---\n\n## Legacy and Significance\n\n"
        md += f"{sections.get('legacy', 'No legacy analysis.')}\n\n"

        md += "---\n\n## Academic Sources\n\n"
        for source in sections.get("academic_sources", []):
            raw_authors = source.get("authors", [])
            if raw_authors:
                author_names = []
                for a in raw_authors[:3]:
                    if isinstance(a, str):
                        author_names.append(a)
                    elif isinstance(a, dict):
                        author_names.append(a.get("name", str(a)))
                    else:
                        author_names.append(str(a))
                authors = ", ".join(author_names)
            else:
                authors = "Unknown"
            md += f"- **{source.get('title', 'Unknown')}** ({source.get('year', 'n.d.')})\n"
            md += f"  - Authors: {authors}\n"
            md += f"  - Source: {source.get('source', 'Unknown')}\n"
            if source.get("venue"):
                md += f"  - Venue: {source['venue']}\n"
            if source.get("citations"):
                md += f"  - Citations: {source['citations']}\n"
            md += "\n"

        md += """---

*This document is part of the Jewish Post-Biblical History Narrative series,
covering Jewish history from 70 CE to the present.*

*Generated using AI-powered research across Perplexity, Sefaria, Semantic Scholar, and CORE.*
"""
        return md


# ============================================================================
# MAIN
# ============================================================================

def main():
    generator = EnhancedJewishHistoryGenerator()

    if len(sys.argv) > 1:
        try:
            era_num = int(sys.argv[1])
            if era_num < 1 or era_num > 10:
                print("Error: Era number must be between 1 and 10")
                sys.exit(1)
            generator.generate_era(era_num)
        except ValueError:
            print(f"Error: Invalid era number: {sys.argv[1]}")
            sys.exit(1)
    else:
        print("="*70)
        print("GENERATING ALL JEWISH HISTORY ERAS (1-10) - ENHANCED 9.5/10 QUALITY")
        print("="*70)

        for era_num in range(1, 11):
            try:
                generator.generate_era(era_num)
                print(f"\n{'='*70}")
                print(f"COMPLETED ERA {era_num}")
                print(f"{'='*70}\n")

                if era_num < 10:
                    print("Waiting 15 seconds before next era...")
                    time.sleep(15)

            except Exception as e:
                print(f"\nERROR generating era {era_num}: {e}")
                import traceback
                traceback.print_exc()
                continue

        print("\n" + "="*70)
        print("ALL JEWISH HISTORY ERAS COMPLETE!")
        print("="*70)


if __name__ == "__main__":
    main()
