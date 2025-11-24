/**
 * Bible API Adapter (bible-api.com)
 * Free, no API key required
 * Supports: KJV, WEB, Clementine, Almeida
 */

import axios from 'axios';

export class BibleAPIAdapter {
  constructor() {
    this.baseURL = 'https://bible-api.com';
  }

  /**
   * Get a single verse
   */
  async getVerse(book, chapter, verse, version = 'kjv') {
    const reference = `${book}+${chapter}:${verse}`;
    const url = `${this.baseURL}/${reference}?translation=${version.toLowerCase()}`;

    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data.text.trim();
    } catch (error) {
      throw new Error(`Bible API error: ${error.message}`);
    }
  }

  /**
   * Get entire chapter
   */
  async getChapter(book, chapter, version = 'kjv') {
    const reference = `${book}+${chapter}`;
    const url = `${this.baseURL}/${reference}?translation=${version.toLowerCase()}`;

    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data.text.trim();
    } catch (error) {
      throw new Error(`Bible API error: ${error.message}`);
    }
  }

  /**
   * Get passage (multiple verses)
   */
  async getPassage(book, startChapter, startVerse, endChapter, endVerse, version = 'kjv') {
    let reference;
    if (startChapter === endChapter) {
      reference = `${book}+${startChapter}:${startVerse}-${endVerse}`;
    } else {
      reference = `${book}+${startChapter}:${startVerse}-${endChapter}:${endVerse}`;
    }

    const url = `${this.baseURL}/${reference}?translation=${version.toLowerCase()}`;

    try {
      const response = await axios.get(url, { timeout: 15000 });
      return response.data.text.trim();
    } catch (error) {
      throw new Error(`Bible API error: ${error.message}`);
    }
  }

  /**
   * Search not supported by this API
   */
  async search(query, version, options) {
    throw new Error('Search not supported by Bible API. Use ESV or API.Bible instead.');
  }
}

export default BibleAPIAdapter;
