/**
 * Blue Letter Bible API Adapter
 * Original Languages: Hebrew (OT), Greek (NT), Aramaic
 * Strong's Concordance, Lexicon, Interlinear
 * Get key: https://www.blueletterbible.org/api/register
 */

import axios from 'axios';

export class BluLetterBibleAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.blueletterbible.org/v1';
  }

  /**
   * Get verse in English translation
   */
  async getVerse(book, chapter, verse, version = 'NASB') {
    const reference = `${book} ${chapter}:${verse}`;
    return await this.fetchPassage(reference, version);
  }

  /**
   * Get entire chapter
   */
  async getChapter(book, chapter, version = 'NASB') {
    const reference = `${book} ${chapter}`;
    return await this.fetchPassage(reference, version);
  }

  /**
   * Get passage
   */
  async getPassage(book, startChapter, startVerse, endChapter, endVerse, version = 'NASB') {
    let reference;
    if (startChapter === endChapter) {
      reference = `${book} ${startChapter}:${startVerse}-${endVerse}`;
    } else {
      reference = `${book} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`;
    }
    return await this.fetchPassage(reference, version);
  }

  /**
   * Get original language text (Hebrew/Greek)
   */
  async getOriginalLanguage(book, chapter, verse, language = 'Hebrew') {
    const url = `${this.baseURL}/BibleTaggingService/BibleTagging`;

    // Determine which text version to use
    const textVersion = language === 'Hebrew' ? 'WLC' : 'LXX'; // Westminster Leningrad Codex or Septuagint

    try {
      const response = await axios.get(url, {
        params: {
          passage: `${book} ${chapter}:${verse}`,
          version: textVersion
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 15000
      });

      const data = response.data;

      // Parse BLB tagged response
      return {
        text: this.extractOriginalText(data),
        transliteration: this.extractTransliteration(data),
        strongs: this.extractStrongsNumbers(data),
        morphology: this.extractMorphology(data),
        interlinear: this.extractInterlinear(data)
      };
    } catch (error) {
      throw new Error(`Blue Letter Bible original language error: ${error.message}`);
    }
  }

  /**
   * Get Strong's number definition
   */
  async getStrongsDefinition(strongsNumber) {
    const url = `${this.baseURL}/Lexicons/GetLexiconEntry`;

    // Determine if Hebrew (H) or Greek (G) Strong's number
    const lexicon = strongsNumber.startsWith('H') ? 'HebrewStrongs' : 'GreekStrongs';
    const number = strongsNumber.substring(1); // Remove H or G prefix

    try {
      const response = await axios.get(url, {
        params: {
          lexiconName: lexicon,
          strongsNumber: number
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 10000
      });

      const entry = response.data;

      return {
        strongsNumber: strongsNumber,
        transliteration: entry.Transliteration,
        pronunciation: entry.Pronunciation,
        definition: entry.ShortDefinition,
        longDefinition: entry.Definition,
        derivation: entry.Derivation,
        kjvTranslations: entry.KJVTranslations
      };
    } catch (error) {
      throw new Error(`Blue Letter Bible Strong's error: ${error.message}`);
    }
  }

  /**
   * Get cross-references for a verse
   */
  async getCrossReferences(book, chapter, verse) {
    const url = `${this.baseURL}/CrossReferences/GetCrossReferences`;

    try {
      const response = await axios.get(url, {
        params: {
          passage: `${book} ${chapter}:${verse}`
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 10000
      });

      return response.data.map(ref => ({
        reference: ref.Reference,
        text: ref.Text
      }));
    } catch (error) {
      throw new Error(`Blue Letter Bible cross-references error: ${error.message}`);
    }
  }

  /**
   * Search for passages
   */
  async search(query, version = 'NASB', options = {}) {
    const url = `${this.baseURL}/Search/SearchForText`;

    try {
      const response = await axios.get(url, {
        params: {
          text: query,
          version: version,
          testament: options.testament || 'all', // 'ot', 'nt', 'all'
          page: options.page || 1
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 15000
      });

      return {
        results: response.data.Results.map(result => ({
          reference: result.Reference,
          text: result.Text
        })),
        total: response.data.TotalResults
      };
    } catch (error) {
      throw new Error(`Blue Letter Bible search error: ${error.message}`);
    }
  }

  /**
   * Helper: Fetch passage text
   */
  async fetchPassage(reference, version) {
    const url = `${this.baseURL}/BibleText/GetBibleTextByReference`;

    try {
      const response = await axios.get(url, {
        params: {
          passage: reference,
          version: version
        },
        headers: {
          'api-key': this.apiKey
        },
        timeout: 10000
      });

      // Combine all verses
      return response.data.map(v => v.Text).join(' ').trim();
    } catch (error) {
      throw new Error(`Blue Letter Bible error: ${error.message}`);
    }
  }

  /**
   * Helper: Extract original text from tagged response
   */
  extractOriginalText(data) {
    if (!data || !data.Words) return '';
    return data.Words.map(w => w.OriginalWord || '').join(' ');
  }

  /**
   * Helper: Extract transliteration
   */
  extractTransliteration(data) {
    if (!data || !data.Words) return '';
    return data.Words.map(w => w.Transliteration || '').join(' ');
  }

  /**
   * Helper: Extract Strong's numbers
   */
  extractStrongsNumbers(data) {
    if (!data || !data.Words) return [];
    return data.Words
      .filter(w => w.StrongsNumbers && w.StrongsNumbers.length > 0)
      .map(w => ({
        word: w.OriginalWord,
        strongs: w.StrongsNumbers
      }));
  }

  /**
   * Helper: Extract morphology codes
   */
  extractMorphology(data) {
    if (!data || !data.Words) return [];
    return data.Words
      .filter(w => w.Grammar)
      .map(w => ({
        word: w.OriginalWord,
        morphology: w.Grammar
      }));
  }

  /**
   * Helper: Extract word-by-word interlinear
   */
  extractInterlinear(data) {
    if (!data || !data.Words) return [];
    return data.Words.map(w => ({
      original: w.OriginalWord || '',
      transliteration: w.Transliteration || '',
      english: w.English || '',
      strongs: w.StrongsNumbers || [],
      morphology: w.Grammar || ''
    }));
  }
}

export default BluLetterBibleAdapter;
