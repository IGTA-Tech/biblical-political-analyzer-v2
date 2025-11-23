/**
 * About Page (Now Home Page)
 * Information about the project and methodology
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - Biblical Political Analyzer</title>
        <meta
          name="description"
          content="Learn about the Biblical Political Analyzer's methodology, data sources, and mission."
        />
      </Head>

      <div className="section-container">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-biblical-deepblue mb-4">
            About This Project
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Helping Christians understand political rhetoric through Biblical wisdom,
            historical context, and linguistic depth.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12">
          <div className="card bg-gradient-to-br from-biblical-parchment to-biblical-sand">
            <h2 className="text-3xl font-bold text-biblical-deepblue mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              In an era of political division and rhetoric, Christians need tools to
              evaluate political statements against timeless Biblical principles. This
              analyzer provides deep, objective analysis by examining:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Relevant Biblical passages with proper context</li>
              <li>Original Hebrew and Greek word meanings</li>
              <li>Historical and cultural context of Biblical times</li>
              <li>Real-world historical parallels from human history</li>
              <li>Modern policy connections and government data</li>
            </ul>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-biblical-deepblue mb-6 text-center">
            Our Methodology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MethodCard
              title="1. Semantic Scripture Search"
              description="We use advanced AI embeddings to find relevant Biblical passages based on meaning, not just keywords. This ensures we capture the spirit of what's being discussed."
            />
            <MethodCard
              title="2. Original Language Analysis"
              description="Every passage is examined in its original Hebrew (Old Testament) or Greek (New Testament), using Strong's Concordance and ancient lexicons to understand precise meanings."
            />
            <MethodCard
              title="3. Historical Context"
              description="We research what was happening politically, socially, and economically when each passage was written, understanding the original audience and situation."
            />
            <MethodCard
              title="4. Historical Parallels"
              description="We search human history for similar political situations and their outcomes, drawing from the Roman Empire, ancient civilizations, and modern history."
            />
            <MethodCard
              title="5. Modern Policy Analysis"
              description="We connect statements to actual policies (like Project 2025), government actions, census data, and recent news to ground analysis in reality."
            />
            <MethodCard
              title="6. AI Synthesis"
              description="Claude AI synthesizes all findings into a comprehensive analysis, respecting different theological perspectives while maintaining Biblical fidelity."
            />
          </div>
        </section>

        {/* Data Sources */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-biblical-deepblue mb-6 text-center">
            Data Sources
          </h2>
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-biblical-deepblue mb-3">
                  Biblical Texts
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Bible API (api.bible) - Multiple translations</li>
                  <li>• Westminster Leningrad Codex - Hebrew OT</li>
                  <li>• Byzantine/Majority Text - Greek NT</li>
                  <li>• Strong's Concordance - Etymology</li>
                  <li>• Brown-Driver-Briggs Hebrew Lexicon</li>
                  <li>• Thayer's Greek Lexicon</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-biblical-deepblue mb-3">
                  Historical Data
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Open Bible Data - Biblical history</li>
                  <li>• Ancient History Encyclopedia</li>
                  <li>• Perseus Digital Library - Classical texts</li>
                  <li>• Wikipedia - Modern history (CC-BY-SA)</li>
                  <li>• Project 2025 Policy Document</li>
                  <li>• Federal Register API - Government data</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-biblical-deepblue mb-6 text-center">
            Guiding Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PrincipleCard
              icon="balance"
              title="Non-Partisan"
              description="We analyze principles, not parties. Our goal is Biblical fidelity, not political alignment."
            />
            <PrincipleCard
              icon="book"
              title="Scripture First"
              description="The Bible is our primary source. Everything else serves to illuminate what Scripture teaches."
            />
            <PrincipleCard
              icon="academic"
              title="Academically Rigorous"
              description="We use proper hermeneutics, respect original languages, and maintain historical accuracy."
            />
            <PrincipleCard
              icon="transparent"
              title="Transparent"
              description="We show our sources, explain our reasoning, and acknowledge different perspectives."
            />
            <PrincipleCard
              icon="respectful"
              title="Respectful"
              description="We respect different theological traditions and interpretations within Christianity."
            />
            <PrincipleCard
              icon="educational"
              title="Educational"
              description="Our goal is to teach, not to tell you what to think. Draw your own conclusions."
            />
          </div>
        </section>

        {/* Important Disclaimers */}
        <section className="mb-12">
          <div className="card bg-yellow-50 border-l-4 border-yellow-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Important Disclaimers
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Not Endorsement:</strong> This tool does not endorse or oppose
                any political party, candidate, or movement. It provides educational
                analysis only.
              </p>
              <p>
                <strong>Not Definitive:</strong> Biblical interpretation involves
                theological nuance. Our analyses represent one perspective and should
                be considered alongside other sources.
              </p>
              <p>
                <strong>Verify Information:</strong> Always verify facts and
                policies independently. We strive for accuracy but cannot guarantee
                perfection.
              </p>
              <p>
                <strong>Pray and Study:</strong> Use this as a starting point for
                your own prayer, study, and discernment. The Holy Spirit is your
                ultimate guide.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="card bg-biblical-deepblue text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start?
            </h2>
            <p className="text-lg mb-6 text-biblical-sand">
              Analyze political statements through the lens of Biblical wisdom
              and historical context.
            </p>
            <Link href="/analyze" className="btn-primary bg-biblical-gold text-biblical-deepblue hover:bg-white inline-block">
              Analyze a Statement
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

interface MethodCardProps {
  title: string;
  description: string;
}

function MethodCard({ title, description }: MethodCardProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-biblical-deepblue mb-3">
        {title}
      </h3>
      <p className="text-gray-700">
        {description}
      </p>
    </div>
  );
}

interface PrincipleCardProps {
  icon: string;
  title: string;
  description: string;
}

function PrincipleCard({ icon, title, description }: PrincipleCardProps) {
  return (
    <div className="card text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-biblical-gold text-biblical-deepblue mb-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-biblical-deepblue mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
}
