/**
 * API Route: Get Biblical characters
 * Returns list of Biblical characters extracted from narrative
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const NARRATIVE_FILE = path.join(process.cwd(), 'jewish_biblical_narrative_enhanced.md');

interface Character {
  name: string;
  title?: string;
  era: string;
  testament: 'old' | 'new' | 'both';
  category: string;
  books: string[];
  significance: string;
}

// Key Biblical characters with metadata
const BIBLICAL_CHARACTERS: Character[] = [
  // Patriarchs
  { name: 'Abraham', title: 'Father of Faith', era: 'Patriarchal', testament: 'old', category: 'patriarch', books: ['Genesis'], significance: 'Called by God, father of Israel through Isaac' },
  { name: 'Isaac', title: 'Son of Promise', era: 'Patriarchal', testament: 'old', category: 'patriarch', books: ['Genesis'], significance: 'Child of promise, blessed by God' },
  { name: 'Jacob', title: 'Israel', era: 'Patriarchal', testament: 'old', category: 'patriarch', books: ['Genesis'], significance: 'Renamed Israel, father of 12 tribes' },
  { name: 'Joseph', title: 'The Dreamer', era: 'Patriarchal', testament: 'old', category: 'patriarch', books: ['Genesis'], significance: 'Sold into slavery, became ruler of Egypt' },

  // Leaders
  { name: 'Moses', title: 'Lawgiver', era: 'Exodus', testament: 'old', category: 'leader', books: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'], significance: 'Led Israel from Egypt, received the Law' },
  { name: 'Joshua', title: 'Conqueror', era: 'Conquest', testament: 'old', category: 'leader', books: ['Joshua'], significance: 'Led Israel into Promised Land' },
  { name: 'Samuel', title: 'Prophet and Judge', era: 'Judges', testament: 'old', category: 'prophet', books: ['1 Samuel'], significance: 'Last judge, anointed first kings' },

  // Kings
  { name: 'Saul', title: 'First King', era: 'United Monarchy', testament: 'old', category: 'king', books: ['1 Samuel'], significance: 'First king of Israel, rejected by God' },
  { name: 'David', title: 'King of Israel', era: 'United Monarchy', testament: 'old', category: 'king', books: ['1 Samuel', '2 Samuel', '1 Kings', 'Psalms'], significance: 'Greatest king, ancestor of Messiah' },
  { name: 'Solomon', title: 'Wisest King', era: 'United Monarchy', testament: 'old', category: 'king', books: ['1 Kings', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'], significance: 'Built the Temple, known for wisdom' },
  { name: 'Hezekiah', title: 'Faithful King', era: 'Divided Kingdom', testament: 'old', category: 'king', books: ['2 Kings', 'Isaiah'], significance: 'Righteous king of Judah' },
  { name: 'Josiah', title: 'Reformer King', era: 'Divided Kingdom', testament: 'old', category: 'king', books: ['2 Kings', '2 Chronicles'], significance: 'Restored the Law, reformed worship' },

  // Prophets
  { name: 'Elijah', title: 'Prophet of Fire', era: 'Divided Kingdom', testament: 'old', category: 'prophet', books: ['1 Kings', '2 Kings'], significance: 'Confronted Baal worship, taken to heaven' },
  { name: 'Elisha', title: 'Successor of Elijah', era: 'Divided Kingdom', testament: 'old', category: 'prophet', books: ['2 Kings'], significance: 'Performed many miracles' },
  { name: 'Isaiah', title: 'Messianic Prophet', era: 'Divided Kingdom', testament: 'old', category: 'prophet', books: ['Isaiah'], significance: 'Major prophet, messianic prophecies' },
  { name: 'Jeremiah', title: 'Weeping Prophet', era: 'Exile', testament: 'old', category: 'prophet', books: ['Jeremiah', 'Lamentations'], significance: 'Warned of destruction, promised new covenant' },
  { name: 'Ezekiel', title: 'Prophet of Visions', era: 'Exile', testament: 'old', category: 'prophet', books: ['Ezekiel'], significance: 'Visions in exile, temple restoration' },
  { name: 'Daniel', title: 'Prophet of Dreams', era: 'Exile', testament: 'old', category: 'prophet', books: ['Daniel'], significance: 'Interpreter of dreams, survived lions den' },

  // Women
  { name: 'Sarah', title: 'Mother of Nations', era: 'Patriarchal', testament: 'old', category: 'matriarch', books: ['Genesis'], significance: 'Wife of Abraham, mother of Isaac' },
  { name: 'Rebekah', title: 'Wife of Isaac', era: 'Patriarchal', testament: 'old', category: 'matriarch', books: ['Genesis'], significance: 'Mother of Jacob and Esau' },
  { name: 'Rachel', title: 'Beloved Wife', era: 'Patriarchal', testament: 'old', category: 'matriarch', books: ['Genesis'], significance: 'Wife of Jacob, mother of Joseph' },
  { name: 'Ruth', title: 'The Faithful', era: 'Judges', testament: 'old', category: 'matriarch', books: ['Ruth'], significance: 'Moabite convert, ancestor of David' },
  { name: 'Esther', title: 'Queen of Persia', era: 'Persian', testament: 'old', category: 'queen', books: ['Esther'], significance: 'Saved Jewish people from destruction' },
  { name: 'Deborah', title: 'Judge and Prophetess', era: 'Judges', testament: 'old', category: 'judge', books: ['Judges'], significance: 'Only female judge of Israel' },

  // New Testament
  { name: 'Jesus', title: 'Son of God', era: 'Ministry', testament: 'both', category: 'messiah', books: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Revelation'], significance: 'The Christ, Savior of the world' },
  { name: 'Mary', title: 'Mother of Jesus', era: 'Ministry', testament: 'new', category: 'family', books: ['Matthew', 'Luke', 'John', 'Acts'], significance: 'Virgin mother of Jesus' },
  { name: 'Joseph', title: 'Earthly Father', era: 'Ministry', testament: 'new', category: 'family', books: ['Matthew', 'Luke'], significance: 'Husband of Mary, raised Jesus' },
  { name: 'John the Baptist', title: 'Forerunner', era: 'Ministry', testament: 'new', category: 'prophet', books: ['Matthew', 'Mark', 'Luke', 'John'], significance: 'Prepared the way for Jesus' },

  // Apostles
  { name: 'Peter', title: 'The Rock', era: 'Early Church', testament: 'new', category: 'apostle', books: ['Gospels', 'Acts', '1 Peter', '2 Peter'], significance: 'Leader of apostles, rock of church' },
  { name: 'Paul', title: 'Apostle to Gentiles', era: 'Early Church', testament: 'new', category: 'apostle', books: ['Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'], significance: 'Former persecutor, greatest missionary' },
  { name: 'John', title: 'Beloved Disciple', era: 'Early Church', testament: 'new', category: 'apostle', books: ['John', '1 John', '2 John', '3 John', 'Revelation'], significance: 'Closest to Jesus, wrote Revelation' },
  { name: 'James', title: 'Brother of Jesus', era: 'Early Church', testament: 'new', category: 'apostle', books: ['James'], significance: 'Leader of Jerusalem church' },
  { name: 'Matthew', title: 'Tax Collector', era: 'Early Church', testament: 'new', category: 'apostle', books: ['Matthew'], significance: 'Former tax collector, Gospel writer' },
  { name: 'Luke', title: 'The Physician', era: 'Early Church', testament: 'new', category: 'companion', books: ['Luke', 'Acts'], significance: 'Gentile physician, historian' },
  { name: 'Barnabas', title: 'Son of Encouragement', era: 'Early Church', testament: 'new', category: 'companion', books: ['Acts'], significance: 'Encourager, missionary partner' },
  { name: 'Timothy', title: 'Young Pastor', era: 'Early Church', testament: 'new', category: 'companion', books: ['1 Timothy', '2 Timothy'], significance: 'Protege of Paul' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, testament, era, search } = req.query;

  let filtered = [...BIBLICAL_CHARACTERS];

  if (category && typeof category === 'string') {
    filtered = filtered.filter(c => c.category === category);
  }

  if (testament && typeof testament === 'string') {
    filtered = filtered.filter(c => c.testament === testament || c.testament === 'both');
  }

  if (era && typeof era === 'string') {
    filtered = filtered.filter(c => c.era.toLowerCase().includes(era.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.title?.toLowerCase().includes(searchLower) ||
      c.significance.toLowerCase().includes(searchLower)
    );
  }

  // Get unique categories and eras for filters
  const categories = [...new Set(BIBLICAL_CHARACTERS.map(c => c.category))];
  const eras = [...new Set(BIBLICAL_CHARACTERS.map(c => c.era))];

  res.status(200).json({
    characters: filtered,
    total: filtered.length,
    filters: {
      categories,
      eras,
      testaments: ['old', 'new'],
    },
  });
}
