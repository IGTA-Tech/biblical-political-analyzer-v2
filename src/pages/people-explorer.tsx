/**
 * People Explorer Page
 * Explore Biblical characters, their journeys, relationships, and appearances
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Sample Biblical characters data
const BIBLICAL_CHARACTERS = {
  patriarchs: [
    { name: 'Abraham', title: 'Father of Faith', era: 'Patriarchal', books: ['Genesis'], appearances: 312, relations: ['Sarah', 'Isaac', 'Ishmael', 'Lot'] },
    { name: 'Isaac', title: 'Son of Promise', era: 'Patriarchal', books: ['Genesis'], appearances: 127, relations: ['Abraham', 'Rebekah', 'Jacob', 'Esau'] },
    { name: 'Jacob', title: 'Israel', era: 'Patriarchal', books: ['Genesis'], appearances: 363, relations: ['Isaac', 'Rachel', 'Leah', '12 Sons'] },
    { name: 'Joseph', title: 'The Dreamer', era: 'Patriarchal', books: ['Genesis'], appearances: 213, relations: ['Jacob', 'Benjamin', 'Pharaoh'] },
  ],
  kings: [
    { name: 'David', title: 'King of Israel', era: 'United Monarchy', books: ['1-2 Samuel', '1 Kings', 'Psalms'], appearances: 1118, relations: ['Saul', 'Jonathan', 'Bathsheba', 'Solomon'] },
    { name: 'Solomon', title: 'Wisest King', era: 'United Monarchy', books: ['1 Kings', 'Proverbs', 'Ecclesiastes'], appearances: 295, relations: ['David', 'Bathsheba', 'Queen of Sheba'] },
    { name: 'Saul', title: 'First King', era: 'United Monarchy', books: ['1 Samuel'], appearances: 406, relations: ['Samuel', 'David', 'Jonathan'] },
    { name: 'Hezekiah', title: 'Faithful King', era: 'Divided Kingdom', books: ['2 Kings', 'Isaiah'], appearances: 128, relations: ['Isaiah', 'Sennacherib'] },
  ],
  prophets: [
    { name: 'Moses', title: 'Lawgiver', era: 'Exodus', books: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'], appearances: 847, relations: ['Aaron', 'Miriam', 'Pharaoh', 'Joshua'] },
    { name: 'Elijah', title: 'Prophet of Fire', era: 'Divided Kingdom', books: ['1-2 Kings'], appearances: 69, relations: ['Elisha', 'Ahab', 'Jezebel'] },
    { name: 'Isaiah', title: 'Messianic Prophet', era: 'Divided Kingdom', books: ['Isaiah', '2 Kings'], appearances: 37, relations: ['Hezekiah', 'Ahaz'] },
    { name: 'Jeremiah', title: 'Weeping Prophet', era: 'Exile', books: ['Jeremiah', 'Lamentations'], appearances: 147, relations: ['Baruch', 'Zedekiah'] },
    { name: 'Daniel', title: 'Prophet of Dreams', era: 'Exile', books: ['Daniel'], appearances: 75, relations: ['Nebuchadnezzar', 'Shadrach', 'Meshach', 'Abednego'] },
  ],
  newTestament: [
    { name: 'Jesus', title: 'Son of God', era: 'Ministry', books: ['Gospels', 'Acts', 'Revelation'], appearances: 1281, relations: ['Mary', 'Joseph', '12 Disciples'] },
    { name: 'Peter', title: 'The Rock', era: 'Early Church', books: ['Gospels', 'Acts', '1-2 Peter'], appearances: 195, relations: ['Jesus', 'Andrew', 'Paul'] },
    { name: 'Paul', title: 'Apostle to Gentiles', era: 'Early Church', books: ['Acts', 'Epistles'], appearances: 185, relations: ['Barnabas', 'Timothy', 'Silas'] },
    { name: 'John', title: 'Beloved Disciple', era: 'Early Church', books: ['Gospel of John', '1-3 John', 'Revelation'], appearances: 38, relations: ['Jesus', 'James', 'Peter'] },
    { name: 'Mary', title: 'Mother of Jesus', era: 'Ministry', books: ['Gospels', 'Acts'], appearances: 19, relations: ['Jesus', 'Joseph', 'Elizabeth'] },
  ],
  women: [
    { name: 'Sarah', title: 'Mother of Nations', era: 'Patriarchal', books: ['Genesis'], appearances: 56, relations: ['Abraham', 'Isaac', 'Hagar'] },
    { name: 'Ruth', title: 'The Faithful', era: 'Judges', books: ['Ruth'], appearances: 13, relations: ['Naomi', 'Boaz', 'Obed'] },
    { name: 'Esther', title: 'Queen of Persia', era: 'Persian', books: ['Esther'], appearances: 55, relations: ['Mordecai', 'Xerxes', 'Haman'] },
    { name: 'Deborah', title: 'Judge & Prophetess', era: 'Judges', books: ['Judges'], appearances: 9, relations: ['Barak', 'Jael'] },
  ],
};

type Category = 'all' | 'patriarchs' | 'kings' | 'prophets' | 'newTestament' | 'women';

interface Character {
  name: string;
  title: string;
  era: string;
  books: string[];
  appearances: number;
  relations: string[];
}

export default function PeopleExplorerPage() {
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Character | null>(null);

  const getAllCharacters = (): Character[] => {
    const all: Character[] = [];
    Object.values(BIBLICAL_CHARACTERS).forEach(group => {
      all.push(...group);
    });
    return all;
  };

  const getFilteredCharacters = (): Character[] => {
    let chars = category === 'all'
      ? getAllCharacters()
      : BIBLICAL_CHARACTERS[category as keyof typeof BIBLICAL_CHARACTERS] || [];

    if (searchQuery) {
      chars = chars.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return chars.sort((a, b) => b.appearances - a.appearances);
  };

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
          <p className="text-sm text-biblical-gold font-medium">{character.title}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
              {character.era}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {character.appearances} mentions
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
            <div className="text-3xl font-bold text-biblical-gold">1,000+</div>
            <div className="text-sm text-gray-600">Named Characters</div>
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

        {/* Controls */}
        <div className="card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', icon: '👥' },
                { id: 'patriarchs', label: 'Patriarchs', icon: '👴' },
                { id: 'kings', label: 'Kings', icon: '👑' },
                { id: 'prophets', label: 'Prophets', icon: '📜' },
                { id: 'women', label: 'Women', icon: '👸' },
                { id: 'newTestament', label: 'New Testament', icon: '✝️' },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id as Category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredCharacters().map(character => (
                <CharacterCard key={character.name} character={character} />
              ))}
            </div>
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
                    <p className="text-biblical-gold font-medium">{selectedPerson.title}</p>
                  </div>

                  <div className="space-y-4">
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

                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Key Relationships</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPerson.relations.map(rel => (
                          <button
                            key={rel}
                            onClick={() => {
                              const found = getAllCharacters().find(c => c.name === rel);
                              if (found) setSelectedPerson(found);
                            }}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Scripture References</h4>
                      <p className="text-gray-700">{selectedPerson.appearances} mentions in Scripture</p>
                    </div>

                    <button className="btn-primary w-full">
                      View Full Journey
                    </button>
                    <button className="btn-secondary w-full">
                      See Timeline
                    </button>
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
