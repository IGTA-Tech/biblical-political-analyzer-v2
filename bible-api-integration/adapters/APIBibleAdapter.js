/**
 * API.Bible Adapter
 * 1,800+ translations in 1,500+ languages
 * Free tier: 500 requests/day
 * Get key: https://scripture.api.bible/signup
 */

import axios from 'axios';

export class APIBibleAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.scripture.api.bible/v1';

    // Bible version IDs (must be fetched or hardcoded)
    this.versionIds = {
      'NIV': 'de4e12af7f28f599-02', // NIV
      'NLT': '01b29f4b342acc35-01', // NLT
      'MSG': '9879dbb7cfe39e4d-04', // The Message
      'NRSV': 'nrsv', // NRSV
      'CEB': 'ceb' // Common English Bible
    };
  }

  /**
   * Get a single verse
   */
  async getVerse(book, chapter, verse, version = 'NIV') {
    const bibleId = this.versionIds[version] || this.versionIds['NIV'];

    // First, get the verse ID by searching
    const verseId = await this.getVerseId(book, chapter, verse, bibleId);

    const url = `${this.baseURL}/bibles/${bibleId}/verses/${verseId}`;

    try {
      const response = await axios.get(url, {
        params: {
          'content-type': 'text',
          'include-notes': false,
          'include-titles': false,
          'include-chapter-numbers': false,
          'include-verse-numbers': false
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 10000
      });

      return this.cleanText(response.data.data.content);
    } catch (error) {
      throw new Error(`API.Bible verse error: ${error.message}`);
    }
  }

  /**
   * Get entire chapter
   */
  async getChapter(book, chapter, version = 'NIV') {
    const bibleId = this.versionIds[version] || this.versionIds['NIV'];

    // Get chapter ID
    const chapterId = await this.getChapterId(book, chapter, bibleId);

    const url = `${this.baseURL}/bibles/${bibleId}/chapters/${chapterId}`;

    try {
      const response = await axios.get(url, {
        params: {
          'content-type': 'text',
          'include-notes': false,
          'include-titles': false,
          'include-chapter-numbers': false,
          'include-verse-numbers': false
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 15000
      });

      return this.cleanText(response.data.data.content);
    } catch (error) {
      throw new Error(`API.Bible chapter error: ${error.message}`);
    }
  }

  /**
   * Get passage (multiple verses)
   */
  async getPassage(book, startChapter, startVerse, endChapter, endVerse, version = 'NIV') {
    const bibleId = this.versionIds[version] || this.versionIds['NIV'];

    // Build passage ID
    const passageId = await this.getPassageId(
      book, startChapter, startVerse, endChapter, endVerse, bibleId
    );

    const url = `${this.baseURL}/bibles/${bibleId}/passages/${passageId}`;

    try {
      const response = await axios.get(url, {
        params: {
          'content-type': 'text',
          'include-notes': false,
          'include-titles': false,
          'include-chapter-numbers': false,
          'include-verse-numbers': false
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 15000
      });

      return this.cleanText(response.data.data.content);
    } catch (error) {
      throw new Error(`API.Bible passage error: ${error.message}`);
    }
  }

  /**
   * Search for passages
   */
  async search(query, version = 'NIV', options = {}) {
    const bibleId = this.versionIds[version] || this.versionIds['NIV'];
    const url = `${this.baseURL}/bibles/${bibleId}/search`;

    try {
      const response = await axios.get(url, {
        params: {
          query: query,
          limit: options.limit || 20,
          offset: options.offset || 0
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 15000
      });

      return {
        results: response.data.data.verses.map(verse => ({
          reference: verse.reference,
          text: this.cleanText(verse.text)
        })),
        total: response.data.data.total
      };
    } catch (error) {
      throw new Error(`API.Bible search error: ${error.message}`);
    }
  }

  /**
   * Helper: Get verse ID for API.Bible
   */
  async getVerseId(book, chapter, verse, bibleId) {
    // API.Bible uses format like "JHN.3.16" for John 3:16
    const bookAbbrev = this.getBookAbbreviation(book);
    return `${bookAbbrev}.${chapter}.${verse}`;
  }

  /**
   * Helper: Get chapter ID
   */
  async getChapterId(book, chapter, bibleId) {
    const bookAbbrev = this.getBookAbbreviation(book);
    return `${bookAbbrev}.${chapter}`;
  }

  /**
   * Helper: Get passage ID
   */
  async getPassageId(book, startChapter, startVerse, endChapter, endVerse, bibleId) {
    const bookAbbrev = this.getBookAbbreviation(book);
    if (startChapter === endChapter) {
      return `${bookAbbrev}.${startChapter}.${startVerse}-${bookAbbrev}.${endChapter}.${endVerse}`;
    }
    return `${bookAbbrev}.${startChapter}.${startVerse}-${bookAbbrev}.${endChapter}.${endVerse}`;
  }

  /**
   * Helper: Get standard book abbreviation
   */
  getBookAbbreviation(bookName) {
    const abbreviations = {
      // Old Testament
      'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
      'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
      '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
      '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR', 'Nehemiah': 'NEH',
      'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO',
      'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
      'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
      'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA',
      'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB',
      'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
      // New Testament
      'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
      'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
      'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
      '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI',
      '2 Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB',
      'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN',
      '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
    };

    return abbreviations[bookName] || bookName.substring(0, 3).toUpperCase();
  }

  /**
   * Helper: Clean HTML/XML from text
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

export default APIBibleAdapter;
