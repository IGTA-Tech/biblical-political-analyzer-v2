/**
 * What This Does Page
 * Detailed explanation of how the analyzer works and features
 */

import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function WhatThisDoes() {
  return (
    <>
      <Head>
        <title>What This Does - Biblical Political Analyzer</title>
        <meta
          name="description"
          content="Learn how the Biblical Political Analyzer works - analyze political statements through Biblical scripture, original languages, and historical context."
        />
      </Head>

      {/* Hero Section */}
      <section className="section-container text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-biblical-deepblue mb-6 animation-fade-in">
            Biblical Political Analyzer
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 animation-slide-up">
            Understand political rhetoric through the lens of{' '}
            <span className="text-biblical-gold font-semibold">Biblical principles</span>,{' '}
            <span className="text-biblical-gold font-semibold">original Hebrew & Greek</span>, and{' '}
            <span className="text-biblical-gold font-semibold">historical parallels</span>.
          </p>
          <Link href="/analyze" className="btn-primary inline-block text-lg">
            Start Analyzing
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-container bg-white/50">
        <h2 className="section-title">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StepCard
            number={1}
            title="Submit Statement"
            description="Enter a political statement, quote, or policy position you'd like to analyze."
            icon="input"
          />
          <StepCard
            number={2}
            title="Biblical Search"
            description="We search thousands of verses to find relevant Biblical passages and principles."
            icon="search"
          />
          <StepCard
            number={3}
            title="Deep Analysis"
            description="Original Hebrew/Greek meanings, historical context, and real-world parallels are examined."
            icon="analyze"
          />
          <StepCard
            number={4}
            title="Comprehensive Report"
            description="Receive a detailed analysis showing alignment or conflicts with Biblical teachings."
            icon="report"
          />
        </div>
      </section>

      {/* Features */}
      <section className="section-container">
        <h2 className="section-title">What Makes This Tool Unique?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Original Languages"
            description="Not just English translations - we analyze Hebrew and Greek texts with Strong's Concordance for accurate meanings."
            icon="language"
          />
          <FeatureCard
            title="Historical Context"
            description="Understand what Biblical passages meant in their original context and how historical events parallel modern situations."
            icon="history"
          />
          <FeatureCard
            title="Modern Relevance"
            description="See how timeless Biblical principles apply to current political issues, policies, and government actions."
            icon="modern"
          />
        </div>
      </section>

      {/* Example Analysis */}
      <section className="section-container bg-white/50">
        <h2 className="section-title">Example Analysis</h2>
        <div className="max-w-4xl mx-auto card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-biblical-deepblue mb-2">
              Political Statement:
            </h3>
            <blockquote className="text-gray-800 italic border-l-4 border-biblical-gold pl-4">
              "We need to close our borders to protect American jobs"
            </blockquote>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-biblical-deepblue mb-2">
                Biblical Passages Found:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Leviticus 19:33-34 - Treatment of foreigners</li>
                <li>Matthew 25:35 - Welcoming strangers</li>
                <li>Exodus 22:21 - Not oppressing foreigners</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-biblical-deepblue mb-2">
                Hebrew Insight:
              </h4>
              <p>
                The Hebrew word "ger" (גֵּר) translated as "foreigner" or "stranger"
                appears 92 times in the Old Testament, always with instructions to
                treat them with justice and compassion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-biblical-deepblue mb-2">
                Historical Parallel:
              </h4>
              <p>
                Roman Empire's restrictive citizenship laws (1st-2nd century AD)
                initially protected Roman jobs but ultimately weakened the empire
                by creating social division and limiting economic growth.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/analyze" className="btn-secondary inline-block">
              Try Your Own Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-container text-center bg-gradient-to-r from-biblical-deepblue to-biblical-olive text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Analyze Political Statements?
          </h2>
          <p className="text-xl mb-8">
            Gain deeper understanding of how political rhetoric aligns with
            Biblical principles and historical wisdom.
          </p>
          <Link href="/analyze" className="btn-primary bg-biblical-gold text-biblical-deepblue hover:bg-white inline-block text-lg">
            Start Analyzing Now
          </Link>
        </div>
      </section>
    </>
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: 'input' | 'search' | 'analyze' | 'report';
}

function StepCard({ number, title, description, icon }: StepCardProps) {
  const icons = {
    input: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    ),
    search: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
    analyze: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
    report: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  };

  return (
    <div className="card text-center hover:shadow-xl transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-biblical-gold text-biblical-deepblue mb-4">
        <span className="text-2xl font-bold">{number}</span>
      </div>
      <div className="mb-4">
        <svg className="w-12 h-12 mx-auto text-biblical-deepblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <h3 className="text-xl font-bold text-biblical-deepblue mb-3">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: 'language' | 'history' | 'modern';
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const icons = {
    language: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    ),
    history: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    modern: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  };

  return (
    <div className="card text-center hover:shadow-xl transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-biblical-sand mb-4">
        <svg className="w-8 h-8 text-biblical-deepblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <h3 className="text-xl font-bold text-biblical-deepblue mb-3">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
