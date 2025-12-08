// Timeline Types for Historical Faith Tracker

export interface TimelineEvent {
  id: string;
  title: string;
  year_start: number;
  year_end?: number;
  event_type: EventType;
  traditions_affected: Tradition[];
  summary: string;
  location?: string;
  location_lat?: number;
  location_lng?: number;
  sources?: string[];
  significance?: 'major' | 'moderate' | 'minor';
}

export interface Era {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  color: string;
  description?: string;
}

export interface TimelineFilters {
  traditions?: Tradition[];
  eventTypes?: EventType[];
  eraIds?: string[];
  searchQuery?: string;
  yearRange?: {
    start: number;
    end: number;
  };
}

export type Tradition =
  | 'catholic'
  | 'orthodox'
  | 'protestant'
  | 'jewish'
  | 'islamic'
  | 'early_church'
  | 'all';

export type EventType =
  | 'council'
  | 'schism'
  | 'reformation'
  | 'persecution'
  | 'founding'
  | 'theological'
  | 'political'
  | 'cultural'
  | 'missionary'
  | 'manuscript'
  | 'translation';

export interface TimelineState {
  events: TimelineEvent[];
  eras: Era[];
  filters: TimelineFilters;
  selectedEvent: TimelineEvent | null;
  zoomLevel: number;
  viewportStart: number;
  viewportEnd: number;
  isLoading: boolean;
  error: string | null;
}

export interface TimelineViewport {
  start: number;
  end: number;
  width: number;
  height: number;
}

export interface D3ScaleTime {
  domain: (domain: [Date, Date]) => D3ScaleTime;
  range: (range: [number, number]) => D3ScaleTime;
  (value: Date | number): number;
  invert: (value: number) => Date;
}

// Event type colors for visualization
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  council: '#C9A227',      // Gold - major ecclesiastical meetings
  schism: '#722F37',       // Burgundy - divisions
  reformation: '#4A90A4',  // Steel blue - reform movements
  persecution: '#8B0000',  // Dark red - persecutions
  founding: '#5C7A5C',     // Sage - new institutions
  theological: '#6B5B95',  // Purple - theological developments
  political: '#4A4A4A',    // Charcoal - political events
  cultural: '#D4A574',     // Tan - cultural shifts
  missionary: '#2E8B57',   // Sea green - missionary work
  manuscript: '#8B4513',   // Saddle brown - manuscripts
  translation: '#4682B4',  // Steel blue - translations
};

// Tradition colors for visualization
export const TRADITION_COLORS: Record<Tradition, string> = {
  catholic: '#C9A227',     // Gold
  orthodox: '#722F37',     // Burgundy
  protestant: '#4A90A4',   // Steel blue
  jewish: '#5C7A5C',       // Sage
  islamic: '#2E8B57',      // Sea green
  early_church: '#8B4513', // Saddle brown
  all: '#6B6B6B',          // Stone
};

// Default eras for the timeline
export const DEFAULT_ERAS: Era[] = [
  {
    id: 'apostolic',
    name: 'Apostolic Age',
    start_year: -4,
    end_year: 100,
    color: '#FDF8EE',
    description: 'The time of the apostles and earliest Christian communities',
  },
  {
    id: 'ante-nicene',
    name: 'Ante-Nicene Period',
    start_year: 100,
    end_year: 325,
    color: '#F5E6D3',
    description: 'Early church fathers before the Council of Nicaea',
  },
  {
    id: 'nicene',
    name: 'Nicene & Post-Nicene',
    start_year: 325,
    end_year: 590,
    color: '#EDD9C0',
    description: 'Era of the great ecumenical councils',
  },
  {
    id: 'early-medieval',
    name: 'Early Medieval',
    start_year: 590,
    end_year: 1054,
    color: '#E5CCB0',
    description: 'Rise of monasticism and papal authority',
  },
  {
    id: 'high-medieval',
    name: 'High Medieval',
    start_year: 1054,
    end_year: 1300,
    color: '#DDBFA0',
    description: 'East-West Schism to late scholasticism',
  },
  {
    id: 'late-medieval',
    name: 'Late Medieval',
    start_year: 1300,
    end_year: 1517,
    color: '#D5B290',
    description: 'Pre-Reformation tensions and reform movements',
  },
  {
    id: 'reformation',
    name: 'Reformation Era',
    start_year: 1517,
    end_year: 1648,
    color: '#CDA580',
    description: 'Protestant Reformation and Catholic Counter-Reformation',
  },
  {
    id: 'early-modern',
    name: 'Early Modern',
    start_year: 1648,
    end_year: 1789,
    color: '#C59870',
    description: 'Age of Enlightenment and religious wars',
  },
  {
    id: 'modern',
    name: 'Modern Era',
    start_year: 1789,
    end_year: 1962,
    color: '#BD8B60',
    description: 'Industrial age and global missions',
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    start_year: 1962,
    end_year: 2024,
    color: '#B57E50',
    description: 'Vatican II to present day',
  },
];
