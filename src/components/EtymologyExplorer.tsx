/**
 * Etymology Explorer Component
 * Interactive word studies with original language insights
 */

import React from 'react';

interface WordStudy {
  word: string;
  transliteration: string;
  strongs: string;
  etymology: string;
  literal_meaning: string;
  cultural_context: string;
  modern_application: string;
  semantic_range: string[];
}

interface EtymologyExplorerProps {
  insights: {
    summary: string;
    word_studies: WordStudy[];
  };
}

export default function EtymologyExplorer({ insights }: EtymologyExplorerProps) {
  if (!insights || !insights.word_studies || insights.word_studies.length === 0) {
    return null;
  }

  return (
    <div className="card animation-slide-up">
      <h3 className="section-title text-left">
        Original Language Insights
      </h3>

      {/* Summary */}
      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-gray-700 leading-relaxed">
          {insights.summary}
        </p>
      </div>

      {/* Word Studies */}
      <div className="space-y-6">
        {insights.word_studies.map((study, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold text-biblical-deepblue mb-1">
                  {study.word}
                </h4>
                <p className="text-gray-600 italic text-lg">
                  {study.transliteration}
                </p>
              </div>
              <span className="px-3 py-1 bg-biblical-sand text-biblical-deepblue rounded text-sm font-medium">
                Strong's {study.strongs}
              </span>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-biblical-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Etymology
                  </h5>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {study.etymology}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-biblical-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Literal Meaning
                  </h5>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {study.literal_meaning}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-biblical-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cultural Context
                  </h5>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {study.cultural_context}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-biblical-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Modern Application
                  </h5>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {study.modern_application}
                  </p>
                </div>
              </div>
            </div>

            {/* Semantic Range */}
            {study.semantic_range && study.semantic_range.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-3">
                  Semantic Range (Related Meanings)
                </h5>
                <div className="flex flex-wrap gap-2">
                  {study.semantic_range.map((meaning, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {meaning}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
