/**
 * Original Languages Example
 * Demonstrates Hebrew (OT) and Greek (NT) access with Strong's numbers
 */

import { BibleAPIClient } from '../BibleAPIClient.js';

async function demonstrateOriginalLanguages() {
  console.log('='.repeat(70));
  console.log('BIBLE API INTEGRATION - ORIGINAL LANGUAGES');
  console.log('='.repeat(70));
  console.log();

  const bible = new BibleAPIClient();

  try {
    // ========================================================================
    // Example 1: Hebrew Text (Old Testament)
    // ========================================================================
    console.log('Example 1: Hebrew Text - Genesis 1:1');
    console.log('-'.repeat(70));
    console.log('NOTE: Requires Blue Letter Bible API key');
    console.log();

    try {
      const hebrew = await bible.getOriginalLanguage('Genesis', 1, 1);

      console.log(`Reference: ${hebrew.reference}`);
      console.log(`Language: ${hebrew.language}`);
      console.log(`Original Text: ${hebrew.text}`);
      console.log(`Transliteration: ${hebrew.transliteration}`);
      console.log();

      if (hebrew.strongs && hebrew.strongs.length > 0) {
        console.log('Strong\'s Numbers:');
        hebrew.strongs.slice(0, 3).forEach(item => {
          console.log(`  - ${item.word}: ${item.strongs.join(', ')}`);
        });
        console.log();
      }

      if (hebrew.interlinear && hebrew.interlinear.length > 0) {
        console.log('Interlinear (first 3 words):');
        hebrew.interlinear.slice(0, 3).forEach(word => {
          console.log(`  Hebrew: ${word.original}`);
          console.log(`  Transliteration: ${word.transliteration}`);
          console.log(`  English: ${word.english}`);
          console.log(`  Strong's: ${word.strongs.join(', ')}`);
          console.log();
        });
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
      console.log('This feature requires a Blue Letter Bible API key.');
      console.log();
    }

    // ========================================================================
    // Example 2: Greek Text (New Testament)
    // ========================================================================
    console.log('Example 2: Greek Text - John 1:1');
    console.log('-'.repeat(70));
    console.log('NOTE: Requires Blue Letter Bible API key');
    console.log();

    try {
      const greek = await bible.getOriginalLanguage('John', 1, 1);

      console.log(`Reference: ${greek.reference}`);
      console.log(`Language: ${greek.language}`);
      console.log(`Original Text: ${greek.text}`);
      console.log(`Transliteration: ${greek.transliteration}`);
      console.log();

      if (greek.strongs && greek.strongs.length > 0) {
        console.log('Strong\'s Numbers:');
        greek.strongs.slice(0, 3).forEach(item => {
          console.log(`  - ${item.word}: ${item.strongs.join(', ')}`);
        });
        console.log();
      }

      if (greek.morphology && greek.morphology.length > 0) {
        console.log('Morphology (grammatical analysis):');
        greek.morphology.slice(0, 3).forEach(item => {
          console.log(`  - ${item.word}: ${item.morphology}`);
        });
        console.log();
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
      console.log('This feature requires a Blue Letter Bible API key.');
      console.log();
    }

    // ========================================================================
    // Example 3: Strong's Number Definition
    // ========================================================================
    console.log('Example 3: Strong\'s Number Definition');
    console.log('-'.repeat(70));
    console.log('NOTE: Requires Blue Letter Bible API key');
    console.log();

    try {
      // H430 - Elohim (God in Hebrew)
      const strongsH430 = await bible.getStrongsDefinition('H430');

      console.log('Strong\'s H430 (Hebrew):');
      console.log(`  Number: ${strongsH430.strongsNumber}`);
      console.log(`  Transliteration: ${strongsH430.transliteration}`);
      console.log(`  Pronunciation: ${strongsH430.pronunciation}`);
      console.log(`  Definition: ${strongsH430.definition}`);
      console.log(`  Long Definition: ${strongsH430.longDefinition?.substring(0, 200)}...`);
      console.log();

      // G3056 - Logos (Word in Greek)
      const strongsG3056 = await bible.getStrongsDefinition('G3056');

      console.log('Strong\'s G3056 (Greek):');
      console.log(`  Number: ${strongsG3056.strongsNumber}`);
      console.log(`  Transliteration: ${strongsG3056.transliteration}`);
      console.log(`  Pronunciation: ${strongsG3056.pronunciation}`);
      console.log(`  Definition: ${strongsG3056.definition}`);
      console.log(`  KJV Translations: ${strongsG3056.kjvTranslations?.substring(0, 200)}...`);
      console.log();
    } catch (error) {
      console.log(`Error: ${error.message}`);
      console.log('This feature requires a Blue Letter Bible API key.');
      console.log();
    }

    // ========================================================================
    // Example 4: Famous Verses in Original Languages
    // ========================================================================
    console.log('Example 4: Famous Verses in Original Languages');
    console.log('-'.repeat(70));

    const famousVerses = [
      { book: 'Genesis', chapter: 1, verse: 1, note: 'Creation' },
      { book: 'Exodus', chapter: 3, verse: 14, note: 'I AM WHO I AM' },
      { book: 'Psalms', chapter: 23, verse: 1, note: 'The LORD is my shepherd' },
      { book: 'Isaiah', chapter: 53, verse: 5, note: 'Suffering Servant' },
      { book: 'John', chapter: 3, verse: 16, note: 'God so loved the world' },
      { book: 'Romans', chapter: 8, verse: 28, note: 'All things work together' }
    ];

    for (const v of famousVerses) {
      try {
        const original = await bible.getOriginalLanguage(v.book, v.chapter, v.verse);
        console.log(`${v.book} ${v.chapter}:${v.verse} (${v.note})`);
        console.log(`  Language: ${original.language}`);
        console.log(`  Original: ${original.text.substring(0, 100)}...`);
        console.log(`  Transliteration: ${original.transliteration.substring(0, 100)}...`);
        console.log();
      } catch (error) {
        console.log(`${v.book} ${v.chapter}:${v.verse} - ${error.message}`);
        console.log();
      }
    }

    // ========================================================================
    // Example 5: Word Study Workflow
    // ========================================================================
    console.log('Example 5: Complete Word Study Workflow');
    console.log('-'.repeat(70));
    console.log('Studying "love" in 1 John 4:8 (Greek: agape)');
    console.log();

    try {
      // Step 1: Get original language text
      const verse = await bible.getOriginalLanguage('1 John', 4, 8);
      console.log('Step 1: Original Greek text');
      console.log(`  Text: ${verse.text}`);
      console.log(`  Transliteration: ${verse.transliteration}`);
      console.log();

      // Step 2: Identify Strong's numbers
      if (verse.strongs && verse.strongs.length > 0) {
        console.log('Step 2: Identify Strong\'s numbers for key words');
        const loveWord = verse.strongs.find(s =>
          s.word.includes('ἀγάπη') || s.strongs.includes('G26')
        );
        if (loveWord) {
          console.log(`  Found: ${loveWord.word} - ${loveWord.strongs.join(', ')}`);
          console.log();

          // Step 3: Get definition
          console.log('Step 3: Look up definition');
          for (const strongsNum of loveWord.strongs) {
            const def = await bible.getStrongsDefinition(strongsNum);
            console.log(`  ${def.strongsNumber}: ${def.transliteration}`);
            console.log(`  Definition: ${def.definition}`);
            console.log();
          }
        }
      }

      // Step 4: Get cross-references
      console.log('Step 4: Find cross-references');
      const crossRefs = await bible.getCrossReferences('1 John', 4, 8);
      console.log(`  Found ${crossRefs.length} cross-references`);
      crossRefs.slice(0, 3).forEach(ref => {
        console.log(`  - ${ref.reference}: ${ref.text?.substring(0, 80)}...`);
      });
      console.log();

    } catch (error) {
      console.log(`Error in word study: ${error.message}`);
      console.log();
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error();
    console.error('IMPORTANT: Original language features require API keys!');
    console.error('Get Blue Letter Bible API key: https://www.blueletterbible.org/api/register');
    console.error('Copy .env.example to .env and add your BLUE_LETTER_BIBLE_API_KEY');
  }

  console.log('='.repeat(70));
  console.log('END OF ORIGINAL LANGUAGES EXAMPLES');
  console.log('='.repeat(70));
}

// Run the demonstration
demonstrateOriginalLanguages().catch(console.error);
