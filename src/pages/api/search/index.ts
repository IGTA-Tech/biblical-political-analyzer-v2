/**
 * API Route: /api/search
 * Semantic search for Bible verses using embeddings
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/openai';

interface SearchResult {
  id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  text: string;
  translation: string;
  testament: string;
  themes: string[];
  similarity: number;
}

interface SearchResponse {
  success: boolean;
  results?: SearchResult[];
  query?: string;
  count?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  // Allow both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Get query from body (POST) or query params (GET)
    const query = req.method === 'POST' ? req.body.query : req.query.q;
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const testament = req.query.testament as string | undefined;
    const book = req.query.book as string | undefined;
    const theme = req.query.theme as string | undefined;

    // Validate query
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    if (query.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 3 characters',
      });
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Build the RPC call for vector similarity search
    // This uses the pgvector extension's cosine distance operator
    const { data, error } = await supabaseAdmin.rpc('search_verses', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      filter_testament: testament || null,
      filter_book: book || null,
      filter_theme: theme || null,
    });

    if (error) {
      // If the RPC function doesn't exist, fall back to basic search
      if (error.code === 'PGRST202') {
        // Fallback: text-based search
        let queryBuilder = supabaseAdmin
          .from('biblical_passages')
          .select('*')
          .ilike('text', `%${query}%`)
          .limit(limit);

        if (testament) {
          queryBuilder = queryBuilder.eq('testament', testament);
        }
        if (book) {
          queryBuilder = queryBuilder.eq('book', book);
        }

        const { data: textResults, error: textError } = await queryBuilder;

        if (textError) {
          throw textError;
        }

        return res.status(200).json({
          success: true,
          results: (textResults || []).map((r: any) => ({
            ...r,
            similarity: 1.0, // Text match
          })),
          query,
          count: textResults?.length || 0,
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      results: data || [],
      query,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
