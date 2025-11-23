/**
 * N8N Webhook Integration
 * Submit political statements to N8N for analysis
 */

import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

if (!N8N_WEBHOOK_URL) {
  console.warn('N8N_WEBHOOK_URL not configured');
}

export interface AnalysisRequest {
  political_statement: string;
  user_id?: string;
  request_id?: string;
}

export interface N8NResponse {
  success: boolean;
  request_id: string;
  message?: string;
  error?: string;
}

/**
 * Submit a political statement to N8N for analysis
 * @param statement - The political statement to analyze
 * @param userId - Optional user identifier
 * @returns N8N response with request ID
 */
export async function submitToN8N(
  statement: string,
  userId?: string,
  request?: Record<string, any>,
): Promise<N8NResponse> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N webhook URL not configured');
  }

  try {
    const check_rq_id = request?.id?? "no_request_id_available"
    const payload: AnalysisRequest = {
      political_statement: statement,
      user_id: userId,
      request_id: check_rq_id
    };
    
    const response = await axios.post<N8NResponse>(N8N_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('N8N webhook error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to submit to N8N workflow'
      );
    }
    throw error;
  }
}

/**
 * Check the status of an analysis request
 * This would typically call a status endpoint in your N8N workflow
 * For now, it's a placeholder for future implementation
 */
export async function checkAnalysisStatus(requestId: string): Promise<{
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress?: number;
}> {
  // TODO: Implement status checking if N8N provides a status endpoint
  // For now, return a simple response
  return {
    status: 'processing',
    progress: 50,
  };
}

/**
 * Cancel an ongoing analysis
 * Placeholder for future implementation
 */
export async function cancelAnalysis(requestId: string): Promise<boolean> {
  // TODO: Implement if N8N supports cancellation
  console.log('Cancel analysis not implemented:', requestId);
  return false;
}
