/**
 * People Explorer Page
 * Explore Biblical characters, their journeys, relationships, and appearances
 * With interactive relationship graph visualization
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CharacterRelationshipGraph from '@/components/CharacterRelationshipGraph';

type Category = 'all' | 'patriarch' | 'matriarch' | 'king' | 'queen' | 'prophet' | 'priest' | 'apostle' | 'disciple' | 'leader' | 'judge';
type ViewMode = 'list' | 'graph';

interface Character {
  id?: string;
  name: string;
  title?: string;
  era: string;
  testament?: string;
  category: string;
  books: string[];
  appearance_count?: number;
  appearances?: number;
  significance?: string;
  biography?: string;
  major_events?: string[];
  character_traits?: string[];
  alternate_names?: string[];
}

interface GraphNode {
  id: string;
  name: string;
  title?: string;
  category: string;
  era?: string;
  testament?: string;
}

export default function PeopleExplorerPage() {
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [graphCenter, setGraphCenter] = useState<string | undefined>(undefined);
  const [relationshipFilter, setRelationshipFilter] = useState<string[]>([]);

  // Fetch characters from API
  useEffect(() => {
    setLoading(true);
    fetch('/api/people')
      .then(res => res.json())
      .then(data => {
        if (data.characters) {
          setCharacters(data.characters);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching people:', err);
        setLoading(false);
      });
  }, []);

  const getFilteredCharacters = (): Character[] => {
    let chars = [...characters];

    // Filter by category
    if (category !== 'all') {
      chars = chars.filter(c => c.category === category);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      chars = chars.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query) ||
        c.significance?.toLowerCase().includes(query) ||
        c.alternate_names?.some(n => n.toLowerCase().includes(query))
      );
    }

    // Sort by appearance count
    return chars.sort((a, b) => (b.appearance_count || b.appearances || 0) - (a.appearance_count || a.appearances || 0));
  };

  const handleNodeClick = (node: GraphNode) => {
    // Find the character data
    const char = characters.find(c => c.name === node.name);
    if (char) {
      setSelectedPerson(char);
    }
    setGraphCenter(node.name);
  };

  const handleViewRelationships = (character: Character) => {
    setGraphCenter(character.name);
    setViewMode('graph');
  };

  const categories = [
    { id: 'all', label: 'All', icon: '👥' },
    { id: 'patriarch', label: 'Patriarchs', icon: '👴' },
    { id: 'matriarch', label: 'Matriarchs', icon: '👵' },
    { id: 'king', label: 'Kings', icon: '👑' },
    { id: 'queen', label: 'Queens', icon: '👸' },
    { id: 'prophet', label: 'Prophets', icon: '📜' },
    { id: 'priest', label: 'Priests', icon: '⛪' },
    { id: 'apostle', label: 'Apostles', icon: '✝️' },
    { id: 'judge', label: 'Judges', icon: '⚖️' },
    { id: 'leader', label: 'Leaders', icon: '🏛️' },
  ];

  const relationshipTypes = [
    { id: 'spouse', label: 'Spouse', color: 'pink' },
    { id: 'parent', label: 'Parent/Child', color: 'blue' },
    { id: 'sibling', label: 'Siblings', color: 'violet' },
    { id: 'friend', label: 'Friends', color: 'green' },
    { id: 'mentor', label: 'Mentor/Student', color: 'amber' },
    { id: 'enemy', label: 'Enemies', color: 'red' },
  ];

  const CharacterCard = ({ character }: { character: Character }) => (
    <div
      onClick={() => setSelectedPerson(character)}
      className={`card cursor-pointer hover:shadow-lg transition-all ${
        selectedPerson?.name === character.name ? 'ring-2 ring-biblical-gold' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-biblical-deepblue to-biblical-gold rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {character.name.charAt(0)}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-biblical-deepblue text-lg">{character.name}</h3>
          {character.title && <p className="text-sm text-biblical-gold font-medium">{character.title}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
              {character.era}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {character.appearance_count || character.appearances || 0} mentions
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
              {character.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>People Explorer - Biblical Political Analyzer</title>
        <meta name="description" content="Explore Biblical characters, their journeys, relationships, and appearances throughout Scripture." />
      </Head>

      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-biblical-deepblue mb-4">
            People Explorer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover Biblical characters, trace their journeys through Scripture,
            and explore their relationships and significance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">{characters.length || '50+'}</div>
            <div className="text-sm text-gray-600">Key Characters</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">66</div>
            <div className="text-sm text-gray-600">Books Covered</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">4,000+</div>
            <div className="text-sm text-gray-600">Years of History</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">12</div>
            <div className="text-sm text-gray-600">Historical Periods</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="card mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-biblical-deepblue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List View
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'graph'
                    ? 'bg-biblical-deepblue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Relationship Graph
              </button>
            </div>

            {graphCenter && viewMode === 'graph' && (
              <button
                onClick={() => setGraphCenter(undefined)}
                className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Show All (centered on: {graphCenter})
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id as Category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === id
                      ? 'bg-biblical-deepblue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-64"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Relationship Filters (Graph mode only) */}
          {viewMode === 'graph' && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Filter by relationship type:</p>
              <div className="flex flex-wrap gap-2">
                {relationshipTypes.map(({ id, label, color }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setRelationshipFilter(prev =>
                        prev.includes(id)
                          ? prev.filter(t => t !== id)
                          : [...prev, id]
                      );
                    }}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      relationshipFilter.length === 0 || relationshipFilter.includes(id)
                        ? `bg-${color}-100 text-${color}-800 ring-2 ring-${color}-300`
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {relationshipFilter.length > 0 && (
                  <button
                    onClick={() => setRelationshipFilter([])}
                    className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {viewMode === 'graph' ? (
          /* Graph View */
          <div className="card p-0 overflow-hidden">
            <CharacterRelationshipGraph
              centeredCharacter={graphCenter}
              onNodeClick={handleNodeClick}
              height={600}
              showLegend={true}
              relationshipFilter={relationshipFilter.length > 0 ? relationshipFilter : undefined}
            />
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Character List */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-biblical-gold border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredCharacters().map(character => (
                    <CharacterCard key={character.name} character={character} />
                  ))}
                  {getFilteredCharacters().length === 0 && (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      No characters found matching your criteria
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Detail Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-4">
                {selectedPerson ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-biblical-deepblue to-biblical-gold rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                        {selectedPerson.name.charAt(0)}
                      </div>
                      <h2 className="text-2xl font-bold text-biblical-deepblue">{selectedPerson.name}</h2>
                      {selectedPerson.title && (
                        <p className="text-biblical-gold font-medium">{selectedPerson.title}</p>
                      )}
                      {selectedPerson.alternate_names && selectedPerson.alternate_names.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Also known as: {selectedPerson.alternate_names.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedPerson.significance && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Significance</h4>
                          <p className="text-gray-700 text-sm">{selectedPerson.significance}</p>
                        </div>
                      )}

                      <div className="bg-amber-50 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-800 mb-2">Era</h4>
                        <p className="text-gray-700">{selectedPerson.era}</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Appears In</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPerson.books.map(book => (
                            <span key={book} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {book}
                            </span>
                          ))}
                        </div>
                      </div>

                      {selectedPerson.major_events && selectedPerson.major_events.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Major Events</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedPerson.major_events.slice(0, 5).map((event, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                {event}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedPerson.character_traits && selectedPerson.character_traits.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-800 mb-2">Character Traits</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPerson.character_traits.map((trait, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-indigo-50 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-800 mb-2">Scripture References</h4>
                        <p className="text-gray-700">
                          {selectedPerson.appearance_count || selectedPerson.appearances || 0} mentions in Scripture
                        </p>
                      </div>

                      <button
                        onClick={() => handleViewRelationships(selectedPerson)}
                        className="btn-primary w-full"
                      >
                        View Relationships
                      </button>
                      <Link
                        href={`/timeline?person=${encodeURIComponent(selectedPerson.name)}`}
                        className="btn-secondary w-full text-center block"
                      >
                        See on Timeline
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
                      👤
                    </div>
                    <p className="text-gray-500">Select a person to view their details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/bible-explorer" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <h3 className="font-semibold text-biblical-deepblue group-hover:text-biblical-gold transition-colors">
                  Bible Explorer
                </h3>
                <p className="text-sm text-gray-500">Browse by book</p>
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
                <p className="text-sm text-gray-500">See when they lived</p>
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
                <p className="text-sm text-gray-500">Different perspectives</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
