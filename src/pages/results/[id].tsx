/**
 * Results Page
 * Display analysis results for a specific request
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoadingAnimation from '@/components/LoadingAnimation';
import ResultsDisplay from '@/components/ResultsDisplay';
import { sleep } from '@/lib/utils';

export default function ResultsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    let pollInterval: NodeJS.Timeout;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results/${id}`);
        const data = await response.json();

        if (!mounted) return;

        if (!data.success) {
          setError(data.error || 'Failed to fetch results');
          setLoading(false);
          return;
        }

        // Check if results are ready
        if (data.data.results) {
          // Results are complete!
          setAnalysis({
            ...data.data.results,
            political_statement: data.data.request.political_statement,
            request_id: data.data.request.id,
          });
          setLoading(false);
        } else {
          // Still processing - check status
          const status = data.data.request.status;

          if (status === 'error') {
            setError(data.data.request.error_message || 'Analysis failed');
            setLoading(false);
          } else if (status === 'pending' || status === 'processing') {
            // Continue polling
            setPollCount((c) => c + 1);
          } else {
            // Unknown status
            setError('Unknown analysis status');
            setLoading(false);
          }
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again.');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchResults();

    // Poll every 3 seconds if still loading
    pollInterval = setInterval(() => {
      if (loading && !error) {
        fetchResults();
      }
    }, 3000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, [id, loading, error]);

  // Timeout after 2 minutes
  useEffect(() => {
    if (pollCount > 40) {
      setError(
        'Analysis is taking longer than expected. Please check back later or try again.'
      );
      setLoading(false);
    }
  }, [pollCount]);

  return (
    <>
      <Head>
        <title>
          {loading
            ? 'Analyzing...'
            : error
            ? 'Error'
            : 'Analysis Results'} - Biblical Political Analyzer
        </title>
      </Head>

      <div className="min-h-screen">
        {loading && (
          <div className="section-container flex items-center justify-center">
            <LoadingAnimation showSteps={true} />
          </div>
        )}

        {error && (
          <div className="section-container">
            <div className="max-w-2xl mx-auto">
              <div className="card bg-red-50 border-l-4 border-red-600">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Analysis Error
                    </h3>
                    <p className="text-red-800">{error}</p>
                    <div className="mt-4">
                      <button
                        onClick={() => router.push('/analyze')}
                        className="btn-secondary text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && analysis && (
          <ResultsDisplay analysis={analysis} />
        )}
      </div>
    </>
  );
}
