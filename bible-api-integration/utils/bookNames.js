/**
 * Bible Book Names Utilities
 * Normalize book names, get book numbers, validate books
 */

/**
 * Complete list of Bible books in canonical order
 */
export const bookNames = {
  // Old Testament (1-39)
  1: 'Genesis',
  2: 'Exodus',
  3: 'Leviticus',
  4: 'Numbers',
  5: 'Deuteronomy',
  6: 'Joshua',
  7: 'Judges',
  8: 'Ruth',
  9: '1 Samuel',
  10: '2 Samuel',
  11: '1 Kings',
  12: '2 Kings',
  13: '1 Chronicles',
  14: '2 Chronicles',
  15: 'Ezra',
  16: 'Nehemiah',
  17: 'Esther',
  18: 'Job',
  19: 'Psalms',
  20: 'Proverbs',
  21: 'Ecclesiastes',
  22: 'Song of Solomon',
  23: 'Isaiah',
  24: 'Jeremiah',
  25: 'Lamentations',
  26: 'Ezekiel',
  27: 'Daniel',
  28: 'Hosea',
  29: 'Joel',
  30: 'Amos',
  31: 'Obadiah',
  32: 'Jonah',
  33: 'Micah',
  34: 'Nahum',
  35: 'Habakkuk',
  36: 'Zephaniah',
  37: 'Haggai',
  38: 'Zechariah',
  39: 'Malachi',
  // New Testament (40-66)
  40: 'Matthew',
  41: 'Mark',
  42: 'Luke',
  43: 'John',
  44: 'Acts',
  45: 'Romans',
  46: '1 Corinthians',
  47: '2 Corinthians',
  48: 'Galatians',
  49: 'Ephesians',
  50: 'Philippians',
  51: 'Colossians',
  52: '1 Thessalonians',
  53: '2 Thessalonians',
  54: '1 Timothy',
  55: '2 Timothy',
  56: 'Titus',
  57: 'Philemon',
  58: 'Hebrews',
  59: 'James',
  60: '1 Peter',
  61: '2 Peter',
  62: '1 John',
  63: '2 John',
  64: '3 John',
  65: 'Jude',
  66: 'Revelation'
};

/**
 * Common book name variations and abbreviations
 */
const bookAliases = {
  // Genesis variations
  'gen': 'Genesis',
  'ge': 'Genesis',
  'gn': 'Genesis',

  // Exodus variations
  'exo': 'Exodus',
  'ex': 'Exodus',
  'exod': 'Exodus',

  // Leviticus variations
  'lev': 'Leviticus',
  'le': 'Leviticus',
  'lv': 'Leviticus',

  // Numbers variations
  'num': 'Numbers',
  'nu': 'Numbers',
  'nm': 'Numbers',
  'nb': 'Numbers',

  // Deuteronomy variations
  'deut': 'Deuteronomy',
  'deu': 'Deuteronomy',
  'dt': 'Deuteronomy',

  // Joshua variations
  'josh': 'Joshua',
  'jos': 'Joshua',
  'jsh': 'Joshua',

  // Judges variations
  'judg': 'Judges',
  'jdg': 'Judges',
  'jg': 'Judges',
  'jdgs': 'Judges',

  // Ruth variations
  'rut': 'Ruth',
  'rth': 'Ruth',
  'ru': 'Ruth',

  // Samuel variations
  '1sam': '1 Samuel',
  '1sa': '1 Samuel',
  'isam': '1 Samuel',
  'isa': '1 Samuel',
  '1sm': '1 Samuel',
  '2sam': '2 Samuel',
  '2sa': '2 Samuel',
  'iisam': '2 Samuel',
  'iisa': '2 Samuel',
  '2sm': '2 Samuel',

  // Kings variations
  '1kings': '1 Kings',
  '1kgs': '1 Kings',
  '1ki': '1 Kings',
  'ikings': '1 Kings',
  'iki': '1 Kings',
  '2kings': '2 Kings',
  '2kgs': '2 Kings',
  '2ki': '2 Kings',
  'iikings': '2 Kings',
  'iiki': '2 Kings',

  // Chronicles variations
  '1chron': '1 Chronicles',
  '1chr': '1 Chronicles',
  '1ch': '1 Chronicles',
  'ichron': '1 Chronicles',
  'ich': '1 Chronicles',
  '2chron': '2 Chronicles',
  '2chr': '2 Chronicles',
  '2ch': '2 Chronicles',
  'iichron': '2 Chronicles',
  'iich': '2 Chronicles',

  // Ezra variations
  'ezr': 'Ezra',
  'ez': 'Ezra',

  // Nehemiah variations
  'neh': 'Nehemiah',
  'ne': 'Nehemiah',

  // Esther variations
  'esth': 'Esther',
  'est': 'Esther',
  'es': 'Esther',

  // Psalms variations
  'psalm': 'Psalms',
  'ps': 'Psalms',
  'psa': 'Psalms',
  'psm': 'Psalms',
  'pss': 'Psalms',

  // Proverbs variations
  'prov': 'Proverbs',
  'pro': 'Proverbs',
  'prv': 'Proverbs',
  'pr': 'Proverbs',

  // Ecclesiastes variations
  'eccles': 'Ecclesiastes',
  'eccle': 'Ecclesiastes',
  'ecc': 'Ecclesiastes',
  'ec': 'Ecclesiastes',
  'qoh': 'Ecclesiastes',

  // Song of Solomon variations
  'song': 'Song of Solomon',
  'songofsolomon': 'Song of Solomon',
  'sos': 'Song of Solomon',
  'so': 'Song of Solomon',
  'canticles': 'Song of Solomon',
  'canticleofcanticles': 'Song of Solomon',

  // Isaiah variations
  'isa': 'Isaiah',
  'is': 'Isaiah',

  // Jeremiah variations
  'jer': 'Jeremiah',
  'je': 'Jeremiah',
  'jr': 'Jeremiah',

  // Lamentations variations
  'lam': 'Lamentations',
  'la': 'Lamentations',

  // Ezekiel variations
  'ezek': 'Ezekiel',
  'eze': 'Ezekiel',
  'ezk': 'Ezekiel',

  // Daniel variations
  'dan': 'Daniel',
  'da': 'Daniel',
  'dn': 'Daniel',

  // Minor Prophets
  'hos': 'Hosea',
  'ho': 'Hosea',
  'joel': 'Joel',
  'jol': 'Joel',
  'jl': 'Joel',
  'amos': 'Amos',
  'amo': 'Amos',
  'am': 'Amos',
  'obad': 'Obadiah',
  'oba': 'Obadiah',
  'ob': 'Obadiah',
  'jonah': 'Jonah',
  'jon': 'Jonah',
  'jnh': 'Jonah',
  'mic': 'Micah',
  'mc': 'Micah',
  'nah': 'Nahum',
  'na': 'Nahum',
  'hab': 'Habakkuk',
  'hb': 'Habakkuk',
  'zeph': 'Zephaniah',
  'zep': 'Zephaniah',
  'zp': 'Zephaniah',
  'hag': 'Haggai',
  'hg': 'Haggai',
  'zech': 'Zechariah',
  'zec': 'Zechariah',
  'zc': 'Zechariah',
  'mal': 'Malachi',
  'ml': 'Malachi',

  // Gospels
  'matt': 'Matthew',
  'mat': 'Matthew',
  'mt': 'Matthew',
  'mrk': 'Mark',
  'mar': 'Mark',
  'mk': 'Mark',
  'mr': 'Mark',
  'luk': 'Luke',
  'lk': 'Luke',
  'jn': 'John',
  'jhn': 'John',

  // Acts
  'act': 'Acts',
  'ac': 'Acts',

  // Romans
  'rom': 'Romans',
  'ro': 'Romans',
  'rm': 'Romans',

  // Corinthians
  '1cor': '1 Corinthians',
  '1co': '1 Corinthians',
  'icor': '1 Corinthians',
  'ico': '1 Corinthians',
  '2cor': '2 Corinthians',
  '2co': '2 Corinthians',
  'iicor': '2 Corinthians',
  'iico': '2 Corinthians',

  // Galatians
  'gal': 'Galatians',
  'ga': 'Galatians',

  // Ephesians
  'eph': 'Ephesians',
  'ephes': 'Ephesians',

  // Philippians
  'phil': 'Philippians',
  'php': 'Philippians',
  'pp': 'Philippians',

  // Colossians
  'col': 'Colossians',

  // Thessalonians
  '1thess': '1 Thessalonians',
  '1thes': '1 Thessalonians',
  '1th': '1 Thessalonians',
  'ithess': '1 Thessalonians',
  'ith': '1 Thessalonians',
  '2thess': '2 Thessalonians',
  '2thes': '2 Thessalonians',
  '2th': '2 Thessalonians',
  'iithess': '2 Thessalonians',
  'iith': '2 Thessalonians',

  // Timothy
  '1tim': '1 Timothy',
  '1ti': '1 Timothy',
  'itim': '1 Timothy',
  'iti': '1 Timothy',
  '2tim': '2 Timothy',
  '2ti': '2 Timothy',
  'iitim': '2 Timothy',
  'iiti': '2 Timothy',

  // Titus
  'tit': 'Titus',
  'ti': 'Titus',

  // Philemon
  'philem': 'Philemon',
  'phm': 'Philemon',
  'pm': 'Philemon',

  // Hebrews
  'heb': 'Hebrews',
  'he': 'Hebrews',

  // James
  'jas': 'James',
  'jm': 'James',

  // Peter
  '1pet': '1 Peter',
  '1pe': '1 Peter',
  '1pt': '1 Peter',
  'ipet': '1 Peter',
  'ipe': '1 Peter',
  '2pet': '2 Peter',
  '2pe': '2 Peter',
  '2pt': '2 Peter',
  'iipet': '2 Peter',
  'iipe': '2 Peter',

  // John (epistles)
  '1john': '1 John',
  '1jn': '1 John',
  'ijohn': '1 John',
  'ijn': '1 John',
  '2john': '2 John',
  '2jn': '2 John',
  'iijohn': '2 John',
  'iijn': '2 John',
  '3john': '3 John',
  '3jn': '3 John',
  'iiijohn': '3 John',
  'iiijn': '3 John',

  // Jude
  'jud': 'Jude',
  'jd': 'Jude',

  // Revelation
  'rev': 'Revelation',
  're': 'Revelation',
  'apocalypse': 'Revelation'
};

/**
 * Normalize book name to canonical form
 * @param {string} bookName - Any form of book name
 * @returns {string} - Canonical book name
 */
export function normalizeBookName(bookName) {
  if (!bookName) return '';

  // Remove extra whitespace and convert to lowercase
  const cleaned = bookName.trim().toLowerCase().replace(/\s+/g, '');

  // Check if already canonical (capitalized)
  const capitalizedInput = bookName.trim();
  if (Object.values(bookNames).includes(capitalizedInput)) {
    return capitalizedInput;
  }

  // Check aliases
  if (bookAliases[cleaned]) {
    return bookAliases[cleaned];
  }

  // Try partial match (for typos)
  for (const [alias, canonical] of Object.entries(bookAliases)) {
    if (cleaned.includes(alias) || alias.includes(cleaned)) {
      return canonical;
    }
  }

  // Return original if no match (will fail validation)
  return bookName.trim();
}

/**
 * Get book number (1-66)
 * @param {string} bookName - Canonical book name
 * @returns {number} - Book number or 0 if not found
 */
export function getBookNumber(bookName) {
  const normalized = normalizeBookName(bookName);

  for (const [num, name] of Object.entries(bookNames)) {
    if (name === normalized) {
      return parseInt(num);
    }
  }

  return 0;
}

/**
 * Get canonical book name by number
 * @param {number} bookNumber - Book number (1-66)
 * @returns {string} - Canonical book name or empty string
 */
export function getBookName(bookNumber) {
  return bookNames[bookNumber] || '';
}

/**
 * Check if Old Testament book
 * @param {string} bookName - Book name
 * @returns {boolean}
 */
export function isOldTestament(bookName) {
  const bookNum = getBookNumber(bookName);
  return bookNum >= 1 && bookNum <= 39;
}

/**
 * Check if New Testament book
 * @param {string} bookName - Book name
 * @returns {boolean}
 */
export function isNewTestament(bookName) {
  const bookNum = getBookNumber(bookName);
  return bookNum >= 40 && bookNum <= 66;
}

/**
 * Get all book names
 * @param {string} testament - 'ot', 'nt', or 'all'
 * @returns {string[]}
 */
export function getAllBooks(testament = 'all') {
  const allBooks = Object.values(bookNames);

  if (testament === 'ot') {
    return allBooks.slice(0, 39);
  } else if (testament === 'nt') {
    return allBooks.slice(39);
  }

  return allBooks;
}

export default {
  bookNames,
  normalizeBookName,
  getBookNumber,
  getBookName,
  isOldTestament,
  isNewTestament,
  getAllBooks
};
