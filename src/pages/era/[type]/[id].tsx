/**
 * Era Detail Page
 * Full page view for Christian or Jewish historical era
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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

export default function EraDetailPage() {
  const router = useRouter();
  const { type, id } = router.query;

  const [era, setEra] = useState<EraContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (id && type) {
      setLoading(true);
      fetch(`/api/timeline/${id}?type=${type}`)
        .then(res => {
          if (!res.ok) throw new Error('Era not found');
          return res.json();
        })
        .then(data => {
          setEra(data);
          setLoading(false);
          // Set first section as active
          if (data.sections?.length > 0) {
            setActiveSection(data.sections[0].title);
          }
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-biblical-gold border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading era content...</p>
        </div>
      </div>
    );
  }

  if (error || !era) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Era Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested era could not be found.'}</p>
          <Link
            href="/timeline"
            className="px-6 py-3 bg-biblical-deepblue text-white rounded-lg hover:bg-biblical-gold transition-colors"
          >
            Back to Timeline
          </Link>
        </div>
      </div>
    );
  }

  // Filter sections to show
  const mainSections = era.sections.filter(s =>
    !s.title.toLowerCase().includes('table of contents') &&
    s.title.trim().length > 0
  );

  return (
    <>
      <Head>
        <title>{era.title} - Biblical Political Analyzer</title>
        <meta name="description" content={`Explore ${era.title} (${era.dateRange}) - ${type === 'christian' ? 'Christian' : 'Jewish'} historical period.`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-biblical-gold">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/timeline" className="hover:text-biblical-gold">Timeline</Link>
            </li>
            <li>/</li>
            <li>
              <span className="capitalize">{type}</span>
            </li>
            <li>/</li>
            <li className="text-biblical-deepblue font-medium">{era.title}</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-4">
              <div className="card mb-4">
                <h2 className="font-bold text-biblical-deepblue mb-3">Contents</h2>
                <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                  {mainSections.map((section, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSection(section.title);
                        document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                        activeSection === section.title
                          ? 'bg-biblical-gold text-white'
                          : 'text-gray-600 hover:bg-amber-50'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Key Figures */}
              {era.keyFigures.length > 0 && (
                <div className="card mb-4">
                  <h3 className="font-semibold text-biblical-deepblue mb-2 text-sm">Key Figures</h3>
                  <div className="flex flex-wrap gap-1">
                    {era.keyFigures.slice(0, 8).map((figure, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                        {figure}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <Link
                href="/timeline"
                className="flex items-center gap-2 px-4 py-2 text-sm text-biblical-deepblue hover:text-biblical-gold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Timeline
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  type === 'christian' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {type === 'christian' ? '✝️ Christian' : '✡️ Jewish'} History
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {era.dateRange}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-biblical-deepblue mb-4">
                {era.title}
              </h1>
            </header>

            {/* Sections */}
            <div className="space-y-8">
              {mainSections.map((section, idx) => (
                <section
                  key={idx}
                  id={`section-${idx}`}
                  className="card scroll-mt-4"
                >
                  <h2 className="text-xl font-bold text-biblical-deepblue mb-4 pb-2 border-b border-gray-200">
                    {section.title}
                  </h2>
                  <div className="prose prose-sm max-w-none text-gray-700 era-content">
                    {renderMarkdownContent(section.content)}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer Navigation */}
            <div className="mt-12 flex items-center justify-between">
              <Link
                href="/timeline"
                className="px-6 py-3 border border-biblical-deepblue text-biblical-deepblue rounded-lg hover:bg-biblical-deepblue hover:text-white transition-colors"
              >
                ← Back to Timeline
              </Link>
              <Link
                href="/comparative-views"
                className="px-6 py-3 bg-biblical-gold text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Compare Traditions →
              </Link>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        .era-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e3a5f;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .era-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .era-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .era-content ul, .era-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .era-content li {
          margin-bottom: 0.5rem;
        }
        .era-content blockquote {
          border-left: 4px solid #d4a853;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
        }
        .era-content strong {
          color: #1e3a5f;
        }
        .era-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .era-content th, .era-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        .era-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}

// Simple markdown-to-HTML renderer
function renderMarkdownContent(content: string) {
  // Split by paragraphs and render
  const paragraphs = content.split('\n\n');

  return paragraphs.map((para, idx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Headers
    if (trimmed.startsWith('### ')) {
      return <h3 key={idx}>{trimmed.replace('### ', '')}</h3>;
    }
    if (trimmed.startsWith('#### ')) {
      return <h4 key={idx}>{trimmed.replace('#### ', '')}</h4>;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      return (
        <blockquote key={idx}>
          {trimmed.split('\n').map(line => line.replace(/^>\s*/, '')).join(' ')}
        </blockquote>
      );
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'));
      return (
        <ul key={idx}>
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item.replace(/^[-*]\s+/, '')) }} />
          ))}
        </ul>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
      return (
        <ol key={idx}>
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item.replace(/^\d+\.\s+/, '')) }} />
          ))}
        </ol>
      );
    }

    // Table (simple detection)
    if (trimmed.includes('|') && trimmed.includes('\n')) {
      const lines = trimmed.split('\n').filter(l => l.includes('|'));
      if (lines.length > 1) {
        const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
        const rows = lines.slice(2).map(row => row.split('|').map(c => c.trim()).filter(Boolean));
        return (
          <table key={idx}>
            <thead>
              <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        );
      }
    }

    // Regular paragraph
    return <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />;
  });
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
}
