# 🚀 Bible API Integration Guide

Complete guide for integrating Bible API access into your biblical-political-analyzer-v2 application for contextual responses and study features.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [API Keys Setup](#api-keys-setup)
4. [Basic Usage Patterns](#basic-usage-patterns)
5. [Use Case Examples](#use-case-examples)
6. [Integration with RAG System](#integration-with-rag-system)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Production Deployment](#production-deployment)

---

## 🏁 Quick Start

### Installation

```bash
cd bible-api-integration
npm install
```

### Setup Environment Variables

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### Test Basic Functionality

```bash
# Test with free API (no keys required)
node examples/basic-usage.js

# Test original languages (requires Blue Letter Bible key)
node examples/original-languages.js

# Test RAG integration
node examples/rag-integration.js
```

---

## 🔧 Installation

### Option 1: Use as Submodule in Your App

```bash
# In your main app directory
cd /home/innovativeautomations/biblical-political-analyzer-v2

# Install dependencies
cd bible-api-integration
npm install
```

### Option 2: Import Directly in Your Code

```javascript
// In your app code
import { BibleAPIClient } from './bible-api-integration/BibleAPIClient.js';

const bible = new BibleAPIClient();
```

---

## 🔑 API Keys Setup

### Priority Order (Get keys in this order)

1. **Bible API** (bible-api.com) - ✅ **No key required!** Works immediately
2. **Blue Letter Bible** - Essential for Hebrew/Greek - [Get key](https://www.blueletterbible.org/api/register)
3. **ESV API** - High quality translation - [Get key](https://api.esv.org/account/create/)
4. **API.Bible** - 1,800+ translations - [Get key](https://scripture.api.bible/signup)
5. **Bible Brain** - Audio Bibles - [Get key](https://dbt.io/api-key)

### Setup .env File

```bash
# Required for Hebrew/Greek
BLUE_LETTER_BIBLE_API_KEY=your_key_here

# Recommended for quality translations
ESV_API_KEY=your_key_here

# Optional for multi-language support
API_BIBLE_KEY=your_key_here
BIBLE_BRAIN_KEY=your_key_here
```

---

## 📖 Basic Usage Patterns

### Pattern 1: Get Single Verse

```javascript
import { BibleAPIClient } from './bible-api-integration/BibleAPIClient.js';

const bible = new BibleAPIClient();

// Single translation
const verse = await bible.getVerse('John', 3, 16, { versions: ['KJV'] });
console.log(verse.versions.KJV);
// Output: "For God so loved the world, that he gave his only begotten Son..."

// Multiple translations
const multiVerse = await bible.getVerse('Genesis', 1, 1, {
  versions: ['KJV', 'ESV', 'WEB']
});
console.log(multiVerse.versions.KJV);
console.log(multiVerse.versions.ESV);
console.log(multiVerse.versions.WEB);
```

### Pattern 2: Get Chapter or Passage

```javascript
// Entire chapter
const chapter = await bible.getChapter('Psalms', 23, 'KJV');
console.log(chapter.text);

// Passage (multiple verses)
const passage = await bible.getPassage('Romans', 8, 28, 8, 39, 'ESV');
console.log(passage.text);
```

### Pattern 3: Original Languages

```javascript
// Hebrew (Old Testament)
const hebrew = await bible.getOriginalLanguage('Genesis', 1, 1);
console.log(hebrew.text);              // Hebrew text
console.log(hebrew.transliteration);   // Transliteration
console.log(hebrew.strongs);           // Strong's numbers

// Greek (New Testament)
const greek = await bible.getOriginalLanguage('John', 1, 1);
console.log(greek.text);               // Greek text
console.log(greek.interlinear);        // Word-by-word breakdown
```

### Pattern 4: Strong's Definitions

```javascript
// Look up Strong's number
const definition = await bible.getStrongsDefinition('H430');  // Elohim
console.log(definition.transliteration);  // "Elohim"
console.log(definition.definition);       // "God, gods, judges"
console.log(definition.longDefinition);   // Full definition
```

### Pattern 5: Compare Translations

```javascript
const comparison = await bible.compareTranslations(
  'John', 3, 16,
  ['KJV', 'ESV', 'NIV', 'NLT']
);

for (const [version, text] of Object.entries(comparison.versions)) {
  console.log(`${version}: ${text}`);
}
```

---

## 💡 Use Case Examples

### Use Case 1: Answering User Questions with Context

```javascript
import { BibleAPIClient } from './bible-api-integration/BibleAPIClient.js';
import { getRAGContext } from './your-rag-system.js';

async function answerBiblicalQuestion(book, chapter, verse, question) {
  const bible = new BibleAPIClient();

  // 1. Get verse text (multiple translations)
  const verseData = await bible.getVerse(book, chapter, verse, {
    versions: ['KJV', 'ESV']
  });

  // 2. Get historical context from your RAG
  const context = await getRAGContext(book, chapter);

  // 3. Get original language if needed
  let originalText = null;
  try {
    const original = await bible.getOriginalLanguage(book, chapter, verse);
    originalText = original.transliteration;
  } catch (error) {
    // Original language not available
  }

  // 4. Combine into response
  return {
    question: question,
    verse: {
      reference: `${book} ${chapter}:${verse}`,
      translations: verseData.versions,
      originalLanguage: originalText
    },
    context: {
      historical: context.historical,
      archaeological: context.archaeological,
      cultural: context.cultural,
      theological: context.theological
    }
  };
}

// Example usage
const answer = await answerBiblicalQuestion(
  'Genesis', 1, 1,
  'What is the historical context of the creation account?'
);

console.log(answer);
```

### Use Case 2: Contextual Bible Study Tool

```javascript
async function generateStudyGuide(book, chapter) {
  const bible = new BibleAPIClient();

  // Get entire chapter
  const chapterText = await bible.getChapter(book, chapter, 'ESV');

  // Get historical context from RAG
  const context = await getRAGContext(book, chapter);

  // Get cross-references for key verses
  const keyVerses = [1, 10, 20]; // Example key verses
  const crossRefs = await Promise.all(
    keyVerses.map(v => bible.getCrossReferences(book, chapter, v))
  );

  return {
    chapter: {
      reference: `${book} ${chapter}`,
      text: chapterText.text
    },
    context: context,
    crossReferences: crossRefs,
    studyNotes: {
      period: context.period,
      keyThemes: context.theological,
      archaeology: context.archaeological
    }
  };
}
```

### Use Case 3: Sermon Preparation Assistant

```javascript
async function prepareSermon(book, startCh, startV, endCh, endV) {
  const bible = new BibleAPIClient();

  // Get passage in multiple translations
  const esv = await bible.getPassage(book, startCh, startV, endCh, endV, 'ESV');
  const kjv = await bible.getPassage(book, startCh, startV, endCh, endV, 'KJV');

  // Get context
  const context = await getRAGContext(book, startCh);

  // Get original language for key verses
  const keyVerseOriginal = await bible.getOriginalLanguage(book, startCh, startV);

  return {
    title: `Sermon on ${book} ${startCh}:${startV}-${endCh}:${endV}`,
    text: {
      esv: esv.text,
      kjv: kjv.text
    },
    originalLanguage: {
      text: keyVerseOriginal.text,
      transliteration: keyVerseOriginal.transliteration,
      keyWords: keyVerseOriginal.strongs
    },
    context: {
      historicalSetting: context.historical,
      culturalPractices: context.cultural,
      archaeology: context.archaeological
    },
    applicationPoints: context.theological
  };
}
```

### Use Case 4: Word Study Tool

```javascript
async function performWordStudy(word, book, chapter, verse) {
  const bible = new BibleAPIClient();

  // Get original language
  const original = await bible.getOriginalLanguage(book, chapter, verse);

  // Find the word in Strong's numbers
  const wordData = original.strongs.find(s =>
    s.word.includes(word) || // Search in original text
    original.transliteration.toLowerCase().includes(word.toLowerCase())
  );

  if (!wordData) {
    throw new Error(`Word "${word}" not found in verse`);
  }

  // Get definitions for all Strong's numbers
  const definitions = await Promise.all(
    wordData.strongs.map(num => bible.getStrongsDefinition(num))
  );

  // Get cross-references
  const crossRefs = await bible.getCrossReferences(book, chapter, verse);

  return {
    word: word,
    originalWord: wordData.word,
    strongsNumbers: wordData.strongs,
    definitions: definitions,
    crossReferences: crossRefs,
    usage: {
      verse: `${book} ${chapter}:${verse}`,
      context: original.text,
      transliteration: original.transliteration
    }
  };
}

// Example: Study "love" in 1 John 4:8
const study = await performWordStudy('love', '1 John', 4, 8);
console.log(study);
```

### Use Case 5: Topic Search with Bible References

```javascript
async function searchTopic(topic) {
  const bible = new BibleAPIClient();

  // Get topic data from RAG
  const topicData = await searchRAGForTopic(topic);

  // Fetch all Bible references related to topic
  const verses = await Promise.all(
    topicData.references.map(async (ref) => {
      const parsed = parseReference(ref); // Your parser
      return await bible.getVerse(
        parsed.book,
        parsed.chapter,
        parsed.verse,
        { versions: ['KJV', 'ESV'] }
      );
    })
  );

  return {
    topic: topic,
    summary: topicData.summary,
    verses: verses,
    scholarly: topicData.scholarly,
    archaeological: topicData.archaeological
  };
}
```

---

## 🔗 Integration with RAG System

### Architecture Pattern

```
User Query
    ↓
Your App Logic
    ↓
    ├─→ Bible API (for verse text, original languages)
    │   └─→ Returns: Verse text, Hebrew/Greek, Strong's
    │
    └─→ RAG System (for context, archaeology, themes)
        └─→ Returns: Historical/cultural/theological context

Combined Response
    ↓
User receives rich, contextual answer
```

### Integration Code Pattern

```javascript
class BiblicalAnalyzer {
  constructor() {
    this.bibleAPI = new BibleAPIClient();
    this.ragSystem = new YourRAGSystem(); // Your existing RAG
  }

  async analyze(query) {
    // Parse query to extract book, chapter, verse
    const parsed = this.parseQuery(query);

    // Fetch from both systems in parallel
    const [verseData, ragContext] = await Promise.all([
      this.bibleAPI.getVerse(parsed.book, parsed.chapter, parsed.verse, {
        versions: ['KJV', 'ESV']
      }),
      this.ragSystem.getContext(parsed.book, parsed.chapter)
    ]);

    // Optionally get original language
    let original = null;
    if (parsed.includeOriginalLanguage) {
      original = await this.bibleAPI.getOriginalLanguage(
        parsed.book, parsed.chapter, parsed.verse
      );
    }

    // Combine and return
    return {
      query: query,
      scripture: verseData,
      originalLanguage: original,
      context: ragContext,
      answer: this.generateAnswer(verseData, ragContext, original)
    };
  }

  generateAnswer(verse, context, original) {
    // Your logic to combine data into coherent response
    return `
      The verse ${verse.reference} in context:

      Text: ${verse.versions.ESV}

      Historical Context: ${context.historical}

      Archaeological Evidence: ${context.archaeological}

      ${original ? `Original Language: ${original.transliteration}` : ''}
    `;
  }
}
```

---

## ⚡ Performance Optimization

### Caching Strategy

The system includes automatic caching (1-hour TTL). Monitor cache performance:

```javascript
const bible = new BibleAPIClient();

// After some requests
const stats = bible.getCacheStats();
console.log(`Cache hit rate: ${(stats.hits / (stats.hits + stats.misses) * 100).toFixed(1)}%`);

// Clear cache if needed
bible.clearCache();
```

### Batch Requests

When fetching multiple verses, use Promise.all:

```javascript
// ❌ Slow (sequential)
const verse1 = await bible.getVerse('John', 3, 16, { versions: ['KJV'] });
const verse2 = await bible.getVerse('Romans', 8, 28, { versions: ['KJV'] });
const verse3 = await bible.getVerse('Philippians', 4, 13, { versions: ['KJV'] });

// ✅ Fast (parallel)
const [verse1, verse2, verse3] = await Promise.all([
  bible.getVerse('John', 3, 16, { versions: ['KJV'] }),
  bible.getVerse('Romans', 8, 28, { versions: ['KJV'] }),
  bible.getVerse('Philippians', 4, 13, { versions: ['KJV'] })
]);
```

### Rate Limiting

Rate limiters are automatic. Monitor status:

```javascript
// Check rate limit status
const status = bible.rateLimiters['esv'].getStatus();
console.log(`ESV API: ${status.remaining} requests remaining`);
console.log(`Reset in: ${status.resetIn}ms`);
```

---

## 🛡️ Error Handling

### Graceful Degradation

```javascript
async function getVerseWithFallback(book, chapter, verse) {
  const bible = new BibleAPIClient();

  try {
    // Try preferred translation
    return await bible.getVerse(book, chapter, verse, { versions: ['ESV'] });
  } catch (error) {
    console.warn('ESV failed, falling back to KJV');

    try {
      // Fallback to free API
      return await bible.getVerse(book, chapter, verse, { versions: ['KJV'] });
    } catch (error) {
      // Final fallback
      return {
        error: 'Unable to fetch verse',
        reference: `${book} ${chapter}:${verse}`
      };
    }
  }
}
```

### Validation

```javascript
import { validateReference } from './bible-api-integration/utils/validation.js';

function getUserInput(book, chapter, verse) {
  // Validate before API call
  const validation = validateReference(book, chapter, verse);

  if (!validation.valid) {
    return {
      error: validation.error
    };
  }

  // Proceed with valid reference
  return bible.getVerse(book, chapter, verse);
}
```

---

## 🚀 Production Deployment

### Environment Setup

```bash
# Production .env
ESV_API_KEY=prod_key_here
BLUE_LETTER_BIBLE_API_KEY=prod_key_here
API_BIBLE_KEY=prod_key_here

# Cache configuration
CACHE_TTL=7200  # 2 hours for production

# Rate limits (adjust based on your API tiers)
ESV_RATE_LIMIT=80
BLB_RATE_LIMIT=80
```

### Monitoring

```javascript
// Log API usage
const bible = new BibleAPIClient();

setInterval(() => {
  const stats = bible.getCacheStats();
  const esvStatus = bible.rateLimiters['esv'].getStatus();

  console.log('API Stats:', {
    cacheHitRate: (stats.hits / (stats.hits + stats.misses) * 100).toFixed(1),
    esvRemaining: esvStatus.remaining,
    timestamp: new Date().toISOString()
  });
}, 60000); // Every minute
```

### Error Tracking

```javascript
async function getVerseWithTracking(book, chapter, verse) {
  try {
    return await bible.getVerse(book, chapter, verse);
  } catch (error) {
    // Log to your error tracking service
    console.error('Bible API error:', {
      error: error.message,
      book, chapter, verse,
      timestamp: new Date().toISOString()
    });

    // Notify if critical
    if (error.message.includes('authentication')) {
      notifyAdmin('Bible API authentication failure');
    }

    throw error;
  }
}
```

---

## 📚 Complete Integration Example

Here's a complete example combining everything:

```javascript
import { BibleAPIClient } from './bible-api-integration/BibleAPIClient.js';
import { getRAGContext } from './your-rag-system.js';

class BiblicalContextualAnalyzer {
  constructor() {
    this.bible = new BibleAPIClient({
      cacheTTL: 7200 // 2 hours
    });
  }

  async analyzePassage(book, chapter, startVerse, endVerse, options = {}) {
    try {
      // Parallel fetch: verse text, original language, context
      const [passage, original, context] = await Promise.all([
        this.bible.getPassage(
          book, chapter, startVerse, chapter, endVerse,
          options.version || 'ESV'
        ),
        options.includeOriginal
          ? this.bible.getOriginalLanguage(book, chapter, startVerse)
          : Promise.resolve(null),
        getRAGContext(book, chapter)
      ]);

      // Get cross-references if requested
      let crossRefs = [];
      if (options.includeCrossRefs) {
        crossRefs = await this.bible.getCrossReferences(book, chapter, startVerse);
      }

      return {
        passage: {
          reference: `${book} ${chapter}:${startVerse}-${endVerse}`,
          text: passage.text,
          version: options.version || 'ESV'
        },
        originalLanguage: original ? {
          text: original.text,
          transliteration: original.transliteration,
          strongs: original.strongs
        } : null,
        context: {
          period: context.period,
          historical: context.historical,
          archaeological: context.archaeological,
          cultural: context.cultural,
          theological: context.theological
        },
        crossReferences: crossRefs,
        meta: {
          cached: false, // Check if response was cached
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(`Failed to analyze ${book} ${chapter}: ${error.message}`);
    }
  }
}

// Usage
const analyzer = new BiblicalContextualAnalyzer();

const analysis = await analyzer.analyzePassage('Genesis', 1, 1, 3, {
  version: 'ESV',
  includeOriginal: true,
  includeCrossRefs: true
});

console.log(analysis);
```

---

## ✅ Checklist for Integration

- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Get API keys (at minimum: Blue Letter Bible + ESV)
- [ ] Test basic functionality: `node examples/basic-usage.js`
- [ ] Test original languages: `node examples/original-languages.js`
- [ ] Test RAG integration: `node examples/rag-integration.js`
- [ ] Integrate into your app code
- [ ] Add error handling and fallbacks
- [ ] Configure caching for your use case
- [ ] Set up monitoring and logging
- [ ] Test in production environment
- [ ] Document your specific use cases

---

## 🎯 Next Steps

1. **Start with basic verse retrieval** - Get familiar with the API
2. **Add original language support** - Get Blue Letter Bible key
3. **Integrate with your RAG system** - Combine context + text
4. **Build user-facing features** - Implement your use cases
5. **Optimize for production** - Caching, error handling, monitoring

The system is ready to use! All API access is built into your code and ready for contextual responses and study features.
