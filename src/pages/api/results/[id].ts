/**
 * API Route: /api/results/[id]
 * Retrieve analysis results by request ID
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

interface ResultsResponse {
  success: boolean;
  data?: {
    request: any;
    results: any;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResultsResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required',
      });
    }

    // Fetch analysis request
    const { data: request, error: requestError } = await supabase
      .from('analysis_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        error: 'Analysis request not found',
      });
    }

    // Fetch analysis results
    const { data: results, error: resultsError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('request_id', id)
      .single();

    if (resultsError) {
      // Results not ready yet
      // @ts-ignore
      if (request.status === 'error') {
        return res.status(500).json({
          success: false,
          // @ts-ignore
          error: request.error_message || 'Analysis failed',
        });
      }

      return res.status(202).json({
        success: true,
        data: {
          request,
          results: null,
        },
      });
    }

    // Return complete analysis
    return res.status(200).json({
      success: true,
      data: {
        request,
        results,
      },
    });
  } catch (error) {
    console.error('Results API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
