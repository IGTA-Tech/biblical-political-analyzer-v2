/**
 * Analysis Form Component
 * Input form for users to submit political statements
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface AnalysisFormProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (requestId: string) => void;
}

const EXAMPLE_STATEMENTS = [
  'We need to close our borders to protect American jobs',
  'Healthcare is a fundamental human right that should be provided by the government',
  'We must prioritize climate action even if it impacts economic growth',
  'Traditional family values are under attack and need to be protected',
  'Corporations should pay their fair share in taxes',
];

export default function AnalysisForm({ onAnalysisStart, onAnalysisComplete }: AnalysisFormProps) {
  const router = useRouter();
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!statement.trim()) {
      setError('Please enter a political statement');
      return;
    }

    if (statement.length < 10) {
      setError('Statement is too short. Please provide more context.');
      return;
    }

    setLoading(true);
    onAnalysisStart?.();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statement }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();

      if (data.request_id) {
        onAnalysisComplete?.(data.request_id);
        // Navigate to results page
        router.push(`/results/${data.request_id}`);
      } else {
        throw new Error('No request ID received');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setStatement(example);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-biblical-deepblue mb-6">
        Analyze a Political Statement
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="statement"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter a political statement, quote, or policy position:
          </label>
          <textarea
            id="statement"
            rows={6}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="textarea-field"
            placeholder="Example: 'We need to close our borders to protect American jobs'"
            required
            disabled={loading}
          />
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {statement.length} characters
            </span>
            {statement.length > 0 && statement.length < 10 && (
              <span className="text-sm text-red-600">
                Too short - add more context
              </span>
            )}
          </div>
        </div>

        {/* Example Statements */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Try an example:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_STATEMENTS.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={loading}
                className="text-xs px-3 py-2 bg-biblical-sand text-gray-700 rounded-md hover:bg-biblical-gold hover:text-biblical-deepblue transition-colors disabled:opacity-50"
              >
                {example.substring(0, 40)}...
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 max-w-md">
            This tool will analyze the statement against Biblical principles,
            original language meanings, and historical context.
          </p>

          <button
            type="submit"
            disabled={loading || !statement.trim() || statement.length < 10}
            className="btn-primary"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 space-y-4 animation-fade-in">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biblical-deepblue"></div>
            <p className="text-gray-600">
              Analyzing your statement...
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2 text-green-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Searching Biblical passages...
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2 text-blue-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Analyzing original Hebrew/Greek...
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2 text-purple-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Finding historical parallels...
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2 text-amber-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Gathering modern context...
            </div>
          </div>

          <div className="bg-biblical-parchment rounded p-4 border border-biblical-gold">
            <p className="text-sm text-center text-gray-600">
              This may take 15-30 seconds as we search thousands of verses and historical events...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
