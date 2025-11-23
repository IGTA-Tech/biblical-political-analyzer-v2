/**
 * Analyze Page
 * Main page for submitting political statements for analysis
 */

import React from 'react';
import Head from 'next/head';
import AnalysisForm from '@/components/AnalysisForm';

export default function AnalyzePage() {
  return (
    <>
      <Head>
        <title>Analyze Statement - Biblical Political Analyzer</title>
        <meta
          name="description"
          content="Submit a political statement for Biblical analysis with original language insights and historical parallels."
        />
      </Head>

      <div className="section-container">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-biblical-deepblue mb-4">
            Analyze a Political Statement
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Enter any political statement, quote, or policy position below.
            We'll analyze it against Biblical principles, examine the original
            Hebrew/Greek meanings, and find relevant historical parallels.
          </p>
        </div>

        <AnalysisForm />

        {/* Information Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            title="What We Analyze"
            items={[
              'Relevant Biblical passages',
              'Original Hebrew/Greek word meanings',
              'Historical and cultural context',
              'Real-world historical parallels',
              'Modern policy connections',
              'Current news and data',
            ]}
          />
          <InfoCard
            title="What You'll Get"
            items={[
              'Executive summary',
              'Detailed Biblical analysis',
              'Etymology word studies',
              'Historical timeline',
              'Modern application insights',
              'Multiple perspectives',
            ]}
          />
          <InfoCard
            title="Our Approach"
            items={[
              'Objective, non-partisan',
              'Scripture-focused',
              'Academically rigorous',
              'Multiple translations',
              'Historical accuracy',
              'Transparent methodology',
            ]}
          />
        </div>
      </div>
    </>
  );
}

interface InfoCardProps {
  title: string;
  items: string[];
}

function InfoCard({ title, items }: InfoCardProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-biblical-deepblue mb-4">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start text-sm text-gray-700">
            <svg
              className="w-5 h-5 mr-2 text-biblical-gold flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
