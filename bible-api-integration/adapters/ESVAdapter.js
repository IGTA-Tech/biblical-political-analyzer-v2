/**
 * ESV API Adapter
 * English Standard Version - High quality modern translation
 * Free tier: 5,000 requests/day
 * Get key: https://api.esv.org/account/create/
 */

import axios from 'axios';

export class ESVAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.esv.org/v3/passage';
  }

  /**
   * Get a single verse
   */
  async getVerse(book, chapter, verse, version = 'ESV') {
    const reference = `${book} ${chapter}:${verse}`;
    return await this.fetchPassage(reference);
  }

  /**
   * Get entire chapter
   */
  async getChapter(book, chapter, version = 'ESV') {
    const reference = `${book} ${chapter}`;
    return await this.fetchPassage(reference);
  }

  /**
   * Get passage (multiple verses)
   */
  async getPassage(book, startChapter, startVerse, endChapter, endVerse, version = 'ESV') {
    let reference;
    if (startChapter === endChapter) {
      reference = `${book} ${startChapter}:${startVerse}-${endVerse}`;
    } else {
      reference = `${book} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`;
    }
    return await this.fetchPassage(reference);
  }

  /**
   * Search for passages
   */
  async search(query, version = 'ESV', options = {}) {
    const url = `${this.baseURL}/search/`;

    try {
      const response = await axios.get(url, {
        params: {
          q: query,
          page: options.page || 1,
          'page-size': options.pageSize || 20
        },
        headers: {
          'Authorization': `Token ${this.apiKey}`
        },
        timeout: 15000
      });

      return {
        results: response.data.results.map(result => ({
          reference: result.reference,
          text: result.content
        })),
        total: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      throw new Error(`ESV API search error: ${error.message}`);
    }
  }

  /**
   * Helper to fetch passage text
   */
  async fetchPassage(reference) {
    const url = `${this.baseURL}/text/`;

    try {
      const response = await axios.get(url, {
        params: {
          q: reference,
          'include-passage-references': false,
          'include-verse-numbers': false,
          'include-first-verse-numbers': false,
          'include-footnotes': false,
          'include-footnote-body': false,
          'include-headings': false,
          'include-short-copyright': false,
          'include-copyright': false
        },
        headers: {
          'Authorization': `Token ${this.apiKey}`
        },
        timeout: 10000
      });

      // ESV API returns array of passages
      return response.data.passages[0].trim();
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('ESV API authentication failed. Check your API key.');
      }
      throw new Error(`ESV API error: ${error.message}`);
    }
  }

  /**
   * Get audio Bible URL
   */
  async getAudioURL(book, chapter) {
    const reference = `${book} ${chapter}`;
    const url = `${this.baseURL}/audio/`;

    try {
      const response = await axios.get(url, {
        params: { q: reference },
        headers: {
          'Authorization': `Token ${this.apiKey}`
        },
        timeout: 10000
      });

      return response.data.audio_url;
    } catch (error) {
      throw new Error(`ESV API audio error: ${error.message}`);
    }
  }
}

export default ESVAdapter;
