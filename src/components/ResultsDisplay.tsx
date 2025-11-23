/**
 * Results Display Component
 * Main component for displaying analysis results
 */

import React, { useState } from 'react';
import BiblicalPassageCard from './BiblicalPassageCard';
import EtymologyExplorer from './EtymologyExplorer';
import HistoricalTimeline from './HistoricalTimeline';
import { AnalysisResult } from '@/lib/database.types';
import { copyToClipboard, getShareUrl } from '@/lib/utils';

interface ResultsDisplayProps {
  analysis: AnalysisResult & {
    political_statement?: string;
    request_id?: string;
  };
}

type TabType = 'biblical' | 'etymology' | 'historical' | 'modern' | 'synthesis';

export default function ResultsDisplay({ analysis }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('biblical');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (analysis.request_id) {
      const url = getShareUrl(analysis.request_id);
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const relevantPassages = Array.isArray(analysis.relevant_passages)
    ? (analysis.relevant_passages as any[])
    : [];

  const historicalParallels = Array.isArray(analysis.historical_parallels)
    ? (analysis.historical_parallels as any[])
    : [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animation-fade-in">
      {/* Header with Statement */}
      {analysis.political_statement && (
        <div className="card bg-biblical-parchment border-l-4 border-biblical-gold">
          <h3 className="text-lg font-semibold text-biblical-deepblue mb-2">
            Analyzed Statement:
          </h3>
          <blockquote className="text-gray-800 italic text-lg leading-relaxed">
            "{analysis.political_statement}"
          </blockquote>
        </div>
      )}

      {/* Executive Summary */}
      {analysis.executive_summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-600 animation-slide-up">
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Executive Summary
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            {analysis.executive_summary}
          </p>
        </div>
      )}

      {/* Share Button */}
      <div className="flex justify-end">
        <button
          onClick={handleShare}
          className="btn-secondary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <TabButton
              active={activeTab === 'biblical'}
              onClick={() => setActiveTab('biblical')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Biblical Analysis
            </TabButton>
            <TabButton
              active={activeTab === 'etymology'}
              onClick={() => setActiveTab('etymology')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Original Language
            </TabButton>
            <TabButton
              active={activeTab === 'historical'}
              onClick={() => setActiveTab('historical')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historical Parallels
            </TabButton>
            <TabButton
              active={activeTab === 'modern'}
              onClick={() => setActiveTab('modern')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Modern Context
            </TabButton>
            <TabButton
              active={activeTab === 'synthesis'}
              onClick={() => setActiveTab('synthesis')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Full Analysis
            </TabButton>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'biblical' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-biblical-deepblue mb-4">
                Relevant Biblical Passages
              </h3>
              {relevantPassages.length > 0 ? (
                relevantPassages.map((passage: any, idx: number) => (
                  <BiblicalPassageCard key={idx} passage={passage} />
                ))
              ) : (
                <p className="text-gray-500">No biblical passages found.</p>
              )}
              {analysis.detailed_analysis && (
                <div className="mt-8 prose prose-lg max-w-none">
                  <h4 className="text-xl font-semibold text-biblical-deepblue mb-4">
                    Detailed Biblical Analysis
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: analysis.detailed_analysis.replace(/\n/g, '<br/>'),
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'etymology' && (
            <div>
              {analysis.etymology_insights && typeof analysis.etymology_insights === 'object' ? (
                <EtymologyExplorer insights={analysis.etymology_insights as any} />
              ) : (
                <div className="prose prose-lg max-w-none">
                  <h4 className="text-xl font-semibold text-biblical-deepblue mb-4">
                    Original Language Insights
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {analysis.original_language_insights || 'No etymology insights available.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'historical' && (
            <div>
              {historicalParallels.length > 0 ? (
                <HistoricalTimeline parallels={historicalParallels} />
              ) : (
                <p className="text-gray-500">No historical parallels found.</p>
              )}
              {analysis.historical_comparison && (
                <div className="mt-8 prose prose-lg max-w-none">
                  <h4 className="text-xl font-semibold text-biblical-deepblue mb-4">
                    Historical Comparison
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: analysis.historical_comparison.replace(/\n/g, '<br/>'),
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'modern' && (
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-biblical-deepblue mb-4">
                Modern Political Context
              </h3>
              {analysis.modern_application ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: analysis.modern_application.replace(/\n/g, '<br/>'),
                  }}
                />
              ) : (
                <p className="text-gray-500">No modern context available.</p>
              )}
            </div>
          )}

          {activeTab === 'synthesis' && (
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-biblical-deepblue mb-6">
                Comprehensive Analysis
              </h3>

              {analysis.detailed_analysis && (
                <section className="mb-8">
                  <h4 className="text-xl font-semibold text-biblical-deepblue mb-3">
                    Biblical Analysis
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: analysis.detailed_analysis.replace(/\n/g, '<br/>'),
                    }}
                  />
                </section>
              )}

              {analysis.original_language_insights && (
                <section className="mb-8">
                  <h4 className="text-xl font-semibold text-biblical-deepblue mb-3">
                    Original Language Insights
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: analysis.original_language_insights.replace(/\n/g, '<br/>'),
                    }}
                  />
                </section>
              )}

              {analysis.historical_comparison && (
                <section className="mb-8">
                  <h4 className="text-xl font-semibold text-biblical-deepblue mb-3">
                    Historical Comparison
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: analysis.historical_comparison.replace(/\n/g, '<br/>'),
                    }}
                  />
                </section>
              )}

              {analysis.modern_application && (
                <section className="mb-8">
                  <h4 className="text-xl font-semibold text-biblical-deepblue mb-3">
                    Modern Application
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: analysis.modern_application.replace(/\n/g, '<br/>'),
                    }}
                  />
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-biblical-gold text-biblical-deepblue bg-biblical-sand/30'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}
