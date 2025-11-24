/**
 * Bible Brain / Digital Bible Platform (DBP) Adapter
 * 400+ languages, Audio Bibles, Text, Video
 * Generous free tier
 * Get key: https://dbt.io/api-key
 */

import axios from 'axios';

export class BibleBrainAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://4.dbt.io/api';
  }

  /**
   * Get a single verse
   */
  async getVerse(book, chapter, verse, version = 'KJV') {
    const filesetId = this.getFilesetId(version);
    const bookId = this.getBookId(book);

    const url = `${this.baseURL}/bibles/filesets/${filesetId}/${bookId}/${chapter}`;

    try {
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          v: 4
        },
        timeout: 10000
      });

      // Find specific verse
      const verseData = response.data.data.find(v => v.verse_start === verse);
      if (!verseData) {
        throw new Error(`Verse not found: ${book} ${chapter}:${verse}`);
      }

      return verseData.verse_text;
    } catch (error) {
      throw new Error(`Bible Brain verse error: ${error.message}`);
    }
  }

  /**
   * Get entire chapter
   */
  async getChapter(book, chapter, version = 'KJV') {
    const filesetId = this.getFilesetId(version);
    const bookId = this.getBookId(book);

    const url = `${this.baseURL}/bibles/filesets/${filesetId}/${bookId}/${chapter}`;

    try {
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          v: 4
        },
        timeout: 15000
      });

      // Combine all verses
      return response.data.data
        .sort((a, b) => a.verse_start - b.verse_start)
        .map(v => v.verse_text)
        .join(' ');
    } catch (error) {
      throw new Error(`Bible Brain chapter error: ${error.message}`);
    }
  }

  /**
   * Get passage (multiple verses)
   */
  async getPassage(book, startChapter, startVerse, endChapter, endVerse, version = 'KJV') {
    const filesetId = this.getFilesetId(version);
    const bookId = this.getBookId(book);

    try {
      let allVerses = [];

      // If single chapter
      if (startChapter === endChapter) {
        const url = `${this.baseURL}/bibles/filesets/${filesetId}/${bookId}/${startChapter}`;
        const response = await axios.get(url, {
          params: {
            key: this.apiKey,
            v: 4
          },
          timeout: 15000
        });

        allVerses = response.data.data.filter(
          v => v.verse_start >= startVerse && v.verse_start <= endVerse
        );
      } else {
        // Multiple chapters - fetch each
        for (let ch = startChapter; ch <= endChapter; ch++) {
          const url = `${this.baseURL}/bibles/filesets/${filesetId}/${bookId}/${ch}`;
          const response = await axios.get(url, {
            params: {
              key: this.apiKey,
              v: 4
            },
            timeout: 15000
          });

          const verses = response.data.data.filter(v => {
            if (ch === startChapter) return v.verse_start >= startVerse;
            if (ch === endChapter) return v.verse_start <= endVerse;
            return true;
          });

          allVerses = allVerses.concat(verses);
        }
      }

      return allVerses.map(v => v.verse_text).join(' ');
    } catch (error) {
      throw new Error(`Bible Brain passage error: ${error.message}`);
    }
  }

  /**
   * Get audio Bible URL
   */
  async getAudioURL(book, chapter, version = 'KJV') {
    const filesetId = this.getFilesetId(version, 'audio');
    const bookId = this.getBookId(book);

    const url = `${this.baseURL}/bibles/filesets/${filesetId}/${bookId}/${chapter}`;

    try {
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          v: 4
        },
        timeout: 10000
      });

      // Return first audio file URL
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].path;
      }

      throw new Error('No audio available for this chapter');
    } catch (error) {
      throw new Error(`Bible Brain audio error: ${error.message}`);
    }
  }

  /**
   * Search not directly supported - use text retrieval instead
   */
  async search(query, version, options) {
    throw new Error('Search not supported by Bible Brain. Use text retrieval methods instead.');
  }

  /**
   * Get available Bible versions
   */
  async getAvailableVersions(language = 'eng') {
    const url = `${this.baseURL}/bibles`;

    try {
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          language_code: language,
          v: 4
        },
        timeout: 10000
      });

      return response.data.data.map(bible => ({
        id: bible.id,
        name: bible.name,
        abbreviation: bible.abbr,
        language: bible.language,
        hasText: bible.filesets.some(f => f.type === 'text_plain'),
        hasAudio: bible.filesets.some(f => f.type === 'audio')
      }));
    } catch (error) {
      throw new Error(`Bible Brain versions error: ${error.message}`);
    }
  }

  /**
   * Helper: Get fileset ID for version
   */
  getFilesetId(version, type = 'text') {
    const filesets = {
      'KJV': {
        text: 'ENGESVN2ET',
        audio: 'ENGESVN2DA'
      },
      'ESV': {
        text: 'ENGESVN2ET',
        audio: 'ENGESVN2DA'
      },
      'NIV': {
        text: 'ENGNIVN2ET',
        audio: 'ENGNIVN2DA'
      }
    };

    return filesets[version]?.[type] || filesets['KJV'][type];
  }

  /**
   * Helper: Convert book name to Bible Brain book ID
   */
  getBookId(bookName) {
    const bookIds = {
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

    return bookIds[bookName] || bookName.substring(0, 3).toUpperCase();
  }
}

export default BibleBrainAdapter;
