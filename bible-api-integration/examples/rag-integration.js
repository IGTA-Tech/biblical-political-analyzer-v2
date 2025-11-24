/**
 * RAG Integration Example
 * Demonstrates combining Bible API with RAG-enhanced narrative
 * Shows how to provide contextual responses with historical/archaeological evidence
 */

import { BibleAPIClient } from '../BibleAPIClient.js';
import fs from 'fs';
import path from 'path';

/**
 * Mock RAG system for demonstration
 * In production, this would query your actual RAG system with embeddings
 */
class MockRAGSystem {
  constructor(narrativePath) {
    this.narrativePath = narrativePath;
    this.narrativeLoaded = false;
  }

  /**
   * Simulate getting context from RAG document
   */
  async getContext(book, chapter) {
    // In production, this would:
    // 1. Create embedding for query
    // 2. Search vector database
    // 3. Return relevant context chunks

    // For demo, return mock context
    const contexts = {
      'Genesis_1': {
        period: 'Primeval History (Genesis 1-11)',
        historical: 'Composed during or after Babylonian Exile (586-539 BCE). Responds to Mesopotamian creation myths like Enuma Elish.',
        archaeological: 'Parallels with Enuma Elish (Babylonian), Epic of Gilgamesh (flood), Sumerian King Lists (longevity).',
        cultural: 'Ancient Near Eastern cosmology: firmament (raqia), waters above/below, creation by divine word.',
        theological: 'Monotheistic polemic against polytheism. Ordered creation vs chaos. Humanity as divine image-bearers.'
      },
      'John_3': {
        period: 'Jesus Ministry (6/4 BCE - 30/33 CE)',
        historical: 'Gospel written 90-100 CE. Jesus teaching Nicodemus, Jewish leader. Roman occupation, temple worship continues.',
        archaeological: 'Pilate Stone confirms Pontius Pilate. Caiaphas ossuary. Pool of Siloam excavated.',
        cultural: 'Jewish purification rituals, teacher-student relationships, honor-shame culture.',
        theological: 'New birth (being "born again"), Spirit theology, cosmic love (John 3:16), belief vs works.'
      },
      'Romans_8': {
        period: 'Early Church (30-70 CE)',
        historical: 'Written ~57 CE from Corinth. Paul to Roman church before his visit. Nero\'s persecution approaching.',
        archaeological: 'Gallio Inscription dates Paul in Corinth 51-52 CE. Erastus inscription mentions city treasurer.',
        cultural: 'Roman honor culture, imperial cult, patronage systems, household churches.',
        theological: 'Spirit vs flesh, adoption, suffering/glory, intercession, God\'s sovereignty, security of believers.'
      }
    };

    const key = `${book}_${chapter}`;
    return contexts[key] || {
      period: 'See jewish_biblical_narrative_enhanced.md for full context',
      historical: 'Historical context available in RAG system',
      archaeological: 'Archaeological evidence documented in RAG system',
      cultural: 'Cultural practices explained in RAG system',
      theological: 'Theological themes explored in RAG system'
    };
  }

  /**
   * Search for specific topics in narrative
   */
  async searchTopic(query) {
    // Mock topic search
    const topics = {
      'covenant': {
        summary: 'Central biblical theme: God\'s binding agreement with humanity',
        references: ['Genesis 15', 'Genesis 17', 'Exodus 19-24', 'Jeremiah 31:31-34', 'Luke 22:20'],
        scholarly: 'Covenant treaty parallels Neo-Assyrian vassal treaties (Deuteronomy), suzerain-vassal structure.'
      },
      'exile': {
        summary: 'Babylonian Exile (586-539 BCE): Watershed event in Jewish history',
        references: ['2 Kings 25', 'Jeremiah 52', 'Ezekiel 1-3', 'Daniel 1', 'Psalm 137'],
        scholarly: 'Babylonian Chronicles confirm 597 and 586 BCE deportations. Ration lists mention King Jehoiachin.'
      },
      'resurrection': {
        summary: 'Jesus\' resurrection: Central Christian claim',
        references: ['Matthew 28', 'Mark 16', 'Luke 24', 'John 20-21', '1 Corinthians 15'],
        scholarly: 'Earliest source: 1 Cor 15:3-7 (written ~55 CE, creed ~35 CE). Empty tomb tradition multiply attested.'
      }
    };

    return topics[query.toLowerCase()] || {
      summary: 'Topic not found in mock system',
      references: [],
      scholarly: 'See full RAG system for comprehensive topic search'
    };
  }
}

/**
 * Combined Bible + RAG Response System
 */
class BiblicalContextSystem {
  constructor() {
    this.bible = new BibleAPIClient();
    this.rag = new MockRAGSystem('../jewish_biblical_narrative_enhanced.md');
  }

  /**
   * Answer a question about a Bible passage with full context
   */
  async answerQuestion(book, chapter, verse, question) {
    console.log('='.repeat(70));
    console.log(`CONTEXTUAL STUDY: ${book} ${chapter}:${verse}`);
    console.log(`Question: ${question}`);
    console.log('='.repeat(70));
    console.log();

    // 1. Get verse text from API (multiple translations)
    console.log('📖 SCRIPTURE TEXT');
    console.log('-'.repeat(70));
    const verseData = await this.bible.getVerse(book, chapter, verse, {
      versions: ['KJV', 'ESV', 'WEB']
    });

    for (const [version, text] of Object.entries(verseData.versions)) {
      if (typeof text === 'string') {
        console.log(`${version}: ${text}`);
      }
    }
    console.log();

    // 2. Get historical/archaeological context from RAG
    console.log('🏛️  HISTORICAL & ARCHAEOLOGICAL CONTEXT');
    console.log('-'.repeat(70));
    const context = await this.rag.getContext(book, chapter);
    console.log(`Period: ${context.period}`);
    console.log(`Historical: ${context.historical}`);
    console.log(`Archaeological: ${context.archaeological}`);
    console.log(`Cultural: ${context.cultural}`);
    console.log();

    // 3. Get original language (if available)
    console.log('📜 ORIGINAL LANGUAGE');
    console.log('-'.repeat(70));
    try {
      const original = await this.bible.getOriginalLanguage(book, chapter, verse);
      console.log(`Language: ${original.language}`);
      console.log(`Text: ${original.text?.substring(0, 100)}...`);
      console.log(`Transliteration: ${original.transliteration?.substring(0, 100)}...`);
    } catch (error) {
      console.log('Original language not available (requires Blue Letter Bible API key)');
    }
    console.log();

    // 4. Get cross-references
    console.log('🔗 CROSS-REFERENCES');
    console.log('-'.repeat(70));
    try {
      const crossRefs = await this.bible.getCrossReferences(book, chapter, verse);
      if (crossRefs && crossRefs.length > 0) {
        crossRefs.slice(0, 5).forEach(ref => {
          console.log(`• ${ref.reference}`);
        });
      }
    } catch (error) {
      console.log('Cross-references not available (requires Blue Letter Bible API key)');
    }
    console.log();

    // 5. Theological themes from RAG
    console.log('✨ THEOLOGICAL THEMES');
    console.log('-'.repeat(70));
    console.log(context.theological);
    console.log();

    console.log('='.repeat(70));
    console.log();
  }

  /**
   * Topic-based study combining API + RAG
   */
  async studyTopic(topic) {
    console.log('='.repeat(70));
    console.log(`TOPIC STUDY: ${topic.toUpperCase()}`);
    console.log('='.repeat(70));
    console.log();

    // Get topic info from RAG
    const topicData = await this.rag.searchTopic(topic);

    console.log('📚 OVERVIEW');
    console.log('-'.repeat(70));
    console.log(topicData.summary);
    console.log();

    console.log('📖 KEY PASSAGES');
    console.log('-'.repeat(70));

    // Fetch each reference from API
    for (const ref of topicData.references.slice(0, 3)) {
      try {
        // Parse reference (simplified)
        const parts = ref.match(/(.+?)\s+(\d+)(?::(\d+))?/);
        if (parts) {
          const [, book, chapter, verse] = parts;

          if (verse) {
            // Single verse
            const data = await this.bible.getVerse(book, parseInt(chapter), parseInt(verse), {
              versions: ['KJV']
            });
            console.log(`${ref}: ${data.versions.KJV?.substring(0, 150)}...`);
          } else {
            // Entire chapter (just show reference)
            console.log(`${ref}: [See full chapter for context]`);
          }
        }
      } catch (error) {
        console.log(`${ref}: [Error fetching]`);
      }
    }
    console.log();

    console.log('🎓 SCHOLARLY NOTES');
    console.log('-'.repeat(70));
    console.log(topicData.scholarly);
    console.log();

    console.log('='.repeat(70));
    console.log();
  }

  /**
   * Sermon preparation helper
   */
  async prepareSermon(book, startChapter, startVerse, endChapter, endVerse) {
    console.log('='.repeat(70));
    console.log(`SERMON PREPARATION: ${book} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`);
    console.log('='.repeat(70));
    console.log();

    // 1. Passage in multiple translations
    console.log('📖 PASSAGE TEXT');
    console.log('-'.repeat(70));
    const passage = await this.bible.getPassage(
      book, startChapter, startVerse, endChapter, endVerse, 'ESV'
    );
    console.log(passage.text.substring(0, 500) + '...');
    console.log();

    // 2. Historical context
    console.log('🏛️  CONTEXT FOR CONGREGATION');
    console.log('-'.repeat(70));
    const context = await this.rag.getContext(book, startChapter);
    console.log(`Period: ${context.period}`);
    console.log(`Setting: ${context.historical}`);
    console.log(`Archaeology: ${context.archaeological}`);
    console.log();

    // 3. Application suggestions
    console.log('💡 APPLICATION POINTS');
    console.log('-'.repeat(70));
    console.log(context.theological);
    console.log();

    console.log('='.repeat(70));
    console.log();
  }
}

/**
 * Run demonstration
 */
async function demonstrateRAGIntegration() {
  const system = new BiblicalContextSystem();

  try {
    // Example 1: Answer question about specific verse
    await system.answerQuestion(
      'Genesis', 1, 1,
      'What is the historical and cultural context of the creation account?'
    );

    // Example 2: Topic study
    await system.studyTopic('covenant');

    // Example 3: Sermon preparation
    await system.prepareSermon('John', 3, 16, 3, 21);

    // Example 4: Deep contextual study
    await system.answerQuestion(
      'Romans', 8, 28,
      'How does this verse relate to Paul\'s broader theology and the Roman cultural context?'
    );

  } catch (error) {
    console.error('Error:', error.message);
    console.error();
    console.error('NOTE: This demonstration works best with API keys configured.');
    console.error('See .env.example for setup instructions.');
  }
}

// Export for use in other modules
export { BiblicalContextSystem, MockRAGSystem };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRAGIntegration().catch(console.error);
}
