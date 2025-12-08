# Historical Faith Narrative

Content generation system for 2,000 years of religious history (4 BC - 2024 AD).

## Purpose

This folder contains scripts and content for generating the comprehensive historical narrative covering:

- **Christianity Track**: Spread, schisms, reforms, persecution, revival, modern movements
- **Judaism Track**: Diaspora, persecution, preservation, denominations, Israel
- **Intersections**: Jewish-Christian relations, shared history, conflicts
- **Scripture Usage**: How biblical texts were used/misused throughout history
- **Multiple Perspectives**: Orthodox, Catholic, Protestant, Jewish, Academic views

## Folder Structure

```
historical-faith-narrative/
├── scripts/           # Generation scripts
│   ├── research/      # Research & fact-finding (Perplexity, Semantic Scholar)
│   ├── generation/    # Content generation (Claude API)
│   ├── verification/  # Fact-checking & validation
│   └── ingestion/     # Database ingestion scripts
├── sources/           # Primary source references
│   ├── christianity/  # Church Fathers, councils, etc.
│   ├── judaism/       # Talmud, rabbinic writings, etc.
│   └── academic/      # Scholarly sources
├── content/           # Generated content (by category)
│   ├── eras/          # Era-by-era narratives
│   ├── figures/       # Historical figure profiles
│   ├── events/        # Event documentation
│   ├── perspectives/  # Multi-perspective analyses
│   └── scripture-usage/ # Scripture usage tracking
├── data/              # Structured data (JSON)
└── output/            # Final outputs
```

## Getting Started

1. Ensure API keys are configured in root `.env`
2. Run research scripts to gather sources
3. Run generation scripts to create content
4. Run verification scripts to fact-check
5. Run ingestion scripts to load into database

## APIs Used

- **Perplexity** - Research and fact-finding
- **Claude API** - Content generation
- **Semantic Scholar** - Academic sources
- **Internet Archive** - Historical texts
- **Sefaria** - Jewish texts (Torah, Talmud, commentaries)
- **API.Bible** - Multiple Bible translations

## Output

The final output is a comprehensive historical narrative document covering 4 BC to 2024 AD, similar in structure to `jewish_biblical_narrative_enhanced.md` but focused on post-biblical history.

## Eras Covered

1. **Second Temple & Early Church** (4 BC - 100 AD)
2. **Apostolic Fathers & Rabbinic Judaism** (100 - 325 AD)
3. **Constantine & Councils** (325 - 500 AD)
4. **Medieval Period** (500 - 1000 AD)
5. **High Middle Ages** (1000 - 1300 AD)
6. **Late Medieval & Pre-Reformation** (1300 - 1500 AD)
7. **Reformation** (1500 - 1600 AD)
8. **Post-Reformation & Enlightenment** (1600 - 1800 AD)
9. **Modern Era** (1800 - 1950 AD)
10. **Contemporary** (1950 - 2024 AD)

## Related

- See `../historical-faith-tracker/` for the web application
- See `../jewish_biblical_narrative_enhanced.md` for the biblical period narrative
