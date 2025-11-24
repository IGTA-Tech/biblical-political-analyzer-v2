/**
 * Basic Usage Example
 * Demonstrates simple verse, chapter, and passage retrieval
 */

import { BibleAPIClient } from '../BibleAPIClient.js';

async function demonstrateBasicUsage() {
  console.log('='.repeat(70));
  console.log('BIBLE API INTEGRATION - BASIC USAGE');
  console.log('='.repeat(70));
  console.log();

  // Initialize client
  const bible = new BibleAPIClient();

  try {
    // ========================================================================
    // Example 1: Get a single verse
    // ========================================================================
    console.log('Example 1: Get Single Verse');
    console.log('-'.repeat(70));

    const verse = await bible.getVerse('John', 3, 16, { versions: ['KJV'] });
    console.log(`Reference: ${verse.reference}`);
    console.log(`Text (KJV): ${verse.versions.KJV}`);
    console.log();

    // ========================================================================
    // Example 2: Get verse in multiple translations
    // ========================================================================
    console.log('Example 2: Multiple Translations');
    console.log('-'.repeat(70));

    const multiVerse = await bible.getVerse('Genesis', 1, 1, {
      versions: ['KJV', 'ESV', 'WEB']
    });

    console.log(`Reference: ${multiVerse.reference}`);
    console.log(`KJV: ${multiVerse.versions.KJV}`);
    console.log(`ESV: ${multiVerse.versions.ESV || 'N/A (requires API key)'}`);
    console.log(`WEB: ${multiVerse.versions.WEB}`);
    console.log();

    // ========================================================================
    // Example 3: Get entire chapter
    // ========================================================================
    console.log('Example 3: Get Entire Chapter');
    console.log('-'.repeat(70));

    const chapter = await bible.getChapter('Psalms', 23, 'KJV');
    console.log(`Reference: ${chapter.reference}`);
    console.log(`Version: ${chapter.version}`);
    console.log(`Text (first 200 chars): ${chapter.text.substring(0, 200)}...`);
    console.log();

    // ========================================================================
    // Example 4: Get passage (multiple verses)
    // ========================================================================
    console.log('Example 4: Get Passage (Multiple Verses)');
    console.log('-'.repeat(70));

    const passage = await bible.getPassage('Romans', 8, 28, 8, 39, 'KJV');
    console.log(`Reference: ${passage.reference}`);
    console.log(`Version: ${passage.version}`);
    console.log(`Text (first 300 chars): ${passage.text.substring(0, 300)}...`);
    console.log();

    // ========================================================================
    // Example 5: Compare translations
    // ========================================================================
    console.log('Example 5: Compare Translations');
    console.log('-'.repeat(70));

    const comparison = await bible.compareTranslations(
      'Proverbs', 3, 5,
      ['KJV', 'WEB'] // Add 'ESV', 'NASB' if you have API keys
    );

    console.log(`Reference: ${comparison.reference}`);
    for (const [version, text] of Object.entries(comparison.versions)) {
      if (typeof text === 'string') {
        console.log(`${version}: ${text}`);
      } else {
        console.log(`${version}: ${text.error}`);
      }
    }
    console.log();

    // ========================================================================
    // Example 6: Cache demonstration
    // ========================================================================
    console.log('Example 6: Cache Performance');
    console.log('-'.repeat(70));

    // First request (not cached)
    const start1 = Date.now();
    await bible.getVerse('Matthew', 5, 16, { versions: ['KJV'] });
    const time1 = Date.now() - start1;
    console.log(`First request (not cached): ${time1}ms`);

    // Second request (cached)
    const start2 = Date.now();
    await bible.getVerse('Matthew', 5, 16, { versions: ['KJV'] });
    const time2 = Date.now() - start2;
    console.log(`Second request (cached): ${time2}ms`);
    console.log(`Speed improvement: ${Math.round((time1 - time2) / time1 * 100)}%`);
    console.log();

    // ========================================================================
    // Cache statistics
    // ========================================================================
    console.log('Cache Statistics');
    console.log('-'.repeat(70));
    const stats = bible.getCacheStats();
    console.log(`Hits: ${stats.hits}`);
    console.log(`Misses: ${stats.misses}`);
    console.log(`Keys: ${stats.keys}`);
    console.log(`Hit rate: ${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%`);
    console.log();

  } catch (error) {
    console.error('Error:', error.message);
    console.error();
    console.error('Note: Some features require API keys.');
    console.error('Copy .env.example to .env and add your keys.');
  }

  console.log('='.repeat(70));
  console.log('END OF BASIC USAGE EXAMPLES');
  console.log('='.repeat(70));
}

// Run the demonstration
demonstrateBasicUsage().catch(console.error);
