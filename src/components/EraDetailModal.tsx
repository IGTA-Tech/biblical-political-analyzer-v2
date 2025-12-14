/**
 * Era Detail Modal
 * Medium-depth view of a historical era - more than inline, less than full page
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Section {
  title: string;
  content: string;
}

interface EraContent {
  title: string;
  dateRange: string;
  content: string;
  sections: Section[];
  keyFigures: string[];
  keyEvents: string[];
  type: 'christian' | 'jewish';
  filename: string;
}

interface EraDetailModalProps {
  eraId: string;
  type: 'christian' | 'jewish';
  isOpen: boolean;
  onClose: () => void;
}

export default function EraDetailModal({ eraId, type, isOpen, onClose }: EraDetailModalProps) {
  const [era, setEra] = useState<EraContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'perspectives'>('overview');

  useEffect(() => {
    if (isOpen && eraId) {
      setLoading(true);
      setError(null);
      fetch(`/api/timeline/${eraId}?type=${type}`)
        .then(res => {
          if (!res.ok) throw new Error('Era not found');
          return res.json();
        })
        .then(data => {
          setEra(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen, eraId, type]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract sections by type
  const getSection = (keywords: string[]): Section | undefined => {
    return era?.sections.find(s =>
      keywords.some(k => s.title.toLowerCase().includes(k))
    );
  };

  const overviewSection = getSection(['overview', 'historical', 'context']);
  const eventsSection = getSection(['event', 'development']);
  const figuresSection = getSection(['figure', 'leader', 'person']);
  const perspectivesSection = getSection(['perspective', 'multi-perspective', 'analysis']);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-biblical-deepblue to-blue-800 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  type === 'christian' ? 'bg-purple-500' : 'bg-amber-500'
                }`}>
                  {type === 'christian' ? '✝️ Christian' : '✡️ Jewish'}
                </span>
                {era && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                    {era.dateRange}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {loading ? 'Loading...' : era?.title || 'Era Details'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          {era && (
            <div className="flex gap-1 mt-4 -mb-6 pt-2">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'events', label: 'Key Events', icon: '📅' },
                { id: 'figures', label: 'Key Figures', icon: '👤' },
                { id: 'perspectives', label: 'Perspectives', icon: '🔍' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-biblical-deepblue'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-biblical-gold border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={onClose} className="text-biblical-deepblue hover:underline">
                Close
              </button>
            </div>
          )}

          {era && !loading && (
            <div className="space-y-4">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="prose prose-sm max-w-none">
                  {overviewSection ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(overviewSection.content.slice(0, 2000)) }} />
                  ) : (
                    <p className="text-gray-500">No overview available for this era.</p>
                  )}
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div>
                  {era.keyEvents.length > 0 ? (
                    <div className="space-y-3">
                      {era.keyEvents.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-biblical-deepblue">{event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : eventsSection ? (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(eventsSection.content.slice(0, 2000)) }} />
                  ) : (
                    <p className="text-gray-500">No events data available.</p>
                  )}
                </div>
              )}

              {/* Figures Tab */}
              {activeTab === 'figures' && (
                <div>
                  {era.keyFigures.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {era.keyFigures.map((figure, idx) => (
                        <div key={idx} className="p-4 bg-indigo-50 rounded-lg text-center">
                          <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl mx-auto mb-2">
                            {figure.charAt(0)}
                          </div>
                          <p className="font-medium text-indigo-900 text-sm">{figure}</p>
                        </div>
                      ))}
                    </div>
                  ) : figuresSection ? (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(figuresSection.content.slice(0, 2000)) }} />
                  ) : (
                    <p className="text-gray-500">No figures data available.</p>
                  )}
                </div>
              )}

              {/* Perspectives Tab */}
              {activeTab === 'perspectives' && (
                <div>
                  {perspectivesSection ? (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(perspectivesSection.content.slice(0, 3000)) }} />
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-500 mb-4">Multi-tradition perspectives on this era:</p>
                      {['Catholic', 'Orthodox', 'Protestant', 'Jewish', 'Academic'].map((tradition, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-biblical-deepblue mb-2">{tradition} Perspective</h4>
                          <p className="text-sm text-gray-600">
                            View the full era page for detailed {tradition.toLowerCase()} perspectives on this historical period.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {era && (
          <div className="flex-shrink-0 border-t bg-gray-50 p-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <Link
              href={`/era/${type}/${eraId}`}
              className="px-6 py-2 bg-biblical-gold text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              onClick={onClose}
            >
              Open Full Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-biblical-deepblue mt-4 mb-2">$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold text-gray-700 mt-3 mb-1">$1</h4>')
    // Bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-biblical-deepblue">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc mb-3">$&</ul>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-3">')
    // Wrap in paragraph
    .replace(/^(?!<)/, '<p class="mb-3">')
    .replace(/(?!>)$/, '</p>');
}
