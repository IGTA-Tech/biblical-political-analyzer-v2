/**
 * API Route: Get specific era content
 * Returns full content of a Christian or Jewish era file
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CHRISTIAN_ERAS_DIR = path.join(process.cwd(), 'historical-faith-narrative/content/eras');
const JEWISH_ERAS_DIR = path.join(process.cwd(), 'historical-faith-narrative/content/jewish-eras');

interface EraContent {
  title: string;
  dateRange: string;
  content: string;
  sections: { title: string; content: string }[];
  keyFigures: string[];
  keyEvents: string[];
}

function parseEraContent(filepath: string): EraContent | null {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');

    // Extract title
    const titleMatch = content.match(/^# (.+?)$/m);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract date range
    const dateMatch = title.match(/\(([^)]+)\)/);
    const dateRange = dateMatch ? dateMatch[1] : '';

    // Parse sections
    const sections: { title: string; content: string }[] = [];
    const sectionPattern = /## (.+?)\n([\s\S]*?)(?=\n## |$)/g;
    let match;

    while ((match = sectionPattern.exec(content)) !== null) {
      sections.push({
        title: match[1].trim(),
        content: match[2].trim(),
      });
    }

    // Extract key figures (look for ### Key Figures or similar)
    const keyFigures: string[] = [];
    const figuresSection = sections.find(s =>
      s.title.toLowerCase().includes('figure') ||
      s.title.toLowerCase().includes('leader') ||
      s.title.toLowerCase().includes('person')
    );
    if (figuresSection) {
      const figureMatches = figuresSection.content.match(/\*\*([^*]+)\*\*/g);
      if (figureMatches) {
        keyFigures.push(...figureMatches.map(f => f.replace(/\*\*/g, '')).slice(0, 10));
      }
    }

    // Extract key events
    const keyEvents: string[] = [];
    const eventsSection = sections.find(s =>
      s.title.toLowerCase().includes('event') ||
      s.title.toLowerCase().includes('development')
    );
    if (eventsSection) {
      const eventMatches = eventsSection.content.match(/\*\*([^*]+)\*\*/g);
      if (eventMatches) {
        keyEvents.push(...eventMatches.map(e => e.replace(/\*\*/g, '')).slice(0, 10));
      }
    }

    return {
      title: title.replace(/\s*\([^)]+\)\s*$/, '').trim(),
      dateRange,
      content,
      sections,
      keyFigures,
      keyEvents,
    };
  } catch (error) {
    return null;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { era, type } = req.query;

  if (!era || typeof era !== 'string') {
    return res.status(400).json({ error: 'Era identifier required' });
  }

  // Determine which directory to search
  const searchDirs = type === 'christian' ? [CHRISTIAN_ERAS_DIR] :
                     type === 'jewish' ? [JEWISH_ERAS_DIR] :
                     [CHRISTIAN_ERAS_DIR, JEWISH_ERAS_DIR];

  for (const dir of searchDirs) {
    try {
      const files = fs.readdirSync(dir);

      // Find matching file (by number, name, or exact match)
      const matchingFile = files.find(f => {
        const lower = f.toLowerCase();
        const eraLower = era.toLowerCase();
        return lower.includes(eraLower) ||
               lower.startsWith(eraLower) ||
               f.startsWith(era.padStart(2, '0'));
      });

      if (matchingFile) {
        const filepath = path.join(dir, matchingFile);
        const eraContent = parseEraContent(filepath);

        if (eraContent) {
          return res.status(200).json({
            ...eraContent,
            type: dir.includes('jewish') ? 'jewish' : 'christian',
            filename: matchingFile,
          });
        }
      }
    } catch (error) {
      continue;
    }
  }

  res.status(404).json({ error: `Era "${era}" not found` });
}
