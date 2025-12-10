/**
 * API Route: Get timeline eras
 * Returns Christian and Jewish post-biblical history eras from the markdown files
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CHRISTIAN_ERAS_DIR = path.join(process.cwd(), 'historical-faith-narrative/content/eras');
const JEWISH_ERAS_DIR = path.join(process.cwd(), 'historical-faith-narrative/content/jewish-eras');

interface Era {
  id: string;
  name: string;
  dateRange: string;
  filename: string;
  size: number;
  overview?: string;
}

function parseEraFile(filepath: string): { name: string; dateRange: string; overview: string } | null {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');

    // Extract title from first # heading
    const titleMatch = content.match(/^# (.+?)$/m);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract date range from title or filename
    const dateMatch = title.match(/\(([^)]+)\)/) || title.match(/(\d+\s*(?:BCE?|CE|AD)\s*-\s*\d+\s*(?:BCE?|CE|AD))/i);
    const dateRange = dateMatch ? dateMatch[1] : '';

    // Extract name (title without dates)
    const name = title.replace(/\s*\([^)]+\)\s*$/, '').trim();

    // Get overview (first paragraph after ## Overview or first substantial paragraph)
    const overviewMatch = content.match(/## (?:Overview|Introduction|Era Overview)\s*\n+([\s\S]*?)(?=\n## |\n---)/);
    const overview = overviewMatch ? overviewMatch[1].trim().slice(0, 500) + '...' : '';

    return { name, dateRange, overview };
  } catch (error) {
    return null;
  }
}

function getErasFromDirectory(dir: string, type: 'christian' | 'jewish'): Era[] {
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

    return files.map((filename, index) => {
      const filepath = path.join(dir, filename);
      const stats = fs.statSync(filepath);
      const parsed = parseEraFile(filepath);

      return {
        id: `${type}-${index + 1}`,
        name: parsed?.name || filename.replace('.md', ''),
        dateRange: parsed?.dateRange || '',
        filename,
        size: stats.size,
        overview: parsed?.overview,
      };
    });
  } catch (error) {
    return [];
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  const christianEras = getErasFromDirectory(CHRISTIAN_ERAS_DIR, 'christian');
  const jewishEras = getErasFromDirectory(JEWISH_ERAS_DIR, 'jewish');

  if (type === 'christian') {
    return res.status(200).json({ eras: christianEras, total: christianEras.length });
  }

  if (type === 'jewish') {
    return res.status(200).json({ eras: jewishEras, total: jewishEras.length });
  }

  // Return all eras
  res.status(200).json({
    christian: { eras: christianEras, total: christianEras.length },
    jewish: { eras: jewishEras, total: jewishEras.length },
    totalEras: christianEras.length + jewishEras.length,
  });
}
