/**
 * Comparative Views Page
 * Compare different theological perspectives and traditions
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface SearchResult {
  id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  text: string;
  testament: string;
  themes: string[];
  similarity: number;
}

// Sample comparative data
const PERSPECTIVES = {
  christianTraditions: [
    {
      name: 'Catholic',
      icon: '⛪',
      color: 'purple',
      description: 'Roman Catholic tradition emphasizing apostolic succession and sacramental theology',
      keyBeliefs: ['Papal authority', 'Seven sacraments', 'Tradition + Scripture', 'Marian devotion'],
      sources: ['Catechism', 'Church Fathers', 'Magisterium'],
    },
    {
      name: 'Orthodox',
      icon: '☦️',
      color: 'blue',
      description: 'Eastern Orthodox tradition emphasizing theosis and liturgical worship',
      keyBeliefs: ['Ecumenical councils', 'Theosis', 'Icons', 'Divine Liturgy'],
      sources: ['Church Fathers', 'Ecumenical Councils', 'Philokalia'],
    },
    {
      name: 'Protestant',
      icon: '✝️',
      color: 'amber',
      description: 'Reformed tradition emphasizing Scripture alone and justification by faith',
      keyBeliefs: ['Sola Scriptura', 'Sola Fide', 'Priesthood of believers', 'Two sacraments'],
      sources: ['Scripture', 'Reformers', 'Confessions'],
    },
    {
      name: 'Evangelical',
      icon: '📖',
      color: 'green',
      description: 'Evangelical emphasis on personal conversion and biblical authority',
      keyBeliefs: ['Biblical inerrancy', 'Born again experience', 'Great Commission', 'Personal relationship'],
      sources: ['Scripture', 'Contemporary scholars', 'Missionary tradition'],
    },
  ],
  jewishTraditions: [
    {
      name: 'Orthodox',
      icon: '✡️',
      color: 'blue',
      description: 'Traditional Judaism emphasizing halakha and Torah observance',
      keyBeliefs: ['Torah from Sinai', 'Halakha binding', 'Messianic hope', 'Rabbinic authority'],
      sources: ['Torah', 'Talmud', 'Shulchan Aruch'],
    },
    {
      name: 'Conservative',
      icon: '📜',
      color: 'green',
      description: 'Conservative Judaism balancing tradition with historical scholarship',
      keyBeliefs: ['Historical development', 'Halakha evolving', 'Zionism', 'Egalitarianism'],
      sources: ['Torah', 'Talmud', 'Modern scholarship'],
    },
    {
      name: 'Reform',
      icon: '🕯️',
      color: 'amber',
      description: 'Reform Judaism emphasizing ethical monotheism and modern adaptation',
      keyBeliefs: ['Ethical emphasis', 'Autonomy', 'Social justice', 'Progressive revelation'],
      sources: ['Torah', 'Prophets', 'Modern thought'],
    },
    {
      name: 'Academic',
      icon: '🎓',
      color: 'gray',
      description: 'Scholarly approach using historical-critical methods',
      keyBeliefs: ['Historical criticism', 'Documentary hypothesis', 'Archaeological evidence', 'Comparative religion'],
      sources: ['Ancient texts', 'Archaeology', 'Peer-reviewed scholarship'],
    },
  ],
  topics: [
    {
      name: 'Creation',
      description: 'Origin of the universe and humanity',
      passages: ['Genesis 1-2', 'John 1:1-3', 'Colossians 1:16'],
    },
    {
      name: 'Covenant',
      description: 'God\'s relationship with His people',
      passages: ['Genesis 15', 'Exodus 19-24', 'Jeremiah 31:31-34', 'Hebrews 8'],
    },
    {
      name: 'Messiah',
      description: 'The anointed deliverer',
      passages: ['Isaiah 53', 'Daniel 9', 'Matthew 16:16', 'Acts 2:36'],
    },
    {
      name: 'Salvation',
      description: 'How people are reconciled to God',
      passages: ['Romans 3-5', 'Ephesians 2:8-9', 'James 2:14-26'],
    },
    {
      name: 'Afterlife',
      description: 'What happens after death',
      passages: ['Daniel 12:2', 'John 14:1-6', 'Revelation 21-22'],
    },
    {
      name: 'Law & Grace',
      description: 'Relationship between Torah and Gospel',
      passages: ['Matthew 5:17-20', 'Romans 7', 'Galatians 3'],
    },
  ],
};

type ViewMode = 'traditions' | 'topics' | 'side-by-side';
type TraditionType = 'christian' | 'jewish' | 'all';

export default function ComparativeViewsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('traditions');
  const [traditionType, setTraditionType] = useState<TraditionType>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [topicVerses, setTopicVerses] = useState<SearchResult[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);

  // Fetch related verses when a topic is selected
  useEffect(() => {
    if (selectedTopic) {
      const fetchTopicVerses = async () => {
        setVersesLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(selectedTopic)}&limit=8`);
          const data = await response.json();
          if (data.success) {
            setTopicVerses(data.results);
          }
        } catch (error) {
          console.error('Error fetching topic verses:', error);
        }
        setVersesLoading(false);
      };
      fetchTopicVerses();
    } else {
      setTopicVerses([]);
    }
  }, [selectedTopic]);

  const toggleTradition = (name: string) => {
    setSelectedTraditions(prev =>
      prev.includes(name)
        ? prev.filter(t => t !== name)
        : prev.length < 3 ? [...prev, name] : prev
    );
  };

  const getAllTraditions = () => {
    if (traditionType === 'christian') return PERSPECTIVES.christianTraditions;
    if (traditionType === 'jewish') return PERSPECTIVES.jewishTraditions;
    return [...PERSPECTIVES.christianTraditions, ...PERSPECTIVES.jewishTraditions];
  };

  const TraditionCard = ({ tradition }: { tradition: typeof PERSPECTIVES.christianTraditions[0] }) => {
    const isSelected = selectedTraditions.includes(tradition.name);
    return (
      <div
        onClick={() => toggleTradition(tradition.name)}
        className={`card cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-biblical-gold bg-amber-50' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-full bg-${tradition.color}-100 flex items-center justify-center text-3xl flex-shrink-0`}>
            {tradition.icon}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-biblical-deepblue text-lg">{tradition.name}</h3>
              {isSelected && (
                <span className="px-2 py-0.5 bg-biblical-gold text-white text-xs rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{tradition.description}</p>
            <div className="flex flex-wrap gap-1">
              {tradition.keyBeliefs.slice(0, 3).map(belief => (
                <span key={belief} className={`px-2 py-0.5 bg-${tradition.color}-100 text-${tradition.color}-800 text-xs rounded`}>
                  {belief}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Comparative Views - Biblical Political Analyzer</title>
        <meta name="description" content="Compare different theological perspectives and traditions on Biblical topics." />
      </Head>

      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-biblical-deepblue mb-4">
            Comparative Views
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore how different faith traditions interpret Scripture and theological concepts.
            Compare perspectives side-by-side for deeper understanding.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">8</div>
            <div className="text-sm text-gray-600">Traditions</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">6</div>
            <div className="text-sm text-gray-600">Key Topics</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">50+</div>
            <div className="text-sm text-gray-600">Passages</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-biblical-gold">2,000</div>
            <div className="text-sm text-gray-600">Years of Thought</div>
          </div>
        </div>

        {/* View Controls */}
        <div className="card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Mode */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {[
                { id: 'traditions', label: 'By Tradition', icon: '⛪' },
                { id: 'topics', label: 'By Topic', icon: '📋' },
                { id: 'side-by-side', label: 'Compare', icon: '⚖️' },
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

            {/* Tradition Filter */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {[
                { id: 'all', label: 'All' },
                { id: 'christian', label: 'Christian' },
                { id: 'jewish', label: 'Jewish' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTraditionType(id as TraditionType)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    traditionType === id
                      ? 'bg-biblical-gold text-biblical-deepblue'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'side-by-side' && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Compare Mode:</strong> Select up to 3 traditions below to compare side-by-side.
                {selectedTraditions.length > 0 && (
                  <span className="ml-2">
                    Selected: {selectedTraditions.join(', ')}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        {viewMode === 'traditions' && (
          <>
            {(traditionType === 'all' || traditionType === 'christian') && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-biblical-deepblue mb-4 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-lg">✝️</span>
                  Christian Traditions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERSPECTIVES.christianTraditions.map(tradition => (
                    <TraditionCard key={tradition.name} tradition={tradition} />
                  ))}
                </div>
              </div>
            )}

            {(traditionType === 'all' || traditionType === 'jewish') && (
              <div>
                <h2 className="text-2xl font-bold text-biblical-deepblue mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-lg">✡️</span>
                  Jewish Traditions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERSPECTIVES.jewishTraditions.map(tradition => (
                    <TraditionCard key={tradition.name} tradition={tradition} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === 'topics' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PERSPECTIVES.topics.map(topic => (
                <div
                  key={topic.name}
                  onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                  className={`card cursor-pointer hover:shadow-lg transition-all ${
                    selectedTopic === topic.name ? 'ring-2 ring-biblical-gold' : ''
                  }`}
                >
                  <h3 className="text-xl font-bold text-biblical-deepblue mb-2">{topic.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">Key Passages</h4>
                    <div className="flex flex-wrap gap-1">
                      {topic.passages.map(passage => (
                        <span key={passage} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded">
                          {passage}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedTopic === topic.name && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                      <span className="text-sm text-biblical-gold font-medium">Selected - See verses below</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Related Verses Section */}
            {selectedTopic && (
              <div className="mt-8">
                <div className="card">
                  <h3 className="text-xl font-bold text-biblical-deepblue mb-4">
                    Related Verses: {selectedTopic}
                  </h3>

                  {versesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biblical-gold"></div>
                      <span className="ml-3 text-gray-600">Searching for relevant verses...</span>
                    </div>
                  ) : topicVerses.length > 0 ? (
                    <div className="space-y-4">
                      {topicVerses.map((verse) => (
                        <div key={verse.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-biblical-deepblue">
                              {verse.book} {verse.chapter}:{verse.verse_start}
                              {verse.verse_end !== verse.verse_start && `-${verse.verse_end}`}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                verse.testament === 'OT'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {verse.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                              </span>
                              {verse.similarity && (
                                <span className="text-xs text-gray-500">
                                  {Math.round(verse.similarity * 100)}% match
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 italic">&ldquo;{verse.text}&rdquo;</p>
                          {verse.themes && verse.themes.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {verse.themes.slice(0, 4).map(theme => (
                                <span key={theme} className="px-2 py-0.5 bg-biblical-gold/10 text-biblical-deepblue text-xs rounded">
                                  {theme}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No verses found for this topic yet.</p>
                      <p className="text-sm mt-1">Database is still being populated with Bible verses.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'side-by-side' && (
          <div>
            {/* Tradition Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {getAllTraditions().map(tradition => (
                <button
                  key={tradition.name}
                  onClick={() => toggleTradition(tradition.name)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTraditions.includes(tradition.name)
                      ? 'border-biblical-gold bg-amber-50'
                      : 'border-gray-200 bg-white hover:border-biblical-deepblue'
                  }`}
                >
                  <div className="text-2xl mb-2">{tradition.icon}</div>
                  <div className="font-medium text-biblical-deepblue text-sm">{tradition.name}</div>
                </button>
              ))}
            </div>

            {/* Comparison Table */}
            {selectedTraditions.length >= 2 && (
              <div className="card overflow-x-auto">
                <h3 className="text-xl font-bold text-biblical-deepblue mb-4">Side-by-Side Comparison</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Aspect</th>
                      {selectedTraditions.map(name => {
                        const tradition = getAllTraditions().find(t => t.name === name);
                        return (
                          <th key={name} className="text-left py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{tradition?.icon}</span>
                              <span className="font-semibold text-biblical-deepblue">{name}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-700">Key Beliefs</td>
                      {selectedTraditions.map(name => {
                        const tradition = getAllTraditions().find(t => t.name === name);
                        return (
                          <td key={name} className="py-3 px-4">
                            <ul className="text-sm text-gray-600 space-y-1">
                              {tradition?.keyBeliefs.map(belief => (
                                <li key={belief}>• {belief}</li>
                              ))}
                            </ul>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-700">Primary Sources</td>
                      {selectedTraditions.map(name => {
                        const tradition = getAllTraditions().find(t => t.name === name);
                        return (
                          <td key={name} className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {tradition?.sources.map(source => (
                                <span key={source} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                  {source}
                                </span>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {selectedTraditions.length < 2 && (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-biblical-deepblue mb-2">
                  Select Traditions to Compare
                </h3>
                <p className="text-gray-500">
                  Choose at least 2 traditions above to see a side-by-side comparison.
                </p>
              </div>
            )}
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
                <p className="text-sm text-gray-500">Browse Scripture</p>
              </div>
            </div>
          </Link>
          <Link href="/people-explorer" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-biblical-gold rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <h3 className="font-semibold text-biblical-deepblue group-hover:text-biblical-gold transition-colors">
                  People Explorer
                </h3>
                <p className="text-sm text-gray-500">Biblical characters</p>
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
                <p className="text-sm text-gray-500">Historical events</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
