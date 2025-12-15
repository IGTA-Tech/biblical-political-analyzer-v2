/**
 * API Route: AI Study Tools
 * Generate explanations, study guides, and discussion questions for Bible passages
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

// Study tool types
type StudyToolType = 'explain' | 'study-guide' | 'discussion' | 'context' | 'cross-references' | 'application';

interface StudyRequest {
  reference: string;      // e.g., "John 3:16" or "Romans 8:28-30"
  text?: string;          // The verse text (optional, will fetch if not provided)
  type: StudyToolType;    // What kind of study aid
  audience?: string;      // "children", "teens", "adults", "scholars"
  denomination?: string;  // Optional theological lens
}

interface StudyResponse {
  reference: string;
  type: StudyToolType;
  content: string;
  cached: boolean;
  generatedAt: string;
}

// Prompts for different study tools
const STUDY_PROMPTS: Record<StudyToolType, (ref: string, text: string, audience?: string) => string> = {
  'explain': (ref, text, audience = 'adults') => `
You are a knowledgeable Bible teacher. Explain the following Bible passage in clear, accessible language for ${audience}.

Passage: ${ref}
"${text}"

Provide:
1. **Plain Language Explanation** (2-3 sentences explaining what this verse means)
2. **Key Words** (define any important terms)
3. **The Big Idea** (one sentence summary of the main point)

Keep your response concise but insightful. Do not use overly academic language.
`,

  'study-guide': (ref, text, audience = 'adults') => `
You are a Bible study leader creating materials for ${audience}. Create a study guide for:

Passage: ${ref}
"${text}"

Include:
1. **Context** (2-3 sentences about where this fits in the book/Bible)
2. **Observation Questions** (3 questions about what the text says)
3. **Interpretation Questions** (3 questions about what it means)
4. **Application Questions** (3 questions about how to apply it)
5. **Prayer Prompt** (a short prayer starter based on this passage)

Format with clear headers and bullet points.
`,

  'discussion': (ref, text, audience = 'small group') => `
You are preparing discussion questions for a ${audience} Bible study on:

Passage: ${ref}
"${text}"

Create 6-8 thoughtful discussion questions that:
- Start with easier observation questions
- Move to deeper interpretation questions
- End with personal application questions
- Encourage group participation
- Avoid yes/no answers

Format as a numbered list with brief facilitator notes in parentheses.
`,

  'context': (ref, text) => `
You are a Bible scholar providing historical and literary context for:

Passage: ${ref}
"${text}"

Provide:
1. **Historical Context** (When was this written? What was happening?)
2. **Author & Audience** (Who wrote it and to whom?)
3. **Literary Context** (What comes before and after? What genre is this?)
4. **Cultural Background** (What cultural elements help understand this?)
5. **Original Language Insights** (Any significant Hebrew/Greek words?)

Be scholarly but accessible. Cite the biblical book and chapter when referencing other passages.
`,

  'cross-references': (ref, text) => `
You are a Bible study helper finding related passages for:

Passage: ${ref}
"${text}"

Find and explain 5-7 cross-references:
1. List each reference (e.g., "Romans 3:23")
2. Briefly quote or summarize the related passage
3. Explain how it connects to ${ref}

Organize by type of connection:
- **Same Theme** (passages on the same topic)
- **Quoted/Alluded** (OT quotes in NT or vice versa)
- **Same Author** (other writings by the same author)
- **Contrast** (passages that show a different perspective)
`,

  'application': (ref, text, audience = 'adults') => `
You are a practical Bible teacher helping ${audience} apply Scripture to daily life.

Passage: ${ref}
"${text}"

Provide:
1. **Timeless Principle** (What truth transcends the original context?)
2. **Modern Situations** (3-4 real-life scenarios where this applies)
3. **Practical Steps** (Specific actions someone could take this week)
4. **Reflection Questions** (2-3 questions for personal journaling)
5. **Prayer of Response** (A short prayer to respond to this truth)

Be specific and practical, not generic.
`,
};

// Cache table for AI responses
async function getCachedResponse(reference: string, type: StudyToolType): Promise<StudyResponse | null> {
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('study_cache')
      .select('*')
      .eq('reference', reference)
      .eq('study_type', type)
      .single();

    if (error || !data) return null;

    return {
      reference: data.reference,
      type: data.study_type,
      content: data.content,
      cached: true,
      generatedAt: data.created_at,
    };
  } catch (error) {
    return null;
  }
}

async function cacheResponse(reference: string, type: StudyToolType, content: string): Promise<void> {
  if (!supabaseUrl || !supabaseKey) return;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert to handle duplicates
    await supabase.from('study_cache').upsert({
      reference,
      study_type: type,
      content,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'reference,study_type'
    });
  } catch (error) {
    console.error('Error caching study response:', error);
  }
}

async function fetchVerseText(reference: string): Promise<string | null> {
  try {
    const encodedRef = encodeURIComponent(reference.replace(/\s+/g, '+'));
    const response = await fetch(`https://bible-api.com/${encodedRef}?translation=kjv`);

    if (!response.ok) return null;

    const data = await response.json();
    return data.text?.trim() || null;
  } catch (error) {
    return null;
  }
}

async function generateWithOpenAI(prompt: string): Promise<string | null> {
  if (!openaiKey) {
    console.error('OpenAI API key not configured');
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective but capable
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable, respectful Bible study assistant. Provide accurate, helpful information while being sensitive to different Christian traditions. Use markdown formatting for clarity.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support both GET (simple) and POST (full options)
  let reference: string;
  let type: StudyToolType;
  let text: string | undefined;
  let audience: string | undefined;

  if (req.method === 'GET') {
    reference = req.query.reference as string;
    type = (req.query.type as StudyToolType) || 'explain';
    text = req.query.text as string | undefined;
    audience = req.query.audience as string | undefined;
  } else {
    const body = req.body as StudyRequest;
    reference = body.reference;
    type = body.type || 'explain';
    text = body.text;
    audience = body.audience;
  }

  // Validate inputs
  if (!reference) {
    return res.status(400).json({
      error: 'Missing reference parameter',
      example: '/api/study?reference=John+3:16&type=explain',
      availableTypes: Object.keys(STUDY_PROMPTS),
    });
  }

  if (!STUDY_PROMPTS[type]) {
    return res.status(400).json({
      error: `Invalid type: ${type}`,
      availableTypes: Object.keys(STUDY_PROMPTS),
    });
  }

  // Check cache first
  const cached = await getCachedResponse(reference, type);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Fetch verse text if not provided
  if (!text) {
    const fetchedText = await fetchVerseText(reference);
    if (!fetchedText) {
      return res.status(404).json({
        error: 'Could not fetch verse text',
        reference,
      });
    }
    text = fetchedText;
  }

  // Generate AI response
  const prompt = STUDY_PROMPTS[type](reference, text, audience);
  const content = await generateWithOpenAI(prompt);

  if (!content) {
    return res.status(500).json({
      error: 'Failed to generate study content',
      reference,
      type,
    });
  }

  // Cache the response
  await cacheResponse(reference, type, content);

  const response: StudyResponse = {
    reference,
    type,
    content,
    cached: false,
    generatedAt: new Date().toISOString(),
  };

  res.status(200).json(response);
}
