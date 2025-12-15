/**
 * API Route: Get Bible verse(s) in multiple translations
 * Fetches from bible-api.com (free) and caches in Supabase
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Available translations from bible-api.com
const AVAILABLE_TRANSLATIONS = {
  kjv: { name: 'King James Version', code: 'kjv', free: true },
  asv: { name: 'American Standard Version', code: 'asv', free: true },
  web: { name: 'World English Bible', code: 'web', free: true },
  bbe: { name: 'Bible in Basic English', code: 'bbe', free: true },
  darby: { name: 'Darby Translation', code: 'darby', free: true },
  ylt: { name: "Young's Literal Translation", code: 'ylt', free: true },
};

interface VerseResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  translationName: string;
}

async function fetchFromBibleAPI(reference: string, translation: string): Promise<VerseResult[] | null> {
  try {
    // bible-api.com format: /john+3:16?translation=kjv
    const encodedRef = encodeURIComponent(reference.replace(/\s+/g, '+'));
    const url = `https://bible-api.com/${encodedRef}?translation=${translation}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`Bible API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error(`Bible API error: ${data.error}`);
      return null;
    }

    // Handle single verse or multiple verses
    const verses: VerseResult[] = [];

    if (data.verses && Array.isArray(data.verses)) {
      for (const v of data.verses) {
        verses.push({
          reference: `${v.book_name} ${v.chapter}:${v.verse}`,
          book: v.book_name,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text.trim(),
          translation: translation.toUpperCase(),
          translationName: AVAILABLE_TRANSLATIONS[translation as keyof typeof AVAILABLE_TRANSLATIONS]?.name || translation,
        });
      }
    } else if (data.text) {
      // Single verse response
      verses.push({
        reference: data.reference,
        book: data.reference.split(' ').slice(0, -1).join(' '),
        chapter: parseInt(data.reference.split(':')[0].split(' ').pop() || '1'),
        verse: parseInt(data.reference.split(':')[1]?.split('-')[0] || '1'),
        text: data.text.trim(),
        translation: translation.toUpperCase(),
        translationName: AVAILABLE_TRANSLATIONS[translation as keyof typeof AVAILABLE_TRANSLATIONS]?.name || translation,
      });
    }

    return verses;
  } catch (error) {
    console.error('Error fetching from Bible API:', error);
    return null;
  }
}

async function getFromCache(book: string, chapter: number, verse: number, translation: string): Promise<VerseResult | null> {
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('biblical_passages')
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse_start', verse)
      .eq('translation', translation.toUpperCase())
      .single();

    if (error || !data) return null;

    return {
      reference: `${data.book} ${data.chapter}:${data.verse_start}`,
      book: data.book,
      chapter: data.chapter,
      verse: data.verse_start,
      text: data.text,
      translation: data.translation,
      translationName: AVAILABLE_TRANSLATIONS[translation.toLowerCase() as keyof typeof AVAILABLE_TRANSLATIONS]?.name || translation,
    };
  } catch (error) {
    return null;
  }
}

async function cacheVerse(verse: VerseResult): Promise<void> {
  if (!supabaseUrl || !supabaseKey) return;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already exists
    const { data: existing } = await supabase
      .from('biblical_passages')
      .select('id')
      .eq('book', verse.book)
      .eq('chapter', verse.chapter)
      .eq('verse_start', verse.verse)
      .eq('translation', verse.translation)
      .single();

    if (existing) return; // Already cached

    // Insert new verse
    await supabase.from('biblical_passages').insert({
      book: verse.book,
      chapter: verse.chapter,
      verse_start: verse.verse,
      verse_end: null,
      translation: verse.translation,
      text: verse.text,
      testament: getTestament(verse.book),
    });
  } catch (error) {
    console.error('Error caching verse:', error);
  }
}

function getTestament(book: string): 'OT' | 'NT' {
  const ntBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];
  return ntBooks.includes(book) ? 'NT' : 'OT';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference, translations, compare } = req.query;

  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({
      error: 'Missing reference parameter',
      example: '/api/bible/verse?reference=John+3:16&translations=kjv,asv,web'
    });
  }

  // Parse translations (default to KJV)
  let translationList = ['kjv'];
  if (translations && typeof translations === 'string') {
    translationList = translations.toLowerCase().split(',').filter(t => t in AVAILABLE_TRANSLATIONS);
  }
  if (translationList.length === 0) translationList = ['kjv'];

  // Fetch verses for each translation
  const results: { [key: string]: VerseResult[] } = {};

  for (const translation of translationList) {
    const verses = await fetchFromBibleAPI(reference, translation);
    if (verses && verses.length > 0) {
      results[translation] = verses;
      // Cache for future use
      for (const verse of verses) {
        await cacheVerse(verse);
      }
    }
  }

  if (Object.keys(results).length === 0) {
    return res.status(404).json({
      error: 'Verse not found',
      reference,
      translations: translationList
    });
  }

  // Format response
  const response: any = {
    reference,
    translations: results,
    availableTranslations: AVAILABLE_TRANSLATIONS,
  };

  // If compare mode, format for side-by-side view
  if (compare === 'true' && Object.keys(results).length > 1) {
    const firstTranslation = Object.values(results)[0];
    response.comparison = firstTranslation.map((verse, idx) => {
      const compared: any = {
        reference: verse.reference,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        versions: {}
      };
      for (const [trans, verses] of Object.entries(results)) {
        if (verses[idx]) {
          compared.versions[trans] = {
            text: verses[idx].text,
            name: verses[idx].translationName
          };
        }
      }
      return compared;
    });
  }

  res.status(200).json(response);
}
