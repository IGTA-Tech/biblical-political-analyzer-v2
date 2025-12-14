/**
 * API Route: Get timeline eras
 * Returns Christian and Jewish post-biblical history eras from the markdown files
 * Enhanced to extract key events, figures, and perspectives
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CHRISTIAN_ERAS_DIR = path.join(process.cwd(), 'historical-faith-narrative/content/eras');
const JEWISH_ERAS_DIR = path.join(process.cwd(), 'historical-faith-narrative/content/jewish-eras');

interface KeyEvent {
  title: string;
  year: string;
  description: string;
}

interface KeyFigure {
  name: string;
  role: string;
}

interface PerspectivesSummary {
  catholic?: string;
  orthodox?: string;
  protestant?: string;
  jewish?: string;
  academic?: string;
}

interface Era {
  id: string;
  name: string;
  dateRange: string;
  tagline: string;
  filename: string;
  size: number;
  overview: string;
  keyEvents: KeyEvent[];
  keyFigures: KeyFigure[];
  perspectives: PerspectivesSummary;
  color: string;
}

// Color palette for eras based on period
const ERA_COLORS: { [key: string]: string } = {
  // Christian eras
  'apostolic': 'bg-amber-600',
  'ante-nicene': 'bg-orange-600',
  'post-nicene': 'bg-yellow-600',
  'early medieval': 'bg-emerald-600',
  'high medieval': 'bg-teal-600',
  'late medieval': 'bg-cyan-600',
  'reformation': 'bg-blue-600',
  'post-reformation': 'bg-indigo-600',
  'modern': 'bg-purple-600',
  'contemporary': 'bg-pink-600',
  // Jewish eras
  'rabbinic': 'bg-amber-700',
  'talmudic': 'bg-orange-700',
  'geonic': 'bg-yellow-700',
  'golden age': 'bg-emerald-700',
  'hasidism': 'bg-blue-700',
  'emancipation': 'bg-indigo-700',
  'catastrophe': 'bg-red-700',
};

function getEraColor(name: string): string {
  const nameLower = name.toLowerCase();
  for (const [key, color] of Object.entries(ERA_COLORS)) {
    if (nameLower.includes(key)) {
      return color;
    }
  }
  return 'bg-stone-600'; // Default
}

function parseEraFile(filepath: string): Omit<Era, 'id' | 'filename' | 'size'> | null {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');

    // Extract title from first # heading (e.g., "# Era 1: Apostolic Era")
    const titleMatch = content.match(/^# (?:Era \d+: )?(.+?)$/m);
    const rawTitle = titleMatch ? titleMatch[1] : '';

    // Extract date range from ## heading (e.g., "## -4 - 100 AD")
    const dateRangeMatch = content.match(/^## (.+?\d+.+?)$/m);
    const dateRange = dateRangeMatch ? dateRangeMatch[1].trim() : '';

    // Extract tagline (italic text after date)
    const taglineMatch = content.match(/^\*([^*]+)\*$/m);
    const tagline = taglineMatch ? taglineMatch[1].trim() : '';

    // Clean up name
    const name = rawTitle.replace(/\s*\([^)]+\)\s*$/, '').trim();

    // Get overview - first substantial paragraph from Overview section
    const overviewSection = content.match(/## (?:Overview|Historical and Political Context)\s*\n+([\s\S]*?)(?=\n## |\n---)/);
    let overview = '';
    if (overviewSection) {
      // Get first paragraph (skip headers)
      const paragraphs = overviewSection[1].split('\n\n').filter(p =>
        p.trim() && !p.trim().startsWith('#') && !p.trim().startsWith('-') && p.trim().length > 50
      );
      overview = paragraphs[0]?.trim().slice(0, 500) || '';
      if (overview.length === 500) overview += '...';
    }

    // Extract key events (### Event Title (date) pattern)
    const keyEvents: KeyEvent[] = [];
    const keyEventsSection = content.match(/## Key Events\s*\n+([\s\S]*?)(?=\n## [A-Z])/);
    if (keyEventsSection) {
      const eventMatches = keyEventsSection[1].matchAll(/### ([^(]+)\s*\(([^)]+)\)\s*\n+([^\n#]+)/g);
      for (const match of eventMatches) {
        if (keyEvents.length < 8) {
          keyEvents.push({
            title: match[1].trim(),
            year: match[2].trim(),
            description: match[3].trim().slice(0, 200) + (match[3].length > 200 ? '...' : '')
          });
        }
      }
    }

    // Extract key figures
    const keyFigures: KeyFigure[] = [];
    const keyFiguresSection = content.match(/## Key Figures\s*\n+([\s\S]*?)(?=\n## [A-Z])/);
    if (keyFiguresSection) {
      // Look for ### Person Name or **Person Name** patterns
      const figureMatches = keyFiguresSection[1].matchAll(/(?:### |^\*\*|^- \*\*)([^*\n(]+)(?:\*\*)?(?:\s*\(([^)]+)\))?/gm);
      for (const match of figureMatches) {
        if (keyFigures.length < 6 && match[1].trim().length > 2) {
          keyFigures.push({
            name: match[1].trim().replace(/^\d+\.\s*/, ''),
            role: match[2]?.trim() || ''
          });
        }
      }
    }

    // Extract perspectives summary
    const perspectives: PerspectivesSummary = {};

    // Catholic perspective
    const catholicMatch = content.match(/(?:Roman Catholic|Catholic) (?:Perspective|View)[:\s]*\n+([\s\S]*?)(?=\n### |\n## |\n---)/i);
    if (catholicMatch) {
      const firstPara = catholicMatch[1].split('\n\n')[0]?.replace(/^[#\-*\s]+/, '').trim();
      perspectives.catholic = firstPara?.slice(0, 300) || '';
    }

    // Orthodox perspective
    const orthodoxMatch = content.match(/(?:Eastern )?Orthodox (?:Perspective|View)[:\s]*\n+([\s\S]*?)(?=\n### |\n## |\n---)/i);
    if (orthodoxMatch) {
      const firstPara = orthodoxMatch[1].split('\n\n')[0]?.replace(/^[#\-*\s]+/, '').trim();
      perspectives.orthodox = firstPara?.slice(0, 300) || '';
    }

    // Protestant perspective
    const protestantMatch = content.match(/Protestant (?:Perspective|View)[:\s]*\n+([\s\S]*?)(?=\n### |\n## |\n---)/i);
    if (protestantMatch) {
      const firstPara = protestantMatch[1].split('\n\n')[0]?.replace(/^[#\-*\s]+/, '').trim();
      perspectives.protestant = firstPara?.slice(0, 300) || '';
    }

    // Jewish perspective
    const jewishMatch = content.match(/Jewish (?:Perspective|View)[:\s]*\n+([\s\S]*?)(?=\n### |\n## |\n---)/i);
    if (jewishMatch) {
      const firstPara = jewishMatch[1].split('\n\n')[0]?.replace(/^[#\-*\s]+/, '').trim();
      perspectives.jewish = firstPara?.slice(0, 300) || '';
    }

    // Academic perspective
    const academicMatch = content.match(/(?:Academic|Secular|Scholarly) (?:Perspective|View|Assessment)[:\s]*\n+([\s\S]*?)(?=\n### |\n## |\n---)/i);
    if (academicMatch) {
      const firstPara = academicMatch[1].split('\n\n')[0]?.replace(/^[#\-*\s]+/, '').trim();
      perspectives.academic = firstPara?.slice(0, 300) || '';
    }

    return {
      name,
      dateRange,
      tagline,
      overview,
      keyEvents,
      keyFigures,
      perspectives,
      color: getEraColor(name)
    };
  } catch (error) {
    console.error('Error parsing era file:', error);
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
        tagline: parsed?.tagline || '',
        filename,
        size: stats.size,
        overview: parsed?.overview || '',
        keyEvents: parsed?.keyEvents || [],
        keyFigures: parsed?.keyFigures || [],
        perspectives: parsed?.perspectives || {},
        color: parsed?.color || 'bg-stone-600',
      };
    });
  } catch (error) {
    console.error('Error reading eras directory:', error);
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
