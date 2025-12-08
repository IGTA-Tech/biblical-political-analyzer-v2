import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-faith-cream">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-faith-parchment to-faith-cream">
        <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-serif font-bold text-faith-ink mb-6">
            Historical Faith Tracker
          </h1>
          <p className="text-xl text-faith-stone max-w-2xl mx-auto mb-10">
            Explore 2,000 years of religious history through interactive
            timelines, detailed maps, and scholarly analysis.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/timeline"
              className="px-8 py-4 bg-faith-burgundy text-white rounded-lg font-medium text-lg hover:bg-faith-burgundy/90 transition-colors shadow-lg"
            >
              Explore Timeline
            </Link>
            <Link
              href="/map"
              className="px-8 py-4 bg-white border-2 border-faith-burgundy text-faith-burgundy rounded-lg font-medium text-lg hover:bg-faith-parchment transition-colors shadow-lg"
            >
              View Map
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif font-bold text-faith-ink text-center mb-12">
          Discover the Story of Faith
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Timeline Feature */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-faith-stone/10">
            <div className="w-14 h-14 bg-faith-gold/20 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-faith-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-semibold text-faith-ink mb-3">
              Interactive Timeline
            </h3>
            <p className="text-faith-stone mb-4">
              Navigate through history from 4 BC to 2024 AD with our zoomable,
              pannable timeline. See how events connect across centuries.
            </p>
            <Link
              href="/timeline"
              className="text-faith-burgundy font-medium hover:underline"
            >
              Explore Timeline &rarr;
            </Link>
          </div>

          {/* Map Feature */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-faith-stone/10">
            <div className="w-14 h-14 bg-faith-sage/20 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-faith-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-semibold text-faith-ink mb-3">
              Geographic Mapping
            </h3>
            <p className="text-faith-stone mb-4">
              See where history happened. Explore the spread of Christianity
              across continents and the locations of pivotal events.
            </p>
            <Link
              href="/map"
              className="text-faith-burgundy font-medium hover:underline"
            >
              View Map &rarr;
            </Link>
          </div>

          {/* Traditions Feature */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-faith-stone/10">
            <div className="w-14 h-14 bg-faith-burgundy/20 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-faith-burgundy"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-semibold text-faith-ink mb-3">
              Multiple Traditions
            </h3>
            <p className="text-faith-stone mb-4">
              Filter by Catholic, Orthodox, Protestant, and other traditions to
              see how different branches of Christianity developed.
            </p>
            <Link
              href="/timeline"
              className="text-faith-burgundy font-medium hover:underline"
            >
              Filter by Tradition &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Era Overview */}
      <div className="bg-white border-y border-faith-stone/10">
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-serif font-bold text-faith-ink text-center mb-12">
            Journey Through the Eras
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Apostolic', years: '4 BC - 100 AD', color: '#FDF8EE' },
              { name: 'Ante-Nicene', years: '100 - 325', color: '#F5E6D3' },
              { name: 'Medieval', years: '590 - 1517', color: '#E5CCB0' },
              { name: 'Reformation', years: '1517 - 1648', color: '#CDA580' },
              { name: 'Modern', years: '1789 - Present', color: '#BD8B60' },
            ].map((era) => (
              <Link
                key={era.name}
                href={`/timeline?era=${era.name.toLowerCase()}`}
                className="p-4 rounded-lg border border-faith-stone/20 hover:shadow-lg transition-shadow text-center"
                style={{ backgroundColor: era.color }}
              >
                <h3 className="font-serif font-semibold text-faith-ink">
                  {era.name}
                </h3>
                <p className="text-sm text-faith-stone">{era.years}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-faith-ink mb-6">
          Start Exploring
        </h2>
        <p className="text-lg text-faith-stone max-w-xl mx-auto mb-8">
          Whether you are a scholar, student, or curious explorer, dive into
          the rich tapestry of religious history.
        </p>
        <Link
          href="/timeline"
          className="inline-block px-8 py-4 bg-faith-burgundy text-white rounded-lg font-medium text-lg hover:bg-faith-burgundy/90 transition-colors shadow-lg"
        >
          Begin Your Journey
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-faith-ink text-white py-8">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-faith-parchment/80">
            Historical Faith Tracker - Exploring 2,000 years of religious
            history
          </p>
          <p className="text-sm text-faith-parchment/60 mt-2">
            Built with scholarly care and academic rigor
          </p>
        </div>
      </footer>
    </main>
  );
}
