/**
 * API Route: /api/status/[id]
 * Check the status of an analysis request
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

interface StatusResponse {
  success: boolean;
  status?: 'pending' | 'processing' | 'complete' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
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

    // Fetch analysis request status
    const { data: request, error: requestError } = await supabase
      .from('analysis_requests')
      .select('id, status, error_message, created_at, completed_at')
      .eq('id', id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        error: 'Analysis request not found',
      });
    }

    // Calculate progress estimate
    // @ts-ignore - Supabase type issues
    let progress = 0;
    // @ts-ignore
    if (request.status === 'pending') {
      progress = 10;
    // @ts-ignore
    } else if (request.status === 'processing') {
      // Estimate progress based on elapsed time (rough estimate: 20 seconds average)
      // @ts-ignore
      const elapsed = Date.now() - new Date(request.created_at).getTime();
      const estimatedTotal = 20000; // 20 seconds
      progress = Math.min(90, 10 + Math.floor((elapsed / estimatedTotal) * 80));
    // @ts-ignore
    } else if (request.status === 'complete') {
      progress = 100;
    // @ts-ignore
    } else if (request.status === 'error') {
      progress = 0;
    }

    // Get message based on status
    let message = '';
    // @ts-ignore
    if (request.status === 'pending') {
      message = 'Analysis is queued...';
    // @ts-ignore
    } else if (request.status === 'processing') {
      message = 'Analyzing your statement...';
    // @ts-ignore
    } else if (request.status === 'complete') {
      message = 'Analysis complete!';
    // @ts-ignore
    } else if (request.status === 'error') {
      // @ts-ignore
      message = request.error_message || 'An error occurred during analysis';
    }

    return res.status(200).json({
      success: true,
      // @ts-ignore
      status: request.status as any,
      progress,
      message,
    });
  } catch (error) {
    console.error('Status API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
