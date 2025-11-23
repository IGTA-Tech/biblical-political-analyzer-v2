/**
 * Biblical Passage Card Component
 * Displays a single biblical passage with original language support
 */

import React, { useState } from 'react';
import { formatBiblicalReference } from '@/lib/utils';

interface KeyWord {
  english: string;
  original: string;
  transliteration: string;
  strongs: string;
  definition: string;
}

interface BiblicalPassageCardProps {
  passage: {
    id?: string;
    book: string;
    chapter: number;
    verse_start: number;
    verse_end?: number | null;
    text: string;
    translation: string;
    testament?: string;
    original_text?: string;
    transliteration?: string;
    historical_context?: string;
    key_words?: KeyWord[];
    relevance_score?: number;
    similarity?: number;
  };
}

export default function BiblicalPassageCard({ passage }: BiblicalPassageCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showKeyWords, setShowKeyWords] = useState(false);

  const relevanceScore = passage.relevance_score || passage.similarity || 0;
  const reference = formatBiblicalReference(
    passage.book,
    passage.chapter,
    passage.verse_start,
    passage.verse_end
  );

  return (
    <div className="card-biblical animation-slide-up">
      {/* Header with Reference and Relevance */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-gray-900">
          {reference}
        </h4>
        {relevanceScore > 0 && (
          <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-medium">
            {Math.round(relevanceScore * 100)}% relevant
          </span>
        )}
      </div>

      {/* English Text */}
      <div className="mb-4">
        <blockquote className="text-gray-800 text-lg leading-relaxed italic border-l-4 border-biblical-gold pl-4">
          "{passage.text}"
        </blockquote>
        <p className="text-gray-500 text-sm mt-2">
          — {passage.translation}
        </p>
      </div>

      {/* Original Language Toggle */}
      {passage.original_text && (
        <>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-biblical-deepblue hover:text-biblical-gold font-medium text-sm mb-4 transition-colors"
          >
            {showOriginal ? 'Hide' : 'Show'} Original{' '}
            {passage.testament === 'OT' ? 'Hebrew' : 'Greek'}
          </button>

          {showOriginal && (
            <div className="bg-white rounded-lg p-4 mb-4 border-2 border-amber-200">
              <p
                className={`text-gray-800 text-xl mb-2 ${
                  passage.testament === 'OT' ? 'font-hebrew' : 'font-greek'
                }`}
                dir={passage.testament === 'OT' ? 'rtl' : 'ltr'}
              >
                {passage.original_text}
              </p>
              {passage.transliteration && (
                <p className="text-gray-600 text-sm italic">
                  Transliteration: {passage.transliteration}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Historical Context */}
      {passage.historical_context && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-biblical-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historical Context
          </h5>
          <p className="text-gray-700 text-sm leading-relaxed">
            {passage.historical_context}
          </p>
        </div>
      )}

      {/* Key Words & Meanings */}
      {passage.key_words && passage.key_words.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowKeyWords(!showKeyWords)}
            className="flex items-center text-biblical-deepblue hover:text-biblical-gold font-semibold text-sm mb-3 transition-colors"
          >
            <svg
              className={`w-4 h-4 mr-2 transform transition-transform ${
                showKeyWords ? 'rotate-90' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Key Words & Meanings ({passage.key_words.length})
          </button>

          {showKeyWords && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {passage.key_words.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-3 border border-amber-200 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">
                      {word.english}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {word.strongs}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm italic mb-1">
                    {word.original} ({word.transliteration})
                  </p>
                  <p className="text-gray-700 text-sm">
                    {word.definition}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
