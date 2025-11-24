/**
 * Biblical Themes Taxonomy
 * Comprehensive list of biblical themes with keywords for matching to modern/historical events
 */

export const biblicalThemes = {
  // ===========================================================================
  // DISPLACEMENT & MIGRATION
  // ===========================================================================
  exile: {
    name: 'Exile & Diaspora',
    description: 'Forced removal from homeland, displacement, refugee situations',
    keywords: [
      'exile', 'diaspora', 'displacement', 'refugee', 'deportation', 'forced migration',
      'expelled', 'banished', 'scattered', 'captivity', 'captive', 'homeless',
      'migration crisis', 'internally displaced', 'asylum', 'ethnic cleansing'
    ],
    biblicalExamples: [
      'Babylonian Exile (586 BCE)',
      'Assyrian deportations (722 BCE)',
      'Egyptian sojourn',
      'Post-70 CE Jewish diaspora'
    ],
    severity: 'high'
  },

  // ===========================================================================
  // EMPIRE & POWER
  // ===========================================================================
  empireCollapse: {
    name: 'Empire Collapse',
    description: 'Fall of empires, dissolution of major powers, regime change',
    keywords: [
      'empire fall', 'collapse', 'downfall', 'regime change', 'revolution',
      'coup', 'overthrow', 'dissolution', 'independence', 'secession',
      'civil war', 'uprising', 'rebellion', 'transition of power'
    ],
    biblicalExamples: [
      'Babylonian conquest of Judah',
      'Persian conquest of Babylon',
      'Greek conquest of Persia',
      'Roman destruction of Jerusalem'
    ],
    severity: 'high'
  },

  empireRise: {
    name: 'Empire Rise',
    description: 'Rise of new powers, expansion of empires, consolidation of power',
    keywords: [
      'rise', 'expansion', 'conquest', 'annexation', 'imperialism',
      'superpower', 'hegemony', 'dominance', 'empire building',
      'territorial expansion', 'military buildup'
    ],
    biblicalExamples: [
      'Assyrian Empire expansion',
      'Babylonian rise under Nebuchadnezzar',
      'Roman Empire expansion',
      'Macedonian empire under Alexander'
    ],
    severity: 'medium'
  },

  // ===========================================================================
  // PERSECUTION & OPPRESSION
  // ===========================================================================
  religiousPersecution: {
    name: 'Religious Persecution',
    description: 'Persecution based on faith, religious freedom violations',
    keywords: [
      'persecution', 'martyrdom', 'religious freedom', 'faith-based violence',
      'genocide', 'pogrom', 'inquisition', 'blasphemy laws', 'apostasy',
      'religious minorities', 'sectarian violence', 'forced conversion',
      'church persecution', 'mosque destruction', 'temple desecration'
    ],
    biblicalExamples: [
      'Maccabean persecution under Antiochus IV',
      'Roman persecution of Christians',
      'Babylonian idol worship coercion',
      'Egyptian oppression of Hebrews'
    ],
    severity: 'high'
  },

  socialOppression: {
    name: 'Social Oppression',
    description: 'Slavery, forced labor, systemic injustice, human rights violations',
    keywords: [
      'slavery', 'forced labor', 'human trafficking', 'oppression',
      'exploitation', 'indentured servitude', 'child labor', 'bonded labor',
      'systemic injustice', 'human rights', 'labor abuse', 'sweatshops'
    ],
    biblicalExamples: [
      'Hebrew slavery in Egypt',
      'Babylonian forced labor',
      'Roman slavery system',
      'Prophetic denouncement of oppression'
    ],
    severity: 'high'
  },

  // ===========================================================================
  // ECONOMIC & SOCIAL JUSTICE
  // ===========================================================================
  economicInjustice: {
    name: 'Economic Injustice',
    description: 'Wealth inequality, poverty, exploitation of poor',
    keywords: [
      'inequality', 'poverty', 'wealth gap', 'exploitation', 'debt crisis',
      'foreclosure', 'usury', 'wage theft', 'economic justice',
      'income inequality', 'wealth distribution', 'land grabbing',
      'monopoly', 'corruption', 'bribery', 'exploitation of poor'
    ],
    biblicalExamples: [
      'Prophetic calls for justice (Amos, Micah)',
      'Jubilee year concept',
      'Nehemiah\'s reforms against usury',
      'Jesus and money changers'
    ],
    severity: 'medium'
  },

  socialJustice: {
    name: 'Social Justice Movements',
    description: 'Movements for equality, civil rights, reform',
    keywords: [
      'civil rights', 'equality', 'justice movement', 'reform',
      'protest', 'demonstration', 'activism', 'advocacy',
      'women\'s rights', 'minority rights', 'labor rights',
      'abolition', 'emancipation', 'suffrage'
    ],
    biblicalExamples: [
      'Prophets calling for justice',
      'Jesus challenging religious hierarchy',
      'Early church community of goods',
      'Liberation themes in Exodus'
    ],
    severity: 'medium'
  },

  // ===========================================================================
  // DISASTER & CALAMITY
  // ===========================================================================
  famine: {
    name: 'Famine & Food Crisis',
    description: 'Severe food shortages, agricultural collapse, starvation',
    keywords: [
      'famine', 'hunger', 'starvation', 'food crisis', 'drought',
      'crop failure', 'food shortage', 'malnutrition', 'food insecurity',
      'agricultural crisis', 'food scarcity'
    ],
    biblicalExamples: [
      'Joseph and seven-year famine in Egypt',
      'Famine in time of Elijah',
      'Siege famines in Jerusalem',
      'Prophetic warnings of famine'
    ],
    severity: 'high'
  },

  plague: {
    name: 'Plague & Pandemic',
    description: 'Disease outbreaks, epidemics, public health crises',
    keywords: [
      'plague', 'pandemic', 'epidemic', 'disease outbreak', 'virus',
      'contagion', 'health crisis', 'pestilence', 'infection',
      'public health emergency', 'quarantine', 'vaccination',
      'COVID', 'coronavirus', 'influenza', 'cholera', 'smallpox'
    ],
    biblicalExamples: [
      'Egyptian plagues',
      'Plague in David\'s census',
      'Pestilence as judgment',
      'Healing narratives'
    ],
    severity: 'high'
  },

  naturalDisaster: {
    name: 'Natural Disasters',
    description: 'Earthquakes, floods, storms, environmental catastrophes',
    keywords: [
      'earthquake', 'flood', 'tsunami', 'hurricane', 'tornado',
      'storm', 'wildfire', 'volcanic eruption', 'landslide',
      'natural disaster', 'environmental catastrophe', 'climate disaster'
    ],
    biblicalExamples: [
      'Noah\'s flood',
      'Sodom and Gomorrah destruction',
      'Earthquake at Jesus\' crucifixion',
      'Storms at sea'
    ],
    severity: 'high'
  },

  // ===========================================================================
  // WAR & CONFLICT
  // ===========================================================================
  war: {
    name: 'War & Armed Conflict',
    description: 'Wars, battles, military conflicts, invasions',
    keywords: [
      'war', 'conflict', 'battle', 'invasion', 'military action',
      'armed conflict', 'warfare', 'siege', 'combat', 'attack',
      'military intervention', 'occupation', 'bombardment', 'air strike'
    ],
    biblicalExamples: [
      'Conquest of Canaan',
      'Babylonian siege of Jerusalem',
      'Maccabean revolt',
      'Roman wars'
    ],
    severity: 'high'
  },

  peace: {
    name: 'Peace & Reconciliation',
    description: 'Peace treaties, conflict resolution, reconciliation',
    keywords: [
      'peace treaty', 'ceasefire', 'armistice', 'reconciliation',
      'peace accord', 'peace talks', 'negotiation', 'mediation',
      'conflict resolution', 'peace process', 'peace agreement'
    ],
    biblicalExamples: [
      'Abraham and Lot\'s separation',
      'Jacob and Esau reconciliation',
      'Prophetic visions of peace',
      'Prince of Peace prophecies'
    ],
    severity: 'low'
  },

  // ===========================================================================
  // RELIGIOUS & SPIRITUAL
  // ===========================================================================
  prophecyFulfillment: {
    name: 'Prophetic Warning & Fulfillment',
    description: 'Warnings being vindicated, predictions coming true',
    keywords: [
      'warning', 'prediction', 'forecast', 'prophecy', 'foretold',
      'predicted', 'warning signs', 'vindicated', 'came to pass',
      'fulfillment', 'realization', 'validation'
    ],
    biblicalExamples: [
      'Jeremiah\'s warnings about Babylon',
      'Isaiah\'s prophecies',
      'Daniel\'s visions',
      'Jesus\' predictions about temple'
    ],
    severity: 'medium'
  },

  templeDestruction: {
    name: 'Temple/Holy Site Destruction',
    description: 'Destruction of religious sites, cultural heritage destruction',
    keywords: [
      'temple destruction', 'church destruction', 'mosque destruction',
      'holy site', 'cultural heritage', 'religious site', 'shrine',
      'iconoclasm', 'desecration', 'vandalism of religious sites',
      'cultural destruction', 'heritage site'
    ],
    biblicalExamples: [
      'Solomon\'s Temple destruction (586 BCE)',
      'Second Temple destruction (70 CE)',
      'Altars destroyed by reformers',
      'Idol temple destructions'
    ],
    severity: 'medium'
  },

  restoration: {
    name: 'Restoration & Rebuilding',
    description: 'Rebuilding after destruction, restoration of nations',
    keywords: [
      'restoration', 'rebuilding', 'reconstruction', 'revival',
      'renewal', 'return', 'repatriation', 'independence',
      'nation building', 'recovery', 'reconstruction'
    ],
    biblicalExamples: [
      'Return from Babylonian exile',
      'Rebuilding of temple (Ezra-Nehemiah)',
      'Restoration prophecies',
      'Promise of renewal'
    ],
    severity: 'low'
  },

  spiritualAwakening: {
    name: 'Spiritual Awakening & Revival',
    description: 'Religious revivals, spiritual movements, conversions',
    keywords: [
      'revival', 'awakening', 'religious movement', 'conversion',
      'spiritual renewal', 'reformation', 'evangelism', 'missionary',
      'church growth', 'religious renaissance', 'great awakening'
    ],
    biblicalExamples: [
      'Josiah\'s reforms',
      'Nehemiah\'s covenant renewal',
      'Pentecost',
      'Early church growth'
    ],
    severity: 'low'
  },

  // ===========================================================================
  // LEADERSHIP & GOVERNANCE
  // ===========================================================================
  leadershipTransition: {
    name: 'Leadership Transition',
    description: 'Changes in leadership, succession, political transitions',
    keywords: [
      'leadership change', 'succession', 'transition', 'new leader',
      'election', 'inauguration', 'coronation', 'abdication',
      'regime change', 'power transfer', 'new government'
    ],
    biblicalExamples: [
      'Saul to David',
      'David to Solomon',
      'Kings of Israel/Judah',
      'Roman emperors'
    ],
    severity: 'low'
  },

  corruption: {
    name: 'Corruption & Moral Decay',
    description: 'Political corruption, moral decline, societal decay',
    keywords: [
      'corruption', 'scandal', 'bribery', 'embezzlement', 'fraud',
      'moral decay', 'decadence', 'vice', 'immorality',
      'abuse of power', 'nepotism', 'cronyism'
    ],
    biblicalExamples: [
      'Judges period: "everyone did what was right in their own eyes"',
      'Kings\' apostasy and corruption',
      'Prophetic denouncements',
      'Jesus condemning Pharisees'
    ],
    severity: 'medium'
  },

  // ===========================================================================
  // COVENANT & TREATY
  // ===========================================================================
  covenant: {
    name: 'Covenant & Treaty Making',
    description: 'International agreements, treaties, covenants',
    keywords: [
      'treaty', 'agreement', 'covenant', 'pact', 'accord',
      'alliance', 'international agreement', 'compact', 'charter',
      'convention', 'protocol', 'memorandum', 'United Nations'
    ],
    biblicalExamples: [
      'Abrahamic covenant',
      'Mosaic covenant',
      'Davidic covenant',
      'New covenant'
    ],
    severity: 'low'
  },

  // ===========================================================================
  // ENVIRONMENTAL
  // ===========================================================================
  environmental: {
    name: 'Environmental Crisis',
    description: 'Climate change, environmental destruction, ecological disaster',
    keywords: [
      'climate change', 'global warming', 'environmental crisis',
      'deforestation', 'pollution', 'extinction', 'biodiversity loss',
      'ecological disaster', 'environmental destruction',
      'sea level rise', 'greenhouse gases', 'carbon emissions'
    ],
    biblicalExamples: [
      'Creation care mandate',
      'Sabbath year for land',
      'Prophetic imagery of land mourning',
      'Noah\'s flood (climate catastrophe)'
    ],
    severity: 'high'
  }
};

/**
 * Get all theme names
 */
export function getAllThemeNames() {
  return Object.keys(biblicalThemes);
}

/**
 * Get theme by name
 */
export function getTheme(themeName) {
  return biblicalThemes[themeName];
}

/**
 * Get all keywords across all themes
 */
export function getAllKeywords() {
  const allKeywords = [];
  for (const theme of Object.values(biblicalThemes)) {
    allKeywords.push(...theme.keywords);
  }
  return [...new Set(allKeywords)]; // Remove duplicates
}

/**
 * Find themes by keyword
 */
export function findThemesByKeyword(keyword) {
  const matchingThemes = [];
  const lowerKeyword = keyword.toLowerCase();

  for (const [themeName, theme] of Object.entries(biblicalThemes)) {
    if (theme.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
      matchingThemes.push(themeName);
    }
  }

  return matchingThemes;
}

/**
 * Get high severity themes
 */
export function getHighSeverityThemes() {
  return Object.entries(biblicalThemes)
    .filter(([_, theme]) => theme.severity === 'high')
    .map(([name, _]) => name);
}

export default biblicalThemes;
