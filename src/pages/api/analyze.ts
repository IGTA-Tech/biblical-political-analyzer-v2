/**
 * API Route: /api/analyze
 * Submit a political statement for analysis
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/openai';
import { submitToN8N } from '@/lib/n8n';

interface AnalyzeRequest {
  statement: string;
  user_id?: string;
}

interface AnalyzeResponse {
  success: boolean;
  request_id?: string;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { statement, user_id }: AnalyzeRequest = req.body;

    // Validate input
    if (!statement || typeof statement !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Statement is required and must be a string',
      });
    }

    if (statement.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Statement is too short. Please provide more context.',
      });
    }

    if (statement.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Statement is too long. Please keep it under 5000 characters.',
      });
    }

    // Generate embedding for the statement
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(statement);
    } catch (error) {
      console.error('Embedding generation error:', error);
      // Continue without embedding - not critical for initial submission
    }

    // Create analysis request in Supabase
    const { data: request, error: requestError } = await supabaseAdmin
      .from('analysis_requests')
      // @ts-ignore - Supabase type mismatch
      .insert({
        political_statement: statement,
        statement_embedding: embedding,
        user_id: user_id || null,
        status: 'pending',
      })
      .select()
      .single();

    if (requestError || !request) {
      console.error('Supabase insert error:', requestError);
      throw new Error('Failed to create analysis request');
    }

    // Submit to N8N workflow for processing
    try {
      await submitToN8N(statement, user_id, request);

      // Update status to processing
      await supabaseAdmin
        .from('analysis_requests')
        // @ts-ignore - Supabase type mismatch
        .update({ status: 'processing' })
        // @ts-ignore
        .eq('id', request.id);
    } catch (n8nError) {
      console.error('N8N submission error:', n8nError);

      // Update status to error
      await supabaseAdmin
        .from('analysis_requests')
        // @ts-ignore - Supabase type mismatch
        .update({
          status: 'error',
          error_message: 'Failed to submit to analysis workflow',
        })
        // @ts-ignore
        .eq('id', request.id);

      return res.status(500).json({
        success: false,
        error: 'Failed to submit analysis to workflow. Please try again.',
      });
    }

    // Return success with request ID
    return res.status(200).json({
      success: true,
      // @ts-ignore
      request_id: request.id,
      message: 'Analysis started successfully',
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
