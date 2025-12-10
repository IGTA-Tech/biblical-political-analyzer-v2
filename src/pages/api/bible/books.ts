/**
 * API Route: Get Bible books structure
 * Returns list of all 66 books organized by testament and category
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const BIBLE_BOOKS = {
  oldTestament: {
    torah: [
      { name: 'Genesis', chapters: 50, abbreviation: 'Gen' },
      { name: 'Exodus', chapters: 40, abbreviation: 'Exod' },
      { name: 'Leviticus', chapters: 27, abbreviation: 'Lev' },
      { name: 'Numbers', chapters: 36, abbreviation: 'Num' },
      { name: 'Deuteronomy', chapters: 34, abbreviation: 'Deut' },
    ],
    historical: [
      { name: 'Joshua', chapters: 24, abbreviation: 'Josh' },
      { name: 'Judges', chapters: 21, abbreviation: 'Judg' },
      { name: 'Ruth', chapters: 4, abbreviation: 'Ruth' },
      { name: '1 Samuel', chapters: 31, abbreviation: '1Sam' },
      { name: '2 Samuel', chapters: 24, abbreviation: '2Sam' },
      { name: '1 Kings', chapters: 22, abbreviation: '1Kgs' },
      { name: '2 Kings', chapters: 25, abbreviation: '2Kgs' },
      { name: '1 Chronicles', chapters: 29, abbreviation: '1Chr' },
      { name: '2 Chronicles', chapters: 36, abbreviation: '2Chr' },
      { name: 'Ezra', chapters: 10, abbreviation: 'Ezra' },
      { name: 'Nehemiah', chapters: 13, abbreviation: 'Neh' },
      { name: 'Esther', chapters: 10, abbreviation: 'Esth' },
    ],
    wisdom: [
      { name: 'Job', chapters: 42, abbreviation: 'Job' },
      { name: 'Psalms', chapters: 150, abbreviation: 'Ps' },
      { name: 'Proverbs', chapters: 31, abbreviation: 'Prov' },
      { name: 'Ecclesiastes', chapters: 12, abbreviation: 'Eccl' },
      { name: 'Song of Solomon', chapters: 8, abbreviation: 'Song' },
    ],
    majorProphets: [
      { name: 'Isaiah', chapters: 66, abbreviation: 'Isa' },
      { name: 'Jeremiah', chapters: 52, abbreviation: 'Jer' },
      { name: 'Lamentations', chapters: 5, abbreviation: 'Lam' },
      { name: 'Ezekiel', chapters: 48, abbreviation: 'Ezek' },
      { name: 'Daniel', chapters: 12, abbreviation: 'Dan' },
    ],
    minorProphets: [
      { name: 'Hosea', chapters: 14, abbreviation: 'Hos' },
      { name: 'Joel', chapters: 3, abbreviation: 'Joel' },
      { name: 'Amos', chapters: 9, abbreviation: 'Amos' },
      { name: 'Obadiah', chapters: 1, abbreviation: 'Obad' },
      { name: 'Jonah', chapters: 4, abbreviation: 'Jonah' },
      { name: 'Micah', chapters: 7, abbreviation: 'Mic' },
      { name: 'Nahum', chapters: 3, abbreviation: 'Nah' },
      { name: 'Habakkuk', chapters: 3, abbreviation: 'Hab' },
      { name: 'Zephaniah', chapters: 3, abbreviation: 'Zeph' },
      { name: 'Haggai', chapters: 2, abbreviation: 'Hag' },
      { name: 'Zechariah', chapters: 14, abbreviation: 'Zech' },
      { name: 'Malachi', chapters: 4, abbreviation: 'Mal' },
    ],
  },
  newTestament: {
    gospels: [
      { name: 'Matthew', chapters: 28, abbreviation: 'Matt' },
      { name: 'Mark', chapters: 16, abbreviation: 'Mark' },
      { name: 'Luke', chapters: 24, abbreviation: 'Luke' },
      { name: 'John', chapters: 21, abbreviation: 'John' },
    ],
    history: [
      { name: 'Acts', chapters: 28, abbreviation: 'Acts' },
    ],
    paulineEpistles: [
      { name: 'Romans', chapters: 16, abbreviation: 'Rom' },
      { name: '1 Corinthians', chapters: 16, abbreviation: '1Cor' },
      { name: '2 Corinthians', chapters: 13, abbreviation: '2Cor' },
      { name: 'Galatians', chapters: 6, abbreviation: 'Gal' },
      { name: 'Ephesians', chapters: 6, abbreviation: 'Eph' },
      { name: 'Philippians', chapters: 4, abbreviation: 'Phil' },
      { name: 'Colossians', chapters: 4, abbreviation: 'Col' },
      { name: '1 Thessalonians', chapters: 5, abbreviation: '1Thess' },
      { name: '2 Thessalonians', chapters: 3, abbreviation: '2Thess' },
      { name: '1 Timothy', chapters: 6, abbreviation: '1Tim' },
      { name: '2 Timothy', chapters: 4, abbreviation: '2Tim' },
      { name: 'Titus', chapters: 3, abbreviation: 'Titus' },
      { name: 'Philemon', chapters: 1, abbreviation: 'Phlm' },
    ],
    generalEpistles: [
      { name: 'Hebrews', chapters: 13, abbreviation: 'Heb' },
      { name: 'James', chapters: 5, abbreviation: 'Jas' },
      { name: '1 Peter', chapters: 5, abbreviation: '1Pet' },
      { name: '2 Peter', chapters: 3, abbreviation: '2Pet' },
      { name: '1 John', chapters: 5, abbreviation: '1John' },
      { name: '2 John', chapters: 1, abbreviation: '2John' },
      { name: '3 John', chapters: 1, abbreviation: '3John' },
      { name: 'Jude', chapters: 1, abbreviation: 'Jude' },
    ],
    apocalyptic: [
      { name: 'Revelation', chapters: 22, abbreviation: 'Rev' },
    ],
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Calculate totals
  const otBooks = Object.values(BIBLE_BOOKS.oldTestament).flat();
  const ntBooks = Object.values(BIBLE_BOOKS.newTestament).flat();
  const totalChapters = [...otBooks, ...ntBooks].reduce((sum, book) => sum + book.chapters, 0);

  res.status(200).json({
    books: BIBLE_BOOKS,
    stats: {
      oldTestamentBooks: otBooks.length,
      newTestamentBooks: ntBooks.length,
      totalBooks: otBooks.length + ntBooks.length,
      totalChapters,
    },
  });
}
