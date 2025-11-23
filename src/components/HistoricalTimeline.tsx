/**
 * Historical Timeline Component
 * Visual timeline of historical parallels
 */

import React, { useState } from 'react';

interface HistoricalParallel {
  id?: string;
  title: string;
  time_period: string | null;
  location: string | null;
  situation_summary: string;
  what_happened: string;
  outcome: string;
  lessons_learned: string | null;
  similarity_score?: number;
  similarity?: number;
}

interface HistoricalTimelineProps {
  parallels: HistoricalParallel[];
}

export default function HistoricalTimeline({ parallels }: HistoricalTimelineProps) {
  if (!parallels || parallels.length === 0) {
    return null;
  }

  return (
    <div className="card animation-slide-up">
      <h3 className="section-title text-left">
        Historical Parallels
      </h3>

      <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        These real-world historical events share similarities with the current political situation,
        offering lessons from how similar dynamics played out in the past.
      </p>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-biblical-gold via-biblical-clay to-biblical-stone"></div>

        {/* Timeline Events */}
        <div className="space-y-12">
          {parallels.map((parallel, idx) => (
            <TimelineEvent
              key={parallel.id || idx}
              parallel={parallel}
              isLeft={idx % 2 === 0}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TimelineEventProps {
  parallel: HistoricalParallel;
  isLeft: boolean;
  index: number;
}

function TimelineEvent({ parallel, isLeft, index }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);
  const similarityScore = parallel.similarity_score || parallel.similarity || 0;

  return (
    <div
      className={`flex items-center ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      } flex-col`}
    >
      {/* Content Card */}
      <div className="w-full md:w-5/12 mb-4 md:mb-0">
        <div
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-lg font-bold text-gray-900 flex-1">
              {parallel.title}
            </h4>
            {similarityScore > 0 && (
              <span className="ml-2 px-2 py-1 bg-purple-200 text-purple-900 rounded text-xs font-medium whitespace-nowrap">
                {Math.round(similarityScore * 100)}% similar
              </span>
            )}
          </div>

          {/* Time Period & Location */}
          <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-600">
            {parallel.time_period && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {parallel.time_period}
              </span>
            )}
            {parallel.location && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {parallel.location}
              </span>
            )}
          </div>

          {/* Situation Summary */}
          <p className="text-gray-700 text-sm mb-4">
            {parallel.situation_summary}
          </p>

          {/* Expandable Details */}
          {expanded && (
            <div className="space-y-3 pt-3 border-t border-purple-200 animation-fade-in">
              <details open>
                <summary className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-purple-700">
                  What Happened?
                </summary>
                <p className="text-gray-700 text-sm mt-2 pl-4 leading-relaxed">
                  {parallel.what_happened}
                </p>
              </details>

              <details open>
                <summary className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-purple-700">
                  Outcome
                </summary>
                <p className="text-gray-700 text-sm mt-2 pl-4 leading-relaxed">
                  {parallel.outcome}
                </p>
              </details>

              {parallel.lessons_learned && (
                <details open>
                  <summary className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-purple-700">
                    Lessons Learned
                  </summary>
                  <p className="text-gray-700 text-sm mt-2 pl-4 leading-relaxed">
                    {parallel.lessons_learned}
                  </p>
                </details>
              )}
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="mt-3 text-purple-700 hover:text-purple-900 text-sm font-medium flex items-center"
          >
            {expanded ? 'Show less' : 'Show more'}
            <svg
              className={`w-4 h-4 ml-1 transform transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Timeline Marker (Desktop) */}
      <div className="hidden md:flex w-2/12 justify-center relative z-10">
        <div className="w-8 h-8 rounded-full bg-purple-600 border-4 border-white shadow-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">{index + 1}</span>
        </div>
      </div>

      {/* Empty Space (Desktop) */}
      <div className="hidden md:block w-5/12"></div>
    </div>
  );
}
