/**
 * API Route: Get content for a specific Bible book
 * Parses the narrative markdown file and returns book content
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const NARRATIVE_FILE = path.join(process.cwd(), 'jewish_biblical_narrative_enhanced.md');

interface BookSection {
  title: string;
  content: string;
  subsections: { title: string; content: string }[];
}

function parseNarrativeForBook(bookName: string): BookSection | null {
  try {
    const content = fs.readFileSync(NARRATIVE_FILE, 'utf-8');

    // Find the book section
    const bookPattern = new RegExp(`^## ${bookName}\\n`, 'm');
    const bookMatch = content.match(bookPattern);

    if (!bookMatch) {
      return null;
    }

    const startIndex = bookMatch.index! + bookMatch[0].length;

    // Find the next ## heading (next book or section)
    const nextBookPattern = /\n## [A-Z]/;
    const nextMatch = content.slice(startIndex).match(nextBookPattern);
    const endIndex = nextMatch ? startIndex + nextMatch.index! : content.length;

    const bookContent = content.slice(startIndex, endIndex).trim();

    // Parse subsections (### headings)
    const subsections: { title: string; content: string }[] = [];
    const subsectionPattern = /### (.+?)\n([\s\S]*?)(?=\n### |\n## |$)/g;
    let match;

    while ((match = subsectionPattern.exec(bookContent)) !== null) {
      subsections.push({
        title: match[1].trim(),
        content: match[2].trim(),
      });
    }

    return {
      title: bookName,
      content: bookContent,
      subsections,
    };
  } catch (error) {
    console.error('Error parsing narrative:', error);
    return null;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { book } = req.query;

  if (!book || typeof book !== 'string') {
    return res.status(400).json({ error: 'Book name required' });
  }

  const bookData = parseNarrativeForBook(book);

  if (!bookData) {
    return res.status(404).json({ error: `Book "${book}" not found` });
  }

  res.status(200).json(bookData);
}
