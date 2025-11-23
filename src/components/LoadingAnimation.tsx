/**
 * Loading Animation Component
 * Beautiful loading state for analysis processing
 */

import React from 'react';

interface LoadingAnimationProps {
  message?: string;
  showSteps?: boolean;
}

export default function LoadingAnimation({
  message = 'Analyzing your statement...',
  showSteps = true,
}: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 animation-fade-in">
      {/* Spinner */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-biblical-sand rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-biblical-gold rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg className="w-10 h-10 text-biblical-deepblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      {/* Message */}
      <p className="text-xl font-semibold text-biblical-deepblue mb-2">
        {message}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        This may take 15-30 seconds...
      </p>

      {/* Progress Steps */}
      {showSteps && (
        <div className="w-full max-w-md space-y-3">
          <LoadingStep
            icon="search"
            text="Searching Biblical passages..."
            color="green"
          />
          <LoadingStep
            icon="language"
            text="Analyzing original Hebrew/Greek..."
            color="blue"
          />
          <LoadingStep
            icon="history"
            text="Finding historical parallels..."
            color="purple"
          />
          <LoadingStep
            icon="news"
            text="Gathering modern context..."
            color="amber"
          />
          <LoadingStep
            icon="brain"
            text="Synthesizing comprehensive analysis..."
            color="indigo"
          />
        </div>
      )}
    </div>
  );
}

interface LoadingStepProps {
  icon: 'search' | 'language' | 'history' | 'news' | 'brain';
  text: string;
  color: 'green' | 'blue' | 'purple' | 'amber' | 'indigo';
}

function LoadingStep({ icon, text, color }: LoadingStepProps) {
  const colorClasses = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    indigo: 'text-indigo-500',
  };

  const icons = {
    search: (
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    ),
    language: (
      <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
    ),
    history: (
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    ),
    news: (
      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
    ),
    brain: (
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    ),
  };

  return (
    <div className="flex items-center text-sm text-gray-600 animation-fade-in">
      <svg
        className={`w-5 h-5 mr-3 ${colorClasses[color]} animate-pulse`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        {icons[icon]}
      </svg>
      <span>{text}</span>
    </div>
  );
}
