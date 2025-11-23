/**
 * Next.js App Component
 * Root component that wraps all pages
 */

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <>
      <Head>
        <title>Biblical Political Analyzer</title>
        <meta
          name="description"
          content="Analyze political statements through the lens of Biblical scripture, original Hebrew/Greek texts, and historical parallels."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-biblical-deepblue text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xl font-bold">Biblical Political Analyzer</span>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                <Link
                  href="/"
                  className={`hover:text-biblical-gold transition-colors ${
                    isActive('/') ? 'text-biblical-gold font-semibold' : ''
                  }`}
                >
                  About This Project
                </Link>
                <Link
                  href="/analyze"
                  className={`hover:text-biblical-gold transition-colors ${
                    isActive('/analyze') ? 'text-biblical-gold font-semibold' : ''
                  }`}
                >
                  Analyze
                </Link>
                <Link
                  href="/what-this-does"
                  className={`hover:text-biblical-gold transition-colors ${
                    isActive('/what-this-does') ? 'text-biblical-gold font-semibold' : ''
                  }`}
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          <Component {...pageProps} />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Biblical Political Analyzer
                </h3>
                <p className="text-sm">
                  Helping Christians understand political rhetoric through the lens
                  of Biblical principles, original language analysis, and historical context.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      About This Project
                    </Link>
                  </li>
                  <li>
                    <Link href="/analyze" className="hover:text-white transition-colors">
                      Analyze Statement
                    </Link>
                  </li>
                  <li>
                    <Link href="/what-this-does" className="hover:text-white transition-colors">
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Disclaimer */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Important Notice
                </h3>
                <p className="text-sm">
                  This tool provides educational analysis only. It is not intended
                  to promote any political party or candidate. Always verify
                  information and consult multiple sources.
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} Biblical Political Analyzer. All rights reserved.</p>
              <p className="mt-2 text-xs text-gray-400">
                Built with Next.js, Supabase, and powered by AI
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
