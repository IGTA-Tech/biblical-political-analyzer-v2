/**
 * Bible Explorer Page
 * Browse the complete Biblical narrative with book selection,
 * chapter navigation, multi-version support, and AI study tools
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface BookContent {
  title: string;
  content: string;
  subsections: { title: string; content: string }[];
}

interface SearchResult {
  id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  text: string;
  translation: string;
  testament: string;
  themes: string[];
  similarity: number;
}

interface VerseComparison {
  reference: string;
  versions: { [key: string]: { text: string; name: string } };
}

interface StudyContent {
  reference: string;
  type: string;
  content: string;
}

// Bible structure data
const BIBLE_STRUCTURE = {
  oldTestament: {
    torah: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
    historical: ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'],
    wisdom: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'],
    majorProphets: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'],
    minorProphets: ['Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'],
  },
  newTestament: {
    gospels: ['Matthew', 'Mark', 'Luke', 'John'],
    history: ['Acts'],
    paulineEpistles: ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'],
    generalEpistles: ['Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'],
    apocalyptic: ['Revelation'],
  },
};

const AVAILABLE_TRANSLATIONS = [
  { code: 'kjv', name: 'King James Version', abbr: 'KJV' },
  { code: 'asv', name: 'American Standard', abbr: 'ASV' },
  { code: 'web', name: 'World English Bible', abbr: 'WEB' },
  { code: 'bbe', name: 'Basic English', abbr: 'BBE' },
  { code: 'ylt', name: "Young's Literal", abbr: 'YLT' },
];

const STUDY_TOOLS = [
  { type: 'explain', label: 'Explain', icon: '💡', description: 'Simple explanation' },
  { type: 'study-guide', label: 'Study Guide', icon: '📖', description: 'Full study guide' },
  { type: 'discussion', label: 'Discussion', icon: '💬', description: 'Group questions' },
  { type: 'context', label: 'Context', icon: '📜', description: 'Historical background' },
  { type: 'application', label: 'Apply', icon: '🎯', description: 'Practical application' },
];

const HISTORICAL_PERIODS = [
  { id: 'primeval', name: 'Primeval History', range: 'Creation - Abraham', books: ['Genesis 1-11'] },
  { id: 'patriarchal', name: 'Patriarchal Period', range: '~2000-1700 BCE', books: ['Genesis 12-50'] },
  { id: 'exodus', name: 'Exodus & Wilderness', range: '~1446-1406 BCE', books: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'] },
  { id: 'conquest', name: 'Conquest & Settlement', range: '~1406-1050 BCE', books: ['Joshua', 'Judges', 'Ruth'] },
  { id: 'united', name: 'United Monarchy', range: '~1050-930 BCE', books: ['1 Samuel', '2 Samuel', '1 Kings 1-11'] },
  { id: 'divided-north', name: 'Divided Kingdom (North)', range: '~930-722 BCE', books: ['1 Kings 12-22', '2 Kings 1-17'] },
  { id: 'divided-south', name: 'Divided Kingdom (South)', range: '~930-586 BCE', books: ['2 Kings 18-25', '2 Chronicles'] },
  { id: 'exile', name: 'Babylonian Exile', range: '586-539 BCE', books: ['Ezekiel', 'Daniel', 'Lamentations'] },
  { id: 'persian', name: 'Persian Period', range: '539-332 BCE', books: ['Ezra', 'Nehemiah', 'Esther'] },
  { id: 'intertestamental', name: 'Intertestamental Period', range: '400 BCE - 4 BCE', books: ['Apocrypha/Deuterocanon'] },
  { id: 'jesus', name: "Jesus' Ministry", range: '~4 BCE - 30 CE', books: ['Matthew', 'Mark', 'Luke', 'John'] },
  { id: 'early-church', name: 'Early Church', range: '30-100 CE', books: ['Acts', 'Epistles'] },
];

type ViewMode = 'books' | 'timeline' | 'themes' | 'search' | 'verse-lookup' | 'study';
type Testament = 'old' | 'new' | 'all';

export default function BibleExplorerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [testament, setTestament] = useState<Testament>('all');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Multi-version state
  const [verseReference, setVerseReference] = useState('');
  const [selectedTranslations, setSelectedTranslations] = useState(['kjv', 'web']);
  const [verseComparison, setVerseComparison] = useState<VerseComparison[] | null>(null);
  const [verseLoading, setVerseLoading] = useState(false);

  // AI Study Tools state
  const [studyReference, setStudyReference] = useState('');
  const [studyType, setStudyType] = useState('explain');
  const [studyContent, setStudyContent] = useState<StudyContent | null>(null);
  const [studyLoading, setStudyLoading] = useState(false);

  // Fetch verse in multiple translations
  const fetchVerseComparison = async () => {
    if (!verseReference) return;

    setVerseLoading(true);
    try {
      const translations = selectedTranslations.join(',');
      const res = await fetch(`/api/bible/verse?reference=${encodeURIComponent(verseReference)}&translations=${translations}&compare=true`);
      const data = await res.json();

      if (data.comparison) {
        setVerseComparison(data.comparison);
      } else if (data.translations) {
        // Convert to comparison format
        const comparison: VerseComparison[] = [];
        const firstTrans = Object.values(data.translations)[0] as any[];
        firstTrans.forEach((v: any, idx: number) => {
          const comp: VerseComparison = {
            reference: v.reference,
            versions: {}
          };
          for (const [trans, verses] of Object.entries(data.translations)) {
            const verse = (verses as any[])[idx];
            if (verse) {
              comp.versions[trans] = { text: verse.text, name: verse.translationName };
            }
          }
          comparison.push(comp);
        });
        setVerseComparison(comparison);
      }
    } catch (err) {
      console.error('Error fetching verse:', err);
    } finally {
      setVerseLoading(false);
    }
  };

  // Fetch AI study content
  const fetchStudyContent = async (reference?: string, type?: string) => {
    const ref = reference || studyReference;
    const studyToolType = type || studyType;
    if (!ref) return;

    setStudyLoading(true);
    setStudyReference(ref);
    setStudyType(studyToolType);
    setViewMode('study');

    try {
      const res = await fetch(`/api/study?reference=${encodeURIComponent(ref)}&type=${studyToolType}`);
      const data = await res.json();

      if (data.content) {
        setStudyContent(data);
      }
    } catch (err) {
      console.error('Error fetching study content:', err);
    } finally {
      setStudyLoading(false);
    }
  };

  // Semantic search handler
  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) return;

    setSearchLoading(true);
    setSearchPerformed(true);
    setViewMode('search');

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20',
      });
      if (testament !== 'all') {
        params.append('testament', testament === 'old' ? 'OT' : 'NT');
      }

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        console.error('Search error:', data.error);
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch book content when selected
  useEffect(() => {
    if (selectedBook) {
      setLoading(true);
      fetch(`/api/bible/${encodeURIComponent(selectedBook)}`)
        .then(res => res.json())
        .then(data => {
          setBookContent(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching book:', err);
          setLoading(false);
        });
    } else {
      setBookContent(null);
    }
  }, [selectedBook]);

  const filterBooks = (books: string[]) => {
    if (!searchQuery || viewMode !== 'books') return books;
    return books.filter(book =>
      book.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleTranslation = (code: string) => {
    setSelectedTranslations(prev => {
      if (prev.includes(code)) {
        return prev.length > 1 ? prev.filter(t => t !== code) : prev;
      }
      return [...prev, code];
    });
  };

  const BookCard = ({ book, category }: { book: string; category: string }) => (
    <button
      onClick={() => setSelectedBook(book)}
      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-lg ${
        selectedBook === book
          ? 'border-biblical-gold bg-amber-50'
          : 'border-gray-200 bg-white hover:border-biblical-deepblue'
      }`}
    >
      <h4 className="font-semibold text-biblical-deepblue">{book}</h4>
      <p className="text-xs text-gray-500 mt-1">{category}</p>
    </button>
  );

  const BookSection = ({ title, books, category }: { title: string; books: string[]; category: string }) => {
    const filtered = filterBooks(books);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-biblical-deepblue mb-3 border-b border-gray-200 pb-2">
          {title}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(book => (
            <BookCard key={book} book={book} category={category} />
          ))}
        </div>
      </div>
    );
  };

  // Verse card with study tools
  const VerseCard = ({ result }: { result: SearchResult }) => {
    const reference = `${result.book} ${result.chapter}:${result.verse_start}${result.verse_end !== result.verse_start ? `-${result.verse_end}` : ''}`;

    return (
      <div className="p-4 rounded-lg border border-gray-200 hover:border-biblical-gold hover:bg-amber-50 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-lg font-semibold text-biblical-deepblue">{reference}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                result.testament === 'OT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {result.testament}
              </span>
              <span className="text-xs text-gray-400">{result.translation}</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">{result.text}</p>

            {/* AI Study Tools */}
            <div className="flex flex-wrap gap-2">
              {STUDY_TOOLS.slice(0, 4).map(tool => (
                <button
                  key={tool.type}
                  onClick={() => fetchStudyContent(reference, tool.type)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-biblical-gold hover:text-white rounded-full transition-colors flex items-center gap-1"
                  title={tool.description}
                >
                  <span>{tool.icon}</span>
                  {tool.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setVerseReference(reference);
                  setViewMode('verse-lookup');
                  setTimeout(fetchVerseComparison, 100);
                }}
                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-500 hover:text-white text-blue-700 rounded-full transition-colors"
              >
                Compare Versions
              </button>
            </div>

            {result.themes && result.themes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {result.themes.map((theme) => (
                  <span key={theme} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {theme}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-biblical-gold">
              {(result.similarity * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">match</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Bible Explorer - Biblical Political Analyzer</title>
        <meta name="description" content="Explore the complete Biblical narrative with multi-version support, AI study tools, and semantic search." />
      </Head>

      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-biblical-deepblue mb-4">
            Bible Explorer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore Scripture with multiple translations, AI-powered study tools,
            and semantic search across 31,000+ verses.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">66</div>
            <div className="text-sm text-gray-600">Books</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">5</div>
            <div className="text-sm text-gray-600">Translations</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">31,102</div>
            <div className="text-sm text-gray-600">Verses</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">AI</div>
            <div className="text-sm text-gray-600">Study Tools</div>
          </div>
        </div>

        {/* View Controls */}
        <div className="card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="flex flex-wrap rounded-lg border border-gray-200 overflow-hidden">
              {[
                { id: 'books', label: 'By Book', icon: '📖' },
                { id: 'verse-lookup', label: 'Verse Lookup', icon: '🔎' },
                { id: 'timeline', label: 'Timeline', icon: '📅' },
                { id: 'search', label: 'Search', icon: '🔍' },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id as ViewMode)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === id
                      ? 'bg-biblical-deepblue text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Testament Filter */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {[
                { id: 'all', label: 'All' },
                { id: 'old', label: 'Old Testament' },
                { id: 'new', label: 'New Testament' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTestament(id as Testament)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    testament === id
                      ? 'bg-biblical-gold text-biblical-deepblue'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex gap-2">
              <input
                type="text"
                placeholder="Search verses semantically..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10 w-72"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={handleSearch}
                disabled={searchLoading || searchQuery.length < 3}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Verse Lookup View */}
        {viewMode === 'verse-lookup' && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-biblical-deepblue mb-6">Compare Bible Versions</h2>

            {/* Verse Input */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Verse Reference</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verseReference}
                    onChange={(e) => setVerseReference(e.target.value)}
                    placeholder="e.g., John 3:16 or Romans 8:28-30"
                    className="input-field flex-grow"
                    onKeyDown={(e) => e.key === 'Enter' && fetchVerseComparison()}
                  />
                  <button
                    onClick={fetchVerseComparison}
                    disabled={verseLoading || !verseReference}
                    className="btn-primary px-6 disabled:opacity-50"
                  >
                    {verseLoading ? 'Loading...' : 'Compare'}
                  </button>
                </div>
              </div>
            </div>

            {/* Translation Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Translations to Compare</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TRANSLATIONS.map(trans => (
                  <button
                    key={trans.code}
                    onClick={() => toggleTranslation(trans.code)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTranslations.includes(trans.code)
                        ? 'bg-biblical-deepblue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {trans.abbr}
                    <span className="hidden md:inline ml-1 text-xs opacity-75">({trans.name})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Results */}
            {verseLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-10 h-10 border-4 border-biblical-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Fetching verses...</p>
              </div>
            ) : verseComparison && verseComparison.length > 0 ? (
              <div className="space-y-6">
                {verseComparison.map((verse, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <div className="bg-biblical-deepblue text-white px-4 py-2 font-semibold">
                      {verse.reference}
                    </div>
                    <div className="divide-y">
                      {Object.entries(verse.versions).map(([code, data]) => (
                        <div key={code} className="p-4 hover:bg-amber-50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-biblical-gold text-white text-xs font-bold rounded">
                              {code.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">{data.name}</span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{data.text}</p>
                        </div>
                      ))}
                    </div>
                    {/* Study Tools for this verse */}
                    <div className="bg-gray-50 px-4 py-3 flex flex-wrap gap-2">
                      {STUDY_TOOLS.map(tool => (
                        <button
                          key={tool.type}
                          onClick={() => fetchStudyContent(verse.reference, tool.type)}
                          className="px-3 py-1 text-xs bg-white border border-gray-200 hover:border-biblical-gold hover:bg-amber-50 rounded-full transition-colors flex items-center gap-1"
                        >
                          <span>{tool.icon}</span>
                          {tool.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : verseReference && !verseLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Enter a verse reference and click Compare to see multiple translations.</p>
                <p className="text-sm mt-2">Examples: "John 3:16", "Psalm 23:1-6", "Romans 8:28"</p>
              </div>
            ) : null}
          </div>
        )}

        {/* AI Study View */}
        {viewMode === 'study' && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-biblical-deepblue">
                AI Study Tools
              </h2>
              <button
                onClick={() => setViewMode('search')}
                className="text-sm text-gray-500 hover:text-biblical-deepblue"
              >
                ← Back to Search
              </button>
            </div>

            {/* Study Type Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {STUDY_TOOLS.map(tool => (
                <button
                  key={tool.type}
                  onClick={() => {
                    setStudyType(tool.type);
                    if (studyReference) fetchStudyContent(studyReference, tool.type);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    studyType === tool.type
                      ? 'bg-biblical-deepblue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{tool.icon}</span>
                  {tool.label}
                </button>
              ))}
            </div>

            {/* Reference Input */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={studyReference}
                onChange={(e) => setStudyReference(e.target.value)}
                placeholder="Enter verse reference (e.g., John 3:16)"
                className="input-field flex-grow"
                onKeyDown={(e) => e.key === 'Enter' && fetchStudyContent()}
              />
              <button
                onClick={() => fetchStudyContent()}
                disabled={studyLoading || !studyReference}
                className="btn-primary px-6 disabled:opacity-50"
              >
                {studyLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {/* Study Content */}
            {studyLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-biblical-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Generating {studyType} for {studyReference}...</p>
                <p className="text-sm text-gray-400 mt-2">Using AI to create personalized study content</p>
              </div>
            ) : studyContent ? (
              <div className="bg-amber-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{STUDY_TOOLS.find(t => t.type === studyContent.type)?.icon}</span>
                  <h3 className="text-xl font-bold text-biblical-deepblue">{studyContent.reference}</h3>
                  <span className="px-2 py-1 bg-biblical-gold text-white text-xs rounded capitalize">
                    {studyContent.type.replace('-', ' ')}
                  </span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: studyContent.content
                      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-biblical-deepblue">$1</strong>')
                      .replace(/### ([^\n]+)/g, '<h3 class="text-lg font-semibold text-biblical-deepblue mt-4 mb-2">$1</h3>')
                      .replace(/## ([^\n]+)/g, '<h2 class="text-xl font-bold text-biblical-deepblue mt-6 mb-3">$1</h2>')
                      .replace(/\n- /g, '<br/>• ')
                      .replace(/\n\d+\. /g, (match) => `<br/>${match.trim()} `)
                      .replace(/\n\n/g, '</p><p class="mb-3">')
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a study tool and enter a verse reference to generate AI-powered study content.</p>
              </div>
            )}
          </div>
        )}

        {/* Books View */}
        {viewMode === 'books' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Book List */}
            <div className="lg:col-span-2">
              {(testament === 'all' || testament === 'old') && (
                <div className="card mb-6">
                  <h2 className="text-2xl font-bold text-biblical-deepblue mb-6 flex items-center">
                    <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 text-sm">OT</span>
                    Old Testament
                  </h2>
                  <BookSection title="Torah (Pentateuch)" books={BIBLE_STRUCTURE.oldTestament.torah} category="Law" />
                  <BookSection title="Historical Books" books={BIBLE_STRUCTURE.oldTestament.historical} category="History" />
                  <BookSection title="Wisdom Literature" books={BIBLE_STRUCTURE.oldTestament.wisdom} category="Wisdom" />
                  <BookSection title="Major Prophets" books={BIBLE_STRUCTURE.oldTestament.majorProphets} category="Prophecy" />
                  <BookSection title="Minor Prophets" books={BIBLE_STRUCTURE.oldTestament.minorProphets} category="Prophecy" />
                </div>
              )}

              {(testament === 'all' || testament === 'new') && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-biblical-deepblue mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-sm">NT</span>
                    New Testament
                  </h2>
                  <BookSection title="Gospels" books={BIBLE_STRUCTURE.newTestament.gospels} category="Gospel" />
                  <BookSection title="History" books={BIBLE_STRUCTURE.newTestament.history} category="History" />
                  <BookSection title="Pauline Epistles" books={BIBLE_STRUCTURE.newTestament.paulineEpistles} category="Epistle" />
                  <BookSection title="General Epistles" books={BIBLE_STRUCTURE.newTestament.generalEpistles} category="Epistle" />
                  <BookSection title="Apocalyptic" books={BIBLE_STRUCTURE.newTestament.apocalyptic} category="Prophecy" />
                </div>
              )}
            </div>

            {/* Book Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-biblical-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading {selectedBook}...</p>
                  </div>
                ) : selectedBook && bookContent ? (
                  <>
                    <h3 className="text-2xl font-bold text-biblical-deepblue mb-4">{selectedBook}</h3>
                    <div className="space-y-4">
                      {bookContent.subsections.length > 0 && (
                        <div className="bg-amber-50 rounded-lg p-4">
                          <h4 className="font-semibold text-amber-800 mb-2">Sections ({bookContent.subsections.length})</h4>
                          <ul className="text-sm text-gray-700 space-y-1 max-h-48 overflow-y-auto">
                            {bookContent.subsections.map((section, idx) => (
                              <li key={idx} className="truncate">• {section.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Quick Actions</h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setVerseReference(`${selectedBook} 1:1`);
                              setViewMode('verse-lookup');
                            }}
                            className="btn-secondary w-full text-sm"
                          >
                            Compare Translations
                          </button>
                          <button
                            onClick={() => {
                              setStudyReference(`${selectedBook} 1`);
                              setStudyType('context');
                              setViewMode('study');
                              fetchStudyContent(`${selectedBook} 1`, 'context');
                            }}
                            className="btn-primary w-full text-sm"
                          >
                            AI Study Guide
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500">Select a book to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-biblical-deepblue mb-6">Historical Timeline</h2>
            <div className="space-y-4">
              {HISTORICAL_PERIODS.map((period, index) => (
                <div
                  key={period.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-biblical-gold hover:bg-amber-50 transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-biblical-deepblue text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-biblical-deepblue">{period.name}</h3>
                    <p className="text-sm text-biblical-gold font-medium">{period.range}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Books: {period.books.join(', ')}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results View */}
        {viewMode === 'search' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-biblical-deepblue mb-6">
              Semantic Search Results
              {searchResults.length > 0 && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  ({searchResults.length} results for "{searchQuery}")
                </span>
              )}
            </h2>

            {searchLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-biblical-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Searching verses with AI...</p>
                <p className="text-sm text-gray-400 mt-2">Using semantic similarity to find relevant passages</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <VerseCard key={result.id} result={result} />
                ))}
              </div>
            ) : searchPerformed ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No verses found matching your search.</p>
                <p className="text-sm text-gray-400 mt-2">Try different keywords or phrases.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500">Enter a search query to find relevant Bible verses.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try concepts like "forgiveness", "love your enemies", or "creation of the world"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/people-explorer" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-biblical-gold rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <h3 className="font-semibold text-biblical-deepblue group-hover:text-biblical-gold transition-colors">
                  People Explorer
                </h3>
                <p className="text-sm text-gray-500">Explore Biblical characters</p>
              </div>
            </div>
          </Link>
          <Link href="/timeline" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-biblical-deepblue rounded-full flex items-center justify-center text-2xl text-white">
                📅
              </div>
              <div>
                <h3 className="font-semibold text-biblical-deepblue group-hover:text-biblical-gold transition-colors">
                  Timeline Viewer
                </h3>
                <p className="text-sm text-gray-500">Interactive Biblical timeline</p>
              </div>
            </div>
          </Link>
          <Link href="/comparative-views" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-2xl text-white">
                ⚖️
              </div>
              <div>
                <h3 className="font-semibold text-biblical-deepblue group-hover:text-biblical-gold transition-colors">
                  Comparative Views
                </h3>
                <p className="text-sm text-gray-500">Multiple perspectives</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
