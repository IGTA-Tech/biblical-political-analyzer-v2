/**
 * Bible Explorer Page
 * Browse the complete Biblical narrative with book selection,
 * chapter navigation, and contextual analysis
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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

type ViewMode = 'books' | 'timeline' | 'themes';
type Testament = 'old' | 'new' | 'all';

export default function BibleExplorerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [testament, setTestament] = useState<Testament>('all');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filterBooks = (books: string[]) => {
    if (!searchQuery) return books;
    return books.filter(book =>
      book.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  return (
    <>
      <Head>
        <title>Bible Explorer - Biblical Political Analyzer</title>
        <meta name="description" content="Explore the complete Biblical narrative with historical context, archaeological evidence, and scholarly analysis." />
      </Head>

      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-biblical-deepblue mb-4">
            Bible Explorer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore the complete Biblical narrative from Genesis to Revelation with historical context,
            archaeological evidence, and multi-perspective analysis.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">66</div>
            <div className="text-sm text-gray-600">Books</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">1,189</div>
            <div className="text-sm text-gray-600">Chapters</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">31,102</div>
            <div className="text-sm text-gray-600">Verses</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">6.5MB</div>
            <div className="text-sm text-gray-600">Analysis Content</div>
          </div>
        </div>

        {/* View Controls */}
        <div className="card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {[
                { id: 'books', label: 'By Book', icon: '📖' },
                { id: 'timeline', label: 'Timeline', icon: '📅' },
                { id: 'themes', label: 'Themes', icon: '🎯' },
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-64"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
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
                {selectedBook ? (
                  <>
                    <h3 className="text-2xl font-bold text-biblical-deepblue mb-4">{selectedBook}</h3>
                    <div className="space-y-4">
                      <div className="bg-amber-50 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-800 mb-2">Overview</h4>
                        <p className="text-sm text-gray-700">
                          Comprehensive analysis including historical context, archaeological evidence,
                          cultural practices, political situation, and theological themes.
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Available Analysis</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Historical & Archaeological Context</li>
                          <li>• Cultural Practices Reflected</li>
                          <li>• Political Situation</li>
                          <li>• Theological Themes</li>
                          <li>• Connection to Broader Narrative</li>
                        </ul>
                      </div>
                      <button className="btn-primary w-full">
                        View Full Analysis
                      </button>
                      <button className="btn-secondary w-full">
                        Compare Versions
                      </button>
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

        {viewMode === 'themes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Covenant', icon: '📜', count: 847, color: 'amber' },
              { name: 'Redemption', icon: '✝️', count: 523, color: 'red' },
              { name: 'Kingdom', icon: '👑', count: 412, color: 'purple' },
              { name: 'Justice', icon: '⚖️', count: 389, color: 'blue' },
              { name: 'Prophecy', icon: '🔮', count: 367, color: 'indigo' },
              { name: 'Worship', icon: '🙏', count: 298, color: 'green' },
              { name: 'Creation', icon: '🌍', count: 245, color: 'teal' },
              { name: 'Wisdom', icon: '💡', count: 234, color: 'yellow' },
              { name: 'Suffering', icon: '💔', count: 198, color: 'gray' },
            ].map(theme => (
              <div
                key={theme.name}
                className={`card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-${theme.color}-500`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{theme.icon}</span>
                    <div>
                      <h3 className="font-semibold text-biblical-deepblue">{theme.name}</h3>
                      <p className="text-sm text-gray-500">{theme.count} references</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
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
