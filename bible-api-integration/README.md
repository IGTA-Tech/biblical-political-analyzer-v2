# 📖 Bible API Integration System

Complete system for accessing multiple Bible versions, original languages (Hebrew/Greek), and integrating with your RAG-enhanced biblical narrative.

## 🎯 Architecture Overview

```
Your App
├── RAG System (jewish_biblical_narrative_enhanced.md)
│   └── Historical/Cultural/Archaeological Context
│
└── Bible API Layer (this system)
    ├── Multiple Translation APIs
    ├── Hebrew/Greek Original Languages
    ├── Cross-References
    └── Lexicon/Strong's Numbers
```

## 🚀 Quick Start

```javascript
import { BibleAPIClient } from './BibleAPIClient.js';

const bible = new BibleAPIClient();

// Get verse in multiple versions
const verse = await bible.getVerse('John', 3, 16, {
  versions: ['KJV', 'ESV', 'WEB']
});

// Get original language
const hebrew = await bible.getOriginalLanguage('Genesis', 1, 1, 'Hebrew');

// Get entire chapter
const chapter = await bible.getChapter('Romans', 8, 'ESV');
```

## 📚 Supported APIs

### 1. Bible API (Free, No Key Required)
- **Versions:** KJV, WEB, Clementine, Almeida
- **Rate Limit:** Unlimited
- **Features:** Simple REST, JSON response

### 2. ESV API (Free Tier Available)
- **Versions:** ESV (English Standard Version)
- **Rate Limit:** 5,000 requests/day (free)
- **Features:** Audio, passage search, formatting options
- **Get Key:** https://api.esv.org/account/create/

### 3. Blue Letter Bible API (Free)
- **Versions:** KJV, NKJV, NASB, others
- **Original Languages:** Hebrew, Greek, Aramaic
- **Features:** Strong's numbers, lexicon, interlinear
- **Get Key:** https://www.blueletterbible.org/api/register

### 4. API.Bible (Free Tier)
- **Versions:** 1,800+ translations in 1,500+ languages
- **Rate Limit:** 500 requests/day (free)
- **Get Key:** https://scripture.api.bible/signup

### 5. Bible Brain / DBP (Free)
- **Versions:** 400+ languages
- **Features:** Audio Bibles, text, video
- **Rate Limit:** Generous free tier
- **Get Key:** https://dbt.io/api-key

## 🔧 Installation

See `/bible-api-integration/package.json` and `/bible-api-integration/BibleAPIClient.js` for full implementation.

## 📖 Usage Examples

See `/bible-api-integration/examples/` for complete working examples:
- `basic-usage.js` - Simple verse retrieval
- `multiple-versions.js` - Compare translations
- `original-languages.js` - Hebrew/Greek access
- `rag-integration.js` - Combine with your RAG system

## 🗝️ Environment Variables

Create `.env` file:
```
ESV_API_KEY=your_esv_key_here
BLUE_LETTER_BIBLE_API_KEY=your_blb_key_here
API_BIBLE_KEY=your_api_bible_key_here
```

## 🎯 Integration with Your RAG System

Your enhanced narrative provides context, APIs provide text:

```javascript
// 1. Get historical context from RAG
const context = await ragSystem.getContext('John', 3);
// Returns: "Historical Context: John's Gospel written 90-100 CE..."

// 2. Get verse text from API
const verseText = await bible.getVerse('John', 3, 16, { versions: ['ESV'] });

// 3. Combine for complete answer
const response = {
  context: context,
  text: verseText,
  archaeological: context.archaeology,
  cultural: context.culture
};
```

## 📊 Performance & Caching

The system includes intelligent caching:
- **Memory cache:** Fast repeated queries
- **File cache:** Persistent across sessions
- **Rate limit handling:** Automatic retry with backoff
- **Batch requests:** Reduce API calls

## 🌍 Supported Features

✅ Multiple translations (KJV, ESV, NIV, NASB, WEB, etc.)
✅ Hebrew Old Testament (BHS, WLC)
✅ Greek New Testament (TR, WH, NA28)
✅ Strong's concordance numbers
✅ Lexicon definitions
✅ Cross-references
✅ Interlinear word-by-word
✅ Audio Bibles (via Bible Brain)
✅ Passage search
✅ Chapter/verse validation

## 📁 File Structure

```
bible-api-integration/
├── README.md (this file)
├── package.json
├── BibleAPIClient.js (main class)
├── adapters/
│   ├── BibleAPIAdapter.js
│   ├── ESVAdapter.js
│   ├── BluLetterBibleAdapter.js
│   ├── APIBibleAdapter.js
│   └── BibleBrainAdapter.js
├── cache/
│   └── CacheManager.js
├── examples/
│   ├── basic-usage.js
│   ├── multiple-versions.js
│   ├── original-languages.js
│   └── rag-integration.js
├── utils/
│   ├── bookNames.js
│   ├── validation.js
│   └── rateLimiter.js
└── tests/
    └── BibleAPIClient.test.js
```

## 🚀 Next Steps

1. Get API keys (optional, but recommended for ESV/BLB)
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add keys
4. Run examples: `node examples/basic-usage.js`
5. Integrate with your RAG system

## 📖 Why This Approach?

**RAG Document (What We Built):**
- Deep historical/cultural/archaeological context
- Period backgrounds with 6-dimension analysis
- Book introductions with scholarly debates
- Contextual analyses every 5 chapters
- 400+ archaeological citations

**API Layer (What This Provides):**
- Any Bible version on-demand
- Always up-to-date translations
- Original Hebrew/Greek access
- No file bloat
- Easy to add new versions

**Combined = Powerful Biblical Study Tool!**

Your RAG provides *understanding*, APIs provide *text*.
