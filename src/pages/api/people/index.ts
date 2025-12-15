/**
 * API Route: Get Biblical characters
 * Returns list of Biblical characters from database or fallback static data
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Character {
  id?: string;
  name: string;
  title?: string;
  alternate_names?: string[];
  era: string;
  testament: string;
  category: string;
  books: string[];
  significance: string;
  biography?: string;
  major_events?: string[];
  character_traits?: string[];
  appearance_count?: number;
}

// Fallback Biblical characters with metadata
const FALLBACK_CHARACTERS: Character[] = [
  // Patriarchs
  { name: 'Abraham', title: 'Father of Faith', alternate_names: ['Abram'], era: 'Patriarchal', testament: 'OT', category: 'patriarch', books: ['Genesis'], significance: 'Called by God, father of Israel through Isaac', appearance_count: 312, major_events: ['Call from Ur', 'Covenant with God', 'Binding of Isaac'], character_traits: ['Faithful', 'Obedient'] },
  { name: 'Isaac', title: 'Son of Promise', era: 'Patriarchal', testament: 'OT', category: 'patriarch', books: ['Genesis'], significance: 'Child of promise, blessed by God', appearance_count: 127, major_events: ['Miraculous birth', 'Binding on Mount Moriah', 'Marriage to Rebekah'], character_traits: ['Peaceful', 'Meditative'] },
  { name: 'Jacob', title: 'Israel', alternate_names: ['Israel'], era: 'Patriarchal', testament: 'OT', category: 'patriarch', books: ['Genesis'], significance: 'Renamed Israel, father of 12 tribes', appearance_count: 363, major_events: ['Buying the birthright', 'Ladder dream', 'Wrestling with God'], character_traits: ['Cunning', 'Determined', 'Transformed'] },
  { name: 'Joseph', title: 'The Dreamer', era: 'Patriarchal', testament: 'OT', category: 'patriarch', books: ['Genesis'], significance: 'Sold into slavery, became ruler of Egypt', appearance_count: 213, major_events: ['Coat of many colors', 'Sold into slavery', 'Ruling Egypt'], character_traits: ['Dreamer', 'Forgiving', 'Wise'] },

  // Matriarchs
  { name: 'Sarah', title: 'Mother of Nations', alternate_names: ['Sarai'], era: 'Patriarchal', testament: 'OT', category: 'matriarch', books: ['Genesis'], significance: 'Wife of Abraham, mother of Isaac', appearance_count: 56, major_events: ['Journey to Canaan', 'Birth of Isaac'], character_traits: ['Beautiful', 'Faithful'] },
  { name: 'Rebekah', title: 'Wife of Isaac', era: 'Patriarchal', testament: 'OT', category: 'matriarch', books: ['Genesis'], significance: 'Mother of Jacob and Esau', appearance_count: 31, major_events: ['Meeting Abraham\'s servant', 'Birth of twins'], character_traits: ['Beautiful', 'Hospitable'] },
  { name: 'Rachel', title: 'Beloved Wife', era: 'Patriarchal', testament: 'OT', category: 'matriarch', books: ['Genesis'], significance: 'Wife of Jacob, mother of Joseph', appearance_count: 47, major_events: ['Meeting Jacob', 'Birth of Joseph'], character_traits: ['Beautiful', 'Beloved'] },
  { name: 'Leah', title: 'First Wife of Jacob', era: 'Patriarchal', testament: 'OT', category: 'matriarch', books: ['Genesis'], significance: 'First wife of Jacob, mother of six tribes', appearance_count: 34, major_events: ['Marriage through deception', 'Bearing six sons'], character_traits: ['Faithful', 'Unloved'] },

  // Leaders
  { name: 'Moses', title: 'Lawgiver', era: 'Exodus', testament: 'OT', category: 'prophet', books: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'], significance: 'Led Israel from Egypt, received the Law', appearance_count: 847, major_events: ['Burning bush', 'Ten Plagues', 'Parting Red Sea', 'Receiving the Law'], character_traits: ['Humble', 'Faithful', 'Leader'] },
  { name: 'Aaron', title: 'First High Priest', era: 'Exodus', testament: 'OT', category: 'priest', books: ['Exodus', 'Leviticus', 'Numbers'], significance: 'First high priest of Israel, Moses\' spokesman', appearance_count: 347, major_events: ['Speaking for Moses', 'Golden calf sin', 'Ordained as priest'], character_traits: ['Eloquent', 'Faithful'] },
  { name: 'Joshua', title: 'Conqueror', era: 'Conquest', testament: 'OT', category: 'leader', books: ['Joshua'], significance: 'Led Israel into Promised Land', appearance_count: 218, major_events: ['Spying Canaan', 'Battle of Jericho', 'Sun standing still'], character_traits: ['Courageous', 'Faithful'] },
  { name: 'Samuel', title: 'Prophet and Judge', era: 'Judges', testament: 'OT', category: 'prophet', books: ['1 Samuel'], significance: 'Last judge, anointed first kings', appearance_count: 140, major_events: ['Hearing God\'s voice', 'Anointing Saul', 'Anointing David'], character_traits: ['Devoted', 'Prophetic'] },

  // Kings
  { name: 'Saul', title: 'First King', era: 'United Monarchy', testament: 'OT', category: 'king', books: ['1 Samuel'], significance: 'First king of Israel, rejected by God', appearance_count: 406, major_events: ['Anointing', 'Disobedience', 'Hunting David'], character_traits: ['Tall', 'Jealous', 'Tormented'] },
  { name: 'David', title: 'King of Israel', era: 'United Monarchy', testament: 'OT', category: 'king', books: ['1 Samuel', '2 Samuel', '1 Kings', 'Psalms'], significance: 'Greatest king, man after God\'s own heart', appearance_count: 1118, major_events: ['Killing Goliath', 'Friendship with Jonathan', 'Becoming king', 'Bathsheba incident'], character_traits: ['Brave', 'Musical', 'Repentant'] },
  { name: 'Solomon', title: 'Wisest King', era: 'United Monarchy', testament: 'OT', category: 'king', books: ['1 Kings', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'], significance: 'Built the Temple, known for wisdom', appearance_count: 295, major_events: ['Dream asking for wisdom', 'Building the Temple', 'Visit of Queen of Sheba'], character_traits: ['Wise', 'Wealthy', 'Builder'] },
  { name: 'Hezekiah', title: 'Faithful King', era: 'Divided Kingdom', testament: 'OT', category: 'king', books: ['2 Kings', 'Isaiah'], significance: 'Righteous king of Judah', appearance_count: 128, major_events: ['Temple reforms', 'Sennacherib\'s siege'], character_traits: ['Faithful', 'Reformer'] },

  // Prophets
  { name: 'Elijah', title: 'Prophet of Fire', era: 'Divided Kingdom', testament: 'OT', category: 'prophet', books: ['1 Kings', '2 Kings'], significance: 'Confronted Baal worship, taken to heaven', appearance_count: 69, major_events: ['Fed by ravens', 'Mount Carmel contest', 'Taken to heaven'], character_traits: ['Bold', 'Powerful'] },
  { name: 'Elisha', title: 'Successor of Elijah', era: 'Divided Kingdom', testament: 'OT', category: 'prophet', books: ['2 Kings'], significance: 'Performed many miracles', appearance_count: 58, major_events: ['Receiving mantle', 'Healing Naaman', 'Raising Shunammite\'s son'], character_traits: ['Faithful', 'Compassionate'] },
  { name: 'Isaiah', title: 'Messianic Prophet', era: 'Divided Kingdom', testament: 'OT', category: 'prophet', books: ['Isaiah'], significance: 'Major prophet, messianic prophecies', appearance_count: 37, major_events: ['Throne room vision', 'Messianic prophecies'], character_traits: ['Visionary', 'Bold'] },
  { name: 'Jeremiah', title: 'Weeping Prophet', era: 'Exile', testament: 'OT', category: 'prophet', books: ['Jeremiah', 'Lamentations'], significance: 'Warned of destruction, promised new covenant', appearance_count: 147, major_events: ['Temple sermon', 'New covenant prophecy'], character_traits: ['Faithful', 'Suffering'] },
  { name: 'Daniel', title: 'Prophet of Dreams', era: 'Exile', testament: 'OT', category: 'prophet', books: ['Daniel'], significance: 'Interpreter of dreams, survived lions\' den', appearance_count: 75, major_events: ['Interpreting dreams', 'Lions\' den'], character_traits: ['Wise', 'Faithful', 'Courageous'] },

  // Judges
  { name: 'Deborah', title: 'Judge and Prophetess', era: 'Judges', testament: 'OT', category: 'judge', books: ['Judges'], significance: 'Only female judge of Israel', appearance_count: 9, major_events: ['Judging Israel', 'Victory over Sisera'], character_traits: ['Wise', 'Courageous'] },
  { name: 'Gideon', title: 'Mighty Warrior', alternate_names: ['Jerubbaal'], era: 'Judges', testament: 'OT', category: 'judge', books: ['Judges'], significance: 'Defeated Midianites with 300 men', appearance_count: 39, major_events: ['Fleece test', 'Victory with 300'], character_traits: ['Doubtful initially', 'Obedient'] },
  { name: 'Samson', title: 'Strongest Man', era: 'Judges', testament: 'OT', category: 'judge', books: ['Judges'], significance: 'Nazirite with supernatural strength', appearance_count: 38, major_events: ['Lion encounter', 'Delilah\'s betrayal', 'Final victory'], character_traits: ['Strong', 'Impulsive'] },

  // Women of Faith
  { name: 'Ruth', title: 'The Faithful', era: 'Judges', testament: 'OT', category: 'matriarch', books: ['Ruth'], significance: 'Moabite convert, ancestor of David', appearance_count: 13, major_events: ['Choosing to follow Naomi', 'Marriage to Boaz'], character_traits: ['Loyal', 'Faithful'] },
  { name: 'Esther', title: 'Queen of Persia', era: 'Persian', testament: 'OT', category: 'queen', books: ['Esther'], significance: 'Saved Jewish people from destruction', appearance_count: 55, major_events: ['Becoming queen', 'Exposing Haman'], character_traits: ['Beautiful', 'Brave'] },

  // New Testament
  { name: 'Jesus', title: 'Son of God', alternate_names: ['Christ', 'Messiah', 'Yeshua'], era: 'Ministry', testament: 'both', category: 'messiah', books: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Revelation'], significance: 'The Christ, Savior of the world', appearance_count: 1281, major_events: ['Birth', 'Baptism', 'Crucifixion', 'Resurrection'], character_traits: ['Perfect', 'Loving', 'Compassionate'] },
  { name: 'Mary', title: 'Mother of Jesus', alternate_names: ['Miriam'], era: 'Ministry', testament: 'NT', category: 'family', books: ['Matthew', 'Luke', 'John', 'Acts'], significance: 'Virgin mother of Jesus', appearance_count: 19, major_events: ['Annunciation', 'Birth of Jesus', 'At the cross'], character_traits: ['Faithful', 'Humble'] },
  { name: 'Joseph of Nazareth', title: 'Earthly Father', era: 'Ministry', testament: 'NT', category: 'family', books: ['Matthew', 'Luke'], significance: 'Husband of Mary, raised Jesus', appearance_count: 14, major_events: ['Dream about Mary', 'Flight to Egypt'], character_traits: ['Righteous', 'Obedient'] },
  { name: 'John the Baptist', title: 'Forerunner', era: 'Ministry', testament: 'NT', category: 'prophet', books: ['Matthew', 'Mark', 'Luke', 'John'], significance: 'Prepared the way for Jesus', appearance_count: 35, major_events: ['Preaching in wilderness', 'Baptizing Jesus'], character_traits: ['Bold', 'Humble'] },

  // Apostles
  { name: 'Peter', title: 'The Rock', alternate_names: ['Simon', 'Cephas'], era: 'Early Church', testament: 'NT', category: 'apostle', books: ['Gospels', 'Acts', '1 Peter', '2 Peter'], significance: 'Leader of apostles, rock of church', appearance_count: 195, major_events: ['Walking on water', 'Denying Jesus', 'Pentecost sermon'], character_traits: ['Impulsive', 'Bold', 'Restored'] },
  { name: 'Paul', title: 'Apostle to Gentiles', alternate_names: ['Saul', 'Saul of Tarsus'], era: 'Early Church', testament: 'NT', category: 'apostle', books: ['Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'], significance: 'Former persecutor, greatest missionary', appearance_count: 185, major_events: ['Damascus road conversion', 'Missionary journeys'], character_traits: ['Zealous', 'Intellectual', 'Tireless'] },
  { name: 'John', title: 'Beloved Disciple', alternate_names: ['Son of Thunder'], era: 'Early Church', testament: 'NT', category: 'apostle', books: ['John', '1 John', '2 John', '3 John', 'Revelation'], significance: 'Closest to Jesus, wrote Revelation', appearance_count: 38, major_events: ['At the cross', 'Caring for Mary', 'Exile on Patmos'], character_traits: ['Loving', 'Faithful'] },
  { name: 'James', title: 'Son of Thunder', era: 'Early Church', testament: 'NT', category: 'apostle', books: ['Matthew', 'Mark', 'Luke', 'Acts'], significance: 'First apostle martyred', appearance_count: 21, major_events: ['Transfiguration', 'Martyrdom'], character_traits: ['Zealous', 'Faithful'] },
  { name: 'Matthew', title: 'Tax Collector', era: 'Early Church', testament: 'NT', category: 'apostle', books: ['Matthew'], significance: 'Former tax collector, Gospel writer', appearance_count: 8, major_events: ['Called by Jesus'], character_traits: ['Detail-oriented'] },
  { name: 'Luke', title: 'The Physician', era: 'Early Church', testament: 'NT', category: 'companion', books: ['Luke', 'Acts'], significance: 'Gentile physician, historian', appearance_count: 3, major_events: ['Traveling with Paul', 'Writing Gospel and Acts'], character_traits: ['Careful', 'Loyal'] },
  { name: 'Barnabas', title: 'Son of Encouragement', era: 'Early Church', testament: 'NT', category: 'companion', books: ['Acts'], significance: 'Encourager, missionary partner', appearance_count: 28, major_events: ['Introducing Paul', 'First missionary journey'], character_traits: ['Encouraging', 'Generous'] },
  { name: 'Timothy', title: 'Young Pastor', era: 'Early Church', testament: 'NT', category: 'companion', books: ['1 Timothy', '2 Timothy'], significance: 'Protege of Paul', appearance_count: 24, major_events: ['Joining Paul', 'Leading Ephesus'], character_traits: ['Faithful', 'Devoted'] },
  { name: 'Mary Magdalene', title: 'First Witness of Resurrection', era: 'Ministry', testament: 'NT', category: 'disciple', books: ['Matthew', 'Mark', 'Luke', 'John'], significance: 'First to see risen Christ', appearance_count: 12, major_events: ['At crucifixion', 'First to see risen Jesus'], character_traits: ['Devoted', 'Faithful'] },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, testament, era, search } = req.query;

  let characters: Character[] = [];
  let source = 'fallback';

  // Try to get from database first
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if table exists and has data
      const { count, error: countError } = await supabase
        .from('biblical_characters')
        .select('*', { count: 'exact', head: true });

      if (!countError && count && count > 0) {
        // Fetch from database
        let query = supabase
          .from('biblical_characters')
          .select('*');

        if (category && typeof category === 'string') {
          query = query.eq('category', category);
        }

        if (testament && typeof testament === 'string') {
          if (testament === 'old' || testament === 'OT') {
            query = query.or('testament.eq.OT,testament.eq.both');
          } else if (testament === 'new' || testament === 'NT') {
            query = query.or('testament.eq.NT,testament.eq.both');
          }
        }

        if (era && typeof era === 'string') {
          query = query.ilike('era', `%${era}%`);
        }

        if (search && typeof search === 'string') {
          query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,significance.ilike.%${search}%`);
        }

        const { data, error } = await query.order('appearance_count', { ascending: false });

        if (!error && data && data.length > 0) {
          characters = data;
          source = 'database';
        }
      }
    } catch (error) {
      console.error('Database error, using fallback:', error);
    }
  }

  // Use fallback data if database not available
  if (characters.length === 0) {
    characters = [...FALLBACK_CHARACTERS];

    if (category && typeof category === 'string') {
      characters = characters.filter(c => c.category === category);
    }

    if (testament && typeof testament === 'string') {
      const testamentValue = testament === 'old' ? 'OT' : testament === 'new' ? 'NT' : testament;
      characters = characters.filter(c => c.testament === testamentValue || c.testament === 'both');
    }

    if (era && typeof era === 'string') {
      characters = characters.filter(c => c.era.toLowerCase().includes(era.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      characters = characters.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.title?.toLowerCase().includes(searchLower) ||
        c.significance?.toLowerCase().includes(searchLower) ||
        c.alternate_names?.some(n => n.toLowerCase().includes(searchLower))
      );
    }

    // Sort by appearance count
    characters.sort((a, b) => (b.appearance_count || 0) - (a.appearance_count || 0));
  }

  // Get unique categories and eras for filters
  const allChars = source === 'database' ? characters : FALLBACK_CHARACTERS;
  const categories = [...new Set(allChars.map(c => c.category))];
  const eras = [...new Set(allChars.map(c => c.era))];

  res.status(200).json({
    characters,
    total: characters.length,
    source,
    filters: {
      categories,
      eras,
      testaments: ['OT', 'NT'],
    },
  });
}
