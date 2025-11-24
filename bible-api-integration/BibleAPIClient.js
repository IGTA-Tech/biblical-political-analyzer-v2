/**
 * Bible API Client - Main Interface
 * Provides unified access to multiple Bible APIs with caching and rate limiting
 */

import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import { BibleAPIAdapter } from './adapters/BibleAPIAdapter.js';
import { ESVAdapter } from './adapters/ESVAdapter.js';
import { BluLetterBibleAdapter } from './adapters/BluLetterBibleAdapter.js';
import { APIBibleAdapter } from './adapters/APIBibleAdapter.js';
import { BibleBrainAdapter } from './adapters/BibleBrainAdapter.js';
import { bookNames, getBookNumber, normalizeBookName } from './utils/bookNames.js';
import { validateReference } from './utils/validation.js';
import { RateLimiter } from './utils/rateLimiter.js';

dotenv.config();

export class BibleAPIClient {
  constructor(options = {}) {
    // Cache configuration
    this.cache = new NodeCache({
      stdTTL: options.cacheTTL || 3600, // 1 hour default
      checkperiod: 600
    });

    // Rate limiters
    this.rateLimiters = {
      'bible-api': new RateLimiter({ maxRequests: 100, perSeconds: 60 }),
      'esv': new RateLimiter({ maxRequests: 80, perSeconds: 60 }),
      'blb': new RateLimiter({ maxRequests: 80, perSeconds: 60 }),
      'api-bible': new RateLimiter({ maxRequests: 8, perSeconds: 60 }),
      'bible-brain': new RateLimiter({ maxRequests: 50, perSeconds: 60 })
    };

    // Initialize adapters
    this.adapters = {
      'bible-api': new BibleAPIAdapter(),
      'esv': new ESVAdapter(process.env.ESV_API_KEY),
      'blb': new BluLetterBibleAdapter(process.env.BLUE_LETTER_BIBLE_API_KEY),
      'api-bible': new APIBibleAdapter(process.env.API_BIBLE_KEY),
      'bible-brain': new BibleBrainAdapter(process.env.BIBLE_BRAIN_KEY)
    };

    // Version to adapter mapping
    this.versionMap = {
      'KJV': 'bible-api',
      'WEB': 'bible-api',
      'ESV': 'esv',
      'NASB': 'blb',
      'NKJV': 'blb',
      'NIV': 'api-bible',
      'NLT': 'api-bible',
      'MSG': 'api-bible'
    };
  }

  /**
   * Get a single verse in one or multiple versions
   * @param {string} book - Book name (e.g., "John", "Genesis")
   * @param {number} chapter - Chapter number
   * @param {number} verse - Verse number
   * @param {object} options - { versions: ['KJV', 'ESV'], includeContext: true }
   */
  async getVerse(book, chapter, verse, options = {}) {
    const versions = options.versions || ['KJV'];
    const normalizedBook = normalizeBookName(book);

    // Validate reference
    const validation = validateReference(normalizedBook, chapter, verse);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check cache
    const cacheKey = `verse:${normalizedBook}:${chapter}:${verse}:${versions.join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Fetch from APIs
    const results = {};
    for (const version of versions) {
      const adapter = this.getAdapterForVersion(version);
      await this.rateLimiters[adapter].waitForSlot();

      try {
        const text = await this.adapters[adapter].getVerse(normalizedBook, chapter, verse, version);
        results[version] = text;
      } catch (error) {
        console.error(`Error fetching ${version}:`, error.message);
        results[version] = { error: error.message };
      }
    }

    const response = {
      reference: `${normalizedBook} ${chapter}:${verse}`,
      versions: results
    };

    // Cache the result
    this.cache.set(cacheKey, response);

    return response;
  }

  /**
   * Get an entire chapter in specified version
   */
  async getChapter(book, chapter, version = 'KJV') {
    const normalizedBook = normalizeBookName(book);

    // Check cache
    const cacheKey = `chapter:${normalizedBook}:${chapter}:${version}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const adapter = this.getAdapterForVersion(version);
    await this.rateLimiters[adapter].waitForSlot();

    const text = await this.adapters[adapter].getChapter(normalizedBook, chapter, version);

    const response = {
      reference: `${normalizedBook} ${chapter}`,
      version: version,
      text: text
    };

    this.cache.set(cacheKey, response);
    return response;
  }

  /**
   * Get passage (multiple verses or chapters)
   */
  async getPassage(book, startChapter, startVerse, endChapter, endVerse, version = 'KJV') {
    const normalizedBook = normalizeBookName(book);
    const adapter = this.getAdapterForVersion(version);

    await this.rateLimiters[adapter].waitForSlot();

    const text = await this.adapters[adapter].getPassage(
      normalizedBook, startChapter, startVerse, endChapter, endVerse, version
    );

    return {
      reference: `${normalizedBook} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`,
      version: version,
      text: text
    };
  }

  /**
   * Get original language text (Hebrew for OT, Greek for NT)
   */
  async getOriginalLanguage(book, chapter, verse) {
    const normalizedBook = normalizeBookName(book);
    const bookNum = getBookNumber(normalizedBook);

    // Determine if OT or NT
    const language = bookNum <= 39 ? 'Hebrew' : 'Greek';

    // Use Blue Letter Bible for original languages
    await this.rateLimiters['blb'].waitForSlot();

    const result = await this.adapters['blb'].getOriginalLanguage(
      normalizedBook, chapter, verse, language
    );

    return {
      reference: `${normalizedBook} ${chapter}:${verse}`,
      language: language,
      text: result.text,
      transliteration: result.transliteration,
      strongs: result.strongs,
      morphology: result.morphology
    };
  }

  /**
   * Get Strong's number definition
   */
  async getStrongsDefinition(strongsNumber) {
    await this.rateLimiters['blb'].waitForSlot();
    return await this.adapters['blb'].getStrongsDefinition(strongsNumber);
  }

  /**
   * Search for passages containing keywords
   */
  async search(query, version = 'KJV', options = {}) {
    const adapter = this.getAdapterForVersion(version);
    await this.rateLimiters[adapter].waitForSlot();

    return await this.adapters[adapter].search(query, version, options);
  }

  /**
   * Get cross-references for a verse
   */
  async getCrossReferences(book, chapter, verse) {
    const normalizedBook = normalizeBookName(book);
    await this.rateLimiters['blb'].waitForSlot();

    return await this.adapters['blb'].getCrossReferences(normalizedBook, chapter, verse);
  }

  /**
   * Compare verse across multiple translations
   */
  async compareTranslations(book, chapter, verse, versions = ['KJV', 'ESV', 'NASB', 'NIV']) {
    return await this.getVerse(book, chapter, verse, { versions });
  }

  /**
   * Helper: Get appropriate adapter for version
   */
  getAdapterForVersion(version) {
    return this.versionMap[version] || 'bible-api';
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.flushAll();
  }
}

export default BibleAPIClient;
