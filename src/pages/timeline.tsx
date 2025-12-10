/**
 * Timeline Viewer Page
 * Interactive Biblical timeline from Creation to Contemporary
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Era {
  id: string;
  name: string;
  dateRange: string;
  filename: string;
  size: number;
  overview?: string;
}

// Timeline data covering Biblical and Post-Biblical history
const TIMELINE_DATA = {
  biblical: [
    {
      era: 'Primeval History',
      dateRange: 'Creation - ~2000 BCE',
      color: 'amber',
      events: [
        { year: 'Creation', title: 'Creation of the World', description: 'God creates heavens, earth, and humanity', books: ['Genesis 1-2'] },
        { year: '~2300 BCE', title: 'The Great Flood', description: 'Noah and the ark preserve life', books: ['Genesis 6-9'] },
        { year: '~2200 BCE', title: 'Tower of Babel', description: 'Dispersion of nations', books: ['Genesis 11'] },
      ],
    },
    {
      era: 'Patriarchal Period',
      dateRange: '~2000-1700 BCE',
      color: 'orange',
      events: [
        { year: '~2000 BCE', title: 'Call of Abraham', description: 'Covenant established with Abraham', books: ['Genesis 12'] },
        { year: '~1900 BCE', title: 'Birth of Isaac', description: 'Son of promise born', books: ['Genesis 21'] },
        { year: '~1850 BCE', title: 'Jacob & Esau', description: 'Birthright and blessing', books: ['Genesis 25-28'] },
        { year: '~1700 BCE', title: 'Joseph in Egypt', description: 'From slavery to second-in-command', books: ['Genesis 37-50'] },
      ],
    },
    {
      era: 'Exodus & Wilderness',
      dateRange: '~1446-1406 BCE',
      color: 'red',
      events: [
        { year: '~1446 BCE', title: 'The Exodus', description: 'Israel freed from Egypt', books: ['Exodus 1-15'] },
        { year: '~1446 BCE', title: 'Law at Sinai', description: 'Ten Commandments given', books: ['Exodus 19-24'] },
        { year: '~1445-1406 BCE', title: 'Wilderness Wandering', description: '40 years in the desert', books: ['Numbers'] },
        { year: '~1406 BCE', title: 'Death of Moses', description: 'Leadership passes to Joshua', books: ['Deuteronomy 34'] },
      ],
    },
    {
      era: 'Conquest & Settlement',
      dateRange: '~1406-1050 BCE',
      color: 'green',
      events: [
        { year: '~1406 BCE', title: 'Crossing the Jordan', description: 'Israel enters Promised Land', books: ['Joshua 3-4'] },
        { year: '~1400 BCE', title: 'Fall of Jericho', description: 'Walls come tumbling down', books: ['Joshua 6'] },
        { year: '~1350-1050 BCE', title: 'Period of Judges', description: 'Cycles of sin and deliverance', books: ['Judges'] },
        { year: '~1100 BCE', title: 'Ruth & Boaz', description: 'Faithful love in dark times', books: ['Ruth'] },
      ],
    },
    {
      era: 'United Monarchy',
      dateRange: '~1050-930 BCE',
      color: 'purple',
      events: [
        { year: '~1050 BCE', title: 'Saul Anointed King', description: 'First king of Israel', books: ['1 Samuel 8-10'] },
        { year: '~1010 BCE', title: 'David Becomes King', description: 'Man after God\'s own heart', books: ['2 Samuel 5'] },
        { year: '~970 BCE', title: 'Solomon\'s Temple', description: 'House of God built in Jerusalem', books: ['1 Kings 6-8'] },
        { year: '~930 BCE', title: 'Kingdom Divided', description: 'Israel splits north and south', books: ['1 Kings 12'] },
      ],
    },
    {
      era: 'Divided Kingdom',
      dateRange: '~930-586 BCE',
      color: 'blue',
      events: [
        { year: '~870 BCE', title: 'Elijah vs Baal Prophets', description: 'Contest on Mount Carmel', books: ['1 Kings 18'] },
        { year: '722 BCE', title: 'Fall of Northern Israel', description: 'Assyria conquers Samaria', books: ['2 Kings 17'] },
        { year: '701 BCE', title: 'Sennacherib\'s Siege', description: 'Jerusalem miraculously delivered', books: ['2 Kings 18-19', 'Isaiah 36-37'] },
        { year: '586 BCE', title: 'Fall of Jerusalem', description: 'Babylon destroys temple', books: ['2 Kings 25'] },
      ],
    },
    {
      era: 'Exile & Return',
      dateRange: '586-400 BCE',
      color: 'indigo',
      events: [
        { year: '586-539 BCE', title: 'Babylonian Exile', description: 'Jews in captivity', books: ['Ezekiel', 'Daniel'] },
        { year: '539 BCE', title: 'Cyrus Decree', description: 'Permission to return', books: ['Ezra 1'] },
        { year: '516 BCE', title: 'Second Temple Built', description: 'Worship restored', books: ['Ezra 6'] },
        { year: '458 BCE', title: 'Ezra\'s Return', description: 'Law taught to people', books: ['Ezra 7-10'] },
        { year: '445 BCE', title: 'Nehemiah Rebuilds Walls', description: 'Jerusalem fortified', books: ['Nehemiah'] },
      ],
    },
    {
      era: 'Intertestamental Period',
      dateRange: '400 BCE - 4 BCE',
      color: 'gray',
      events: [
        { year: '332 BCE', title: 'Alexander the Great', description: 'Greek rule begins', books: ['Daniel 8, 11'] },
        { year: '167 BCE', title: 'Maccabean Revolt', description: 'Temple rededicated (Hanukkah)', books: ['1-2 Maccabees'] },
        { year: '63 BCE', title: 'Roman Conquest', description: 'Pompey takes Jerusalem', books: [] },
        { year: '37 BCE', title: 'Herod the Great', description: 'Temple expansion begins', books: ['Matthew 2'] },
      ],
    },
    {
      era: 'Life of Christ',
      dateRange: '~4 BCE - 30 CE',
      color: 'yellow',
      events: [
        { year: '~4 BCE', title: 'Birth of Jesus', description: 'Messiah born in Bethlehem', books: ['Matthew 1-2', 'Luke 1-2'] },
        { year: '~26 CE', title: 'Jesus\' Baptism', description: 'Ministry begins', books: ['Matthew 3', 'Mark 1', 'Luke 3'] },
        { year: '~30 CE', title: 'Crucifixion', description: 'Death on the cross', books: ['Gospels'] },
        { year: '~30 CE', title: 'Resurrection', description: 'Christ rises from the dead', books: ['Gospels'] },
        { year: '~30 CE', title: 'Ascension', description: 'Jesus returns to heaven', books: ['Acts 1'] },
      ],
    },
    {
      era: 'Early Church',
      dateRange: '30-100 CE',
      color: 'teal',
      events: [
        { year: '30 CE', title: 'Pentecost', description: 'Holy Spirit descends', books: ['Acts 2'] },
        { year: '~35 CE', title: 'Conversion of Paul', description: 'Persecutor becomes apostle', books: ['Acts 9'] },
        { year: '~49 CE', title: 'Jerusalem Council', description: 'Gentiles welcomed', books: ['Acts 15'] },
        { year: '64-68 CE', title: 'Neronian Persecution', description: 'Martyrdom of Peter and Paul', books: ['2 Timothy'] },
        { year: '70 CE', title: 'Temple Destroyed', description: 'Romans destroy Jerusalem', books: [] },
        { year: '~95 CE', title: 'Revelation Written', description: 'John\'s apocalyptic vision', books: ['Revelation'] },
      ],
    },
  ],
  christianHistory: [
    {
      era: 'Apostolic Era',
      dateRange: '4 BCE - 100 CE',
      color: 'amber',
      events: [
        { year: '30 CE', title: 'Church Founded', description: 'Pentecost marks beginning', books: [] },
        { year: '70 CE', title: 'Temple Destroyed', description: 'Judaism transformed', books: [] },
      ],
    },
    {
      era: 'Ante-Nicene Period',
      dateRange: '100-325 CE',
      color: 'orange',
      events: [
        { year: '~150 CE', title: 'Justin Martyr', description: 'Early apologist', books: [] },
        { year: '303 CE', title: 'Great Persecution', description: 'Diocletian\'s attacks', books: [] },
        { year: '313 CE', title: 'Edict of Milan', description: 'Christianity legalized', books: [] },
      ],
    },
    {
      era: 'Post-Nicene Period',
      dateRange: '325-600 CE',
      color: 'red',
      events: [
        { year: '325 CE', title: 'Council of Nicaea', description: 'Nicene Creed formulated', books: [] },
        { year: '380 CE', title: 'Christianity State Religion', description: 'Theodosius I decree', books: [] },
        { year: '397 CE', title: 'Biblical Canon', description: 'Council of Carthage', books: [] },
      ],
    },
    {
      era: 'Medieval Period',
      dateRange: '600-1500 CE',
      color: 'purple',
      events: [
        { year: '1054 CE', title: 'Great Schism', description: 'East-West church split', books: [] },
        { year: '1095 CE', title: 'First Crusade', description: 'Holy Land campaigns begin', books: [] },
        { year: '1215 CE', title: 'Fourth Lateran Council', description: 'Medieval church at height', books: [] },
      ],
    },
    {
      era: 'Reformation',
      dateRange: '1517-1648 CE',
      color: 'blue',
      events: [
        { year: '1517 CE', title: '95 Theses', description: 'Luther sparks Reformation', books: [] },
        { year: '1534 CE', title: 'Act of Supremacy', description: 'English Reformation', books: [] },
        { year: '1545 CE', title: 'Council of Trent', description: 'Catholic Counter-Reformation', books: [] },
      ],
    },
    {
      era: 'Modern Era',
      dateRange: '1800-Present',
      color: 'green',
      events: [
        { year: '1948 CE', title: 'State of Israel', description: 'Modern Israel founded', books: [] },
        { year: '1962 CE', title: 'Vatican II', description: 'Catholic modernization', books: [] },
        { year: '2024 CE', title: 'Contemporary', description: 'Global Christianity today', books: [] },
      ],
    },
  ],
  jewishHistory: [
    {
      era: 'Rabbinic Foundations',
      dateRange: '70-200 CE',
      color: 'amber',
      events: [
        { year: '70 CE', title: 'Temple Destroyed', description: 'Rabbinic Judaism emerges', books: [] },
        { year: '~200 CE', title: 'Mishnah Compiled', description: 'Oral law codified', books: [] },
      ],
    },
    {
      era: 'Talmudic Period',
      dateRange: '200-500 CE',
      color: 'orange',
      events: [
        { year: '~400 CE', title: 'Jerusalem Talmud', description: 'Palestinian compilation', books: [] },
        { year: '~500 CE', title: 'Babylonian Talmud', description: 'Authoritative compilation', books: [] },
      ],
    },
    {
      era: 'Medieval Period',
      dateRange: '500-1500 CE',
      color: 'red',
      events: [
        { year: '1135 CE', title: 'Maimonides Born', description: 'Greatest medieval scholar', books: [] },
        { year: '1290 CE', title: 'Expulsion from England', description: 'First major expulsion', books: [] },
        { year: '1492 CE', title: 'Spanish Expulsion', description: 'End of Golden Age', books: [] },
      ],
    },
    {
      era: 'Modern Era',
      dateRange: '1700-Present',
      color: 'blue',
      events: [
        { year: '1730s CE', title: 'Hasidism Founded', description: 'Baal Shem Tov movement', books: [] },
        { year: '1939-1945', title: 'Holocaust', description: 'Six million murdered', books: [] },
        { year: '1948 CE', title: 'State of Israel', description: 'Jewish homeland restored', books: [] },
      ],
    },
  ],
};

type TimelineTrack = 'biblical' | 'christianHistory' | 'jewishHistory';

export default function TimelinePage() {
  const [track, setTrack] = useState<TimelineTrack>('biblical');
  const [expandedEra, setExpandedEra] = useState<string | null>(null);
  const [apiEras, setApiEras] = useState<{ christian: Era[]; jewish: Era[] }>({ christian: [], jewish: [] });
  const [loading, setLoading] = useState(false);

  // Fetch era data from API for post-biblical tracks
  useEffect(() => {
    if (track !== 'biblical') {
      setLoading(true);
      fetch(`/api/timeline/eras?type=${track === 'christianHistory' ? 'christian' : 'jewish'}`)
        .then(res => res.json())
        .then(data => {
          if (data.eras) {
            if (track === 'christianHistory') {
              setApiEras(prev => ({ ...prev, christian: data.eras }));
            } else {
              setApiEras(prev => ({ ...prev, jewish: data.eras }));
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching eras:', err);
          setLoading(false);
        });
    }
  }, [track]);

  const currentTimeline = TIMELINE_DATA[track];

  return (
    <>
      <Head>
        <title>Timeline Viewer - Biblical Political Analyzer</title>
        <meta name="description" content="Interactive timeline spanning Biblical history to the present day." />
      </Head>

      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-biblical-deepblue mb-4">
            Timeline Viewer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore 4,000+ years of Biblical and religious history from Creation to the present day.
          </p>
        </div>

        {/* Track Selector */}
        <div className="card mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: 'biblical', label: 'Biblical History', icon: '📖', desc: 'Creation to Early Church' },
              { id: 'christianHistory', label: 'Christian History', icon: '✝️', desc: 'Apostolic Era to Present' },
              { id: 'jewishHistory', label: 'Jewish History', icon: '✡️', desc: 'Rabbinic Era to Present' },
            ].map(({ id, label, icon, desc }) => (
              <button
                key={id}
                onClick={() => setTrack(id as TimelineTrack)}
                className={`flex-1 min-w-[200px] max-w-[300px] p-4 rounded-lg border-2 transition-all ${
                  track === id
                    ? 'border-biblical-gold bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-biblical-deepblue'
                }`}
              >
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-semibold text-biblical-deepblue">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-biblical-gold via-biblical-deepblue to-biblical-gold hidden md:block" />

          <div className="space-y-6">
            {currentTimeline.map((period, periodIndex) => (
              <div key={period.era} className="relative">
                {/* Era Header */}
                <button
                  onClick={() => setExpandedEra(expandedEra === period.era ? null : period.era)}
                  className={`w-full card hover:shadow-lg transition-all ${
                    expandedEra === period.era ? 'ring-2 ring-biblical-gold' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Timeline Node */}
                    <div className={`hidden md:flex w-12 h-12 rounded-full bg-${period.color}-500 items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {periodIndex + 1}
                    </div>

                    <div className="flex-grow text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-biblical-deepblue">{period.era}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${period.color}-100 text-${period.color}-800`}>
                          {period.dateRange}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {period.events.length} key events
                      </p>
                    </div>

                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        expandedEra === period.era ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Events */}
                {expandedEra === period.era && (
                  <div className="mt-4 ml-0 md:ml-16 space-y-3 animation-fade-in">
                    {period.events.map((event, eventIndex) => (
                      <div
                        key={event.title}
                        className="card-biblical hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-sm">
                            {eventIndex + 1}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-biblical-deepblue">{event.title}</h4>
                              <span className="text-sm text-biblical-gold font-medium">{event.year}</span>
                            </div>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            {event.books.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.books.map(book => (
                                  <span key={book} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded">
                                    {book}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
