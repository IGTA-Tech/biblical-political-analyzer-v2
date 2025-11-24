/**
 * Bible Reference Validation Utilities
 * Validate book names, chapter numbers, verse numbers
 */

import { getBookNumber, normalizeBookName } from './bookNames.js';

/**
 * Chapter counts for each book of the Bible
 */
const chapterCounts = {
  // Old Testament
  'Genesis': 50,
  'Exodus': 40,
  'Leviticus': 27,
  'Numbers': 36,
  'Deuteronomy': 34,
  'Joshua': 24,
  'Judges': 21,
  'Ruth': 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Kings': 22,
  '2 Kings': 25,
  '1 Chronicles': 29,
  '2 Chronicles': 36,
  'Ezra': 10,
  'Nehemiah': 13,
  'Esther': 10,
  'Job': 42,
  'Psalms': 150,
  'Proverbs': 31,
  'Ecclesiastes': 12,
  'Song of Solomon': 8,
  'Isaiah': 66,
  'Jeremiah': 52,
  'Lamentations': 5,
  'Ezekiel': 48,
  'Daniel': 12,
  'Hosea': 14,
  'Joel': 3,
  'Amos': 9,
  'Obadiah': 1,
  'Jonah': 4,
  'Micah': 7,
  'Nahum': 3,
  'Habakkuk': 3,
  'Zephaniah': 3,
  'Haggai': 2,
  'Zechariah': 14,
  'Malachi': 4,
  // New Testament
  'Matthew': 28,
  'Mark': 16,
  'Luke': 24,
  'John': 21,
  'Acts': 28,
  'Romans': 16,
  '1 Corinthians': 16,
  '2 Corinthians': 13,
  'Galatians': 6,
  'Ephesians': 6,
  'Philippians': 4,
  'Colossians': 4,
  '1 Thessalonians': 5,
  '2 Thessalonians': 3,
  '1 Timothy': 6,
  '2 Timothy': 4,
  'Titus': 3,
  'Philemon': 1,
  'Hebrews': 13,
  'James': 5,
  '1 Peter': 5,
  '2 Peter': 3,
  '1 John': 5,
  '2 John': 1,
  '3 John': 1,
  'Jude': 1,
  'Revelation': 22
};

/**
 * Verse counts for each chapter (selected chapters for validation)
 * Format: { 'BookName': { chapter: verseCount } }
 */
const verseCounts = {
  'Genesis': {
    1: 31, 2: 25, 3: 24, 4: 26, 5: 32, 6: 22, 7: 24, 8: 22, 9: 29, 10: 32,
    11: 32, 12: 20, 13: 18, 14: 24, 15: 21, 16: 16, 17: 27, 18: 33, 19: 38, 20: 18,
    21: 34, 22: 24, 23: 20, 24: 67, 25: 34, 26: 35, 27: 46, 28: 22, 29: 35, 30: 43,
    31: 55, 32: 32, 33: 20, 34: 31, 35: 29, 36: 43, 37: 36, 38: 30, 39: 23, 40: 23,
    41: 57, 42: 38, 43: 34, 44: 34, 45: 28, 46: 34, 47: 31, 48: 22, 49: 33, 50: 26
  },
  'Exodus': {
    1: 22, 2: 25, 3: 22, 4: 31, 5: 23, 6: 30, 7: 25, 8: 32, 9: 35, 10: 29,
    11: 10, 12: 51, 13: 22, 14: 31, 15: 27, 16: 36, 17: 16, 18: 27, 19: 25, 20: 26
  },
  'Psalms': {
    1: 6, 23: 6, 51: 19, 119: 176, 150: 6
  },
  'Matthew': {
    1: 25, 2: 23, 3: 17, 4: 25, 5: 48, 6: 34, 7: 29, 8: 34, 9: 38, 10: 42,
    11: 30, 12: 50, 13: 58, 14: 36, 15: 39, 16: 28, 17: 27, 18: 35, 19: 30, 20: 34,
    21: 46, 22: 46, 23: 39, 24: 51, 25: 46, 26: 75, 27: 66, 28: 20
  },
  'John': {
    1: 51, 2: 25, 3: 36, 4: 54, 5: 47, 6: 71, 7: 53, 8: 59, 9: 41, 10: 42,
    11: 57, 12: 50, 13: 38, 14: 31, 15: 27, 16: 33, 17: 26, 18: 40, 19: 42, 20: 31, 21: 25
  },
  'Romans': {
    1: 32, 2: 29, 3: 31, 4: 25, 5: 21, 6: 23, 7: 25, 8: 39, 9: 33, 10: 21,
    11: 36, 12: 21, 13: 14, 14: 23, 15: 33, 16: 27
  },
  'Revelation': {
    1: 20, 2: 29, 3: 22, 4: 11, 5: 14, 6: 17, 7: 17, 8: 13, 9: 21, 10: 11,
    11: 19, 12: 17, 13: 18, 14: 20, 15: 8, 16: 21, 17: 18, 18: 24, 19: 21, 20: 15,
    21: 27, 22: 21
  }
};

/**
 * Validate a Bible reference
 * @param {string} book - Book name
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number (optional)
 * @returns {object} - { valid: boolean, error: string }
 */
export function validateReference(book, chapter, verse = null) {
  // Validate book
  const normalizedBook = normalizeBookName(book);
  const bookNum = getBookNumber(normalizedBook);

  if (bookNum === 0) {
    return {
      valid: false,
      error: `Invalid book name: "${book}". Please use a valid Bible book name.`
    };
  }

  // Validate chapter
  const maxChapter = chapterCounts[normalizedBook];
  if (!maxChapter) {
    return {
      valid: false,
      error: `Could not find chapter count for book: "${normalizedBook}"`
    };
  }

  if (chapter < 1 || chapter > maxChapter) {
    return {
      valid: false,
      error: `Invalid chapter ${chapter} for ${normalizedBook}. Valid range: 1-${maxChapter}`
    };
  }

  // If verse is provided, validate it
  if (verse !== null) {
    // Check if we have verse count data for this chapter
    const bookVerses = verseCounts[normalizedBook];
    if (bookVerses && bookVerses[chapter]) {
      const maxVerse = bookVerses[chapter];
      if (verse < 1 || verse > maxVerse) {
        return {
          valid: false,
          error: `Invalid verse ${verse} for ${normalizedBook} ${chapter}. Valid range: 1-${maxVerse}`
        };
      }
    } else {
      // No verse data - do basic validation only
      if (verse < 1 || verse > 200) { // Reasonable upper limit
        return {
          valid: false,
          error: `Invalid verse number: ${verse}. Verses must be positive and typically under 200.`
        };
      }
    }
  }

  return {
    valid: true,
    error: null
  };
}

/**
 * Validate a passage range
 * @param {string} book - Book name
 * @param {number} startChapter - Start chapter
 * @param {number} startVerse - Start verse
 * @param {number} endChapter - End chapter
 * @param {number} endVerse - End verse
 * @returns {object} - { valid: boolean, error: string }
 */
export function validatePassage(book, startChapter, startVerse, endChapter, endVerse) {
  // Validate start reference
  const startValidation = validateReference(book, startChapter, startVerse);
  if (!startValidation.valid) {
    return startValidation;
  }

  // Validate end reference
  const endValidation = validateReference(book, endChapter, endVerse);
  if (!endValidation.valid) {
    return endValidation;
  }

  // Check that end comes after start
  if (endChapter < startChapter) {
    return {
      valid: false,
      error: `End chapter ${endChapter} comes before start chapter ${startChapter}`
    };
  }

  if (endChapter === startChapter && endVerse < startVerse) {
    return {
      valid: false,
      error: `End verse ${endVerse} comes before start verse ${startVerse} in chapter ${startChapter}`
    };
  }

  return {
    valid: true,
    error: null
  };
}

/**
 * Parse a Bible reference string
 * Examples: "John 3:16", "Genesis 1:1-3", "Romans 8:28-39", "Psalm 23"
 * @param {string} referenceString - Reference in string format
 * @returns {object} - Parsed reference or error
 */
export function parseReference(referenceString) {
  if (!referenceString || typeof referenceString !== 'string') {
    return { error: 'Invalid reference string' };
  }

  // Clean the string
  const cleaned = referenceString.trim();

  // Pattern: "Book Chapter:Verse" or "Book Chapter:Verse-Verse" or "Book Chapter"
  const pattern = /^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/;
  const match = cleaned.match(pattern);

  if (!match) {
    return { error: `Could not parse reference: "${referenceString}"` };
  }

  const book = match[1];
  const chapter = parseInt(match[2]);
  const startVerse = match[3] ? parseInt(match[3]) : null;
  const endVerse = match[4] ? parseInt(match[4]) : null;

  // Validate
  if (startVerse && endVerse) {
    // Range within same chapter
    const validation = validatePassage(book, chapter, startVerse, chapter, endVerse);
    if (!validation.valid) {
      return { error: validation.error };
    }

    return {
      book: normalizeBookName(book),
      startChapter: chapter,
      startVerse: startVerse,
      endChapter: chapter,
      endVerse: endVerse,
      isPassage: true
    };
  } else if (startVerse) {
    // Single verse
    const validation = validateReference(book, chapter, startVerse);
    if (!validation.valid) {
      return { error: validation.error };
    }

    return {
      book: normalizeBookName(book),
      chapter: chapter,
      verse: startVerse,
      isPassage: false
    };
  } else {
    // Entire chapter
    const validation = validateReference(book, chapter);
    if (!validation.valid) {
      return { error: validation.error };
    }

    return {
      book: normalizeBookName(book),
      chapter: chapter,
      verse: null,
      isChapter: true
    };
  }
}

/**
 * Get chapter count for a book
 * @param {string} book - Book name
 * @returns {number} - Number of chapters or 0 if invalid
 */
export function getChapterCount(book) {
  const normalizedBook = normalizeBookName(book);
  return chapterCounts[normalizedBook] || 0;
}

export default {
  validateReference,
  validatePassage,
  parseReference,
  getChapterCount
};
