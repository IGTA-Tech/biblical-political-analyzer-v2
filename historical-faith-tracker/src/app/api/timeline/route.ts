import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  TimelineEvent,
  Era,
  DEFAULT_ERAS,
  Tradition,
  EventType,
} from '@/types/timeline';

// Sample data for development/demo when database is not available
const SAMPLE_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    title: 'Birth of Jesus Christ',
    year_start: -4,
    event_type: 'founding',
    traditions_affected: ['early_church', 'catholic', 'orthodox', 'protestant'],
    summary: 'Traditional date of the birth of Jesus of Nazareth in Bethlehem, marking the central event of Christianity.',
    location: 'Bethlehem, Judea',
    location_lat: 31.7054,
    location_lng: 35.2024,
    significance: 'major',
  },
  {
    id: '2',
    title: 'Crucifixion and Resurrection',
    year_start: 30,
    event_type: 'theological',
    traditions_affected: ['early_church', 'catholic', 'orthodox', 'protestant'],
    summary: 'The crucifixion, death, and reported resurrection of Jesus Christ, foundational events of Christian faith.',
    location: 'Jerusalem',
    location_lat: 31.7784,
    location_lng: 35.2291,
    significance: 'major',
  },
  {
    id: '3',
    title: 'Council of Jerusalem',
    year_start: 50,
    event_type: 'council',
    traditions_affected: ['early_church', 'catholic', 'orthodox', 'protestant'],
    summary: 'First church council, deciding that Gentile converts need not observe Mosaic law.',
    location: 'Jerusalem',
    significance: 'major',
  },
  {
    id: '4',
    title: 'Destruction of the Temple',
    year_start: 70,
    event_type: 'political',
    traditions_affected: ['jewish', 'early_church'],
    summary: 'Roman destruction of the Second Temple in Jerusalem, profoundly affecting both Judaism and early Christianity.',
    location: 'Jerusalem',
    significance: 'major',
  },
  {
    id: '5',
    title: 'Council of Nicaea',
    year_start: 325,
    event_type: 'council',
    traditions_affected: ['early_church', 'catholic', 'orthodox'],
    summary: 'First ecumenical council, establishing the Nicene Creed and addressing the Arian controversy.',
    location: 'Nicaea, Bithynia',
    location_lat: 40.4292,
    location_lng: 29.7211,
    significance: 'major',
  },
  {
    id: '6',
    title: 'Council of Chalcedon',
    year_start: 451,
    event_type: 'council',
    traditions_affected: ['catholic', 'orthodox'],
    summary: 'Fourth ecumenical council, defining the two natures of Christ and leading to the first major schism.',
    location: 'Chalcedon',
    significance: 'major',
  },
  {
    id: '7',
    title: 'Great Schism',
    year_start: 1054,
    event_type: 'schism',
    traditions_affected: ['catholic', 'orthodox'],
    summary: 'Formal split between Eastern Orthodox and Roman Catholic churches over theological and political differences.',
    location: 'Constantinople',
    significance: 'major',
  },
  {
    id: '8',
    title: 'First Crusade',
    year_start: 1096,
    year_end: 1099,
    event_type: 'political',
    traditions_affected: ['catholic', 'orthodox', 'islamic'],
    summary: 'Military expedition called by Pope Urban II to recapture the Holy Land from Muslim rule.',
    significance: 'major',
  },
  {
    id: '9',
    title: '95 Theses',
    year_start: 1517,
    event_type: 'reformation',
    traditions_affected: ['catholic', 'protestant'],
    summary: 'Martin Luther posts his 95 Theses, traditionally marking the start of the Protestant Reformation.',
    location: 'Wittenberg, Germany',
    location_lat: 51.8667,
    location_lng: 12.6500,
    significance: 'major',
  },
  {
    id: '10',
    title: 'Council of Trent',
    year_start: 1545,
    year_end: 1563,
    event_type: 'council',
    traditions_affected: ['catholic'],
    summary: 'Catholic counter-reformation council addressing Protestant criticisms and defining Catholic doctrine.',
    location: 'Trent, Italy',
    significance: 'major',
  },
  {
    id: '11',
    title: 'King James Bible Published',
    year_start: 1611,
    event_type: 'translation',
    traditions_affected: ['protestant'],
    summary: 'Publication of the Authorized King James Version, becoming the most influential English Bible translation.',
    location: 'London, England',
    significance: 'major',
  },
  {
    id: '12',
    title: 'First Great Awakening',
    year_start: 1730,
    year_end: 1755,
    event_type: 'cultural',
    traditions_affected: ['protestant'],
    summary: 'Religious revival movement in British America and Europe emphasizing personal religious experience.',
    significance: 'major',
  },
  {
    id: '13',
    title: 'First Vatican Council',
    year_start: 1869,
    year_end: 1870,
    event_type: 'council',
    traditions_affected: ['catholic'],
    summary: 'Catholic council defining papal infallibility and addressing modernist challenges to faith.',
    location: 'Vatican City',
    significance: 'major',
  },
  {
    id: '14',
    title: 'Second Vatican Council',
    year_start: 1962,
    year_end: 1965,
    event_type: 'council',
    traditions_affected: ['catholic'],
    summary: 'Transformative council modernizing Catholic liturgy and engaging with the modern world.',
    location: 'Vatican City',
    significance: 'major',
  },
  {
    id: '15',
    title: 'Dead Sea Scrolls Discovery',
    year_start: 1947,
    event_type: 'manuscript',
    traditions_affected: ['jewish', 'catholic', 'orthodox', 'protestant'],
    summary: 'Discovery of ancient Jewish manuscripts at Qumran, revolutionizing biblical scholarship.',
    location: 'Qumran, West Bank',
    location_lat: 31.7411,
    location_lng: 35.4594,
    significance: 'major',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const traditions = searchParams.get('traditions')?.split(',').filter(Boolean) as Tradition[] | undefined;
    const eventTypes = searchParams.get('eventTypes')?.split(',').filter(Boolean) as EventType[] | undefined;
    const eraIds = searchParams.get('eraIds')?.split(',').filter(Boolean);
    const searchQuery = searchParams.get('search') || undefined;
    const yearStart = searchParams.get('yearStart')
      ? parseInt(searchParams.get('yearStart')!, 10)
      : undefined;
    const yearEnd = searchParams.get('yearEnd')
      ? parseInt(searchParams.get('yearEnd')!, 10)
      : undefined;

    // Try to fetch from Supabase
    let events: TimelineEvent[] = [];
    let eras: Era[] = DEFAULT_ERAS;

    try {
      const supabase = createServerSupabaseClient();

      // Build events query
      let eventsQuery = supabase
        .from('timeline_events')
        .select('*')
        .order('year_start', { ascending: true });

      if (traditions?.length) {
        eventsQuery = eventsQuery.overlaps('traditions_affected', traditions);
      }

      if (eventTypes?.length) {
        eventsQuery = eventsQuery.in('event_type', eventTypes);
      }

      if (yearStart !== undefined) {
        eventsQuery = eventsQuery.gte('year_start', yearStart);
      }

      if (yearEnd !== undefined) {
        eventsQuery = eventsQuery.lte('year_start', yearEnd);
      }

      if (searchQuery) {
        eventsQuery = eventsQuery.or(
          `title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`
        );
      }

      const { data: eventsData, error: eventsError } = await eventsQuery;

      if (eventsError) {
        console.warn('Failed to fetch events from Supabase:', eventsError.message);
        // Fall back to sample data
        events = filterSampleEvents(SAMPLE_EVENTS, {
          traditions,
          eventTypes,
          eraIds,
          searchQuery,
          yearStart,
          yearEnd,
        });
      } else if (eventsData && eventsData.length > 0) {
        events = eventsData.map(mapDbEventToTimelineEvent);
      } else {
        // No data in database, use sample data
        events = filterSampleEvents(SAMPLE_EVENTS, {
          traditions,
          eventTypes,
          eraIds,
          searchQuery,
          yearStart,
          yearEnd,
        });
      }

      // Fetch eras
      const { data: erasData, error: erasError } = await supabase
        .from('eras')
        .select('*')
        .order('start_year', { ascending: true });

      if (!erasError && erasData && erasData.length > 0) {
        eras = erasData;
      }
    } catch {
      // Supabase not available, use sample data
      console.warn('Supabase not available, using sample data');
      events = filterSampleEvents(SAMPLE_EVENTS, {
        traditions,
        eventTypes,
        eraIds,
        searchQuery,
        yearStart,
        yearEnd,
      });
    }

    // Filter by era if specified
    if (eraIds?.length) {
      const selectedEras = eras.filter((era) => eraIds.includes(era.id));
      events = events.filter((event) =>
        selectedEras.some(
          (era) =>
            event.year_start >= era.start_year && event.year_start <= era.end_year
        )
      );
    }

    return NextResponse.json({
      events,
      eras,
      total: events.length,
    });
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline data' },
      { status: 500 }
    );
  }
}

// Helper function to map database row to TimelineEvent type
function mapDbEventToTimelineEvent(row: Record<string, unknown>): TimelineEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    year_start: row.year_start as number,
    year_end: row.year_end as number | undefined,
    event_type: row.event_type as EventType,
    traditions_affected: row.traditions_affected as Tradition[],
    summary: row.summary as string,
    location: row.location as string | undefined,
    location_lat: row.location_lat as number | undefined,
    location_lng: row.location_lng as number | undefined,
    sources: row.sources as string[] | undefined,
    significance: row.significance as 'major' | 'moderate' | 'minor' | undefined,
  };
}

// Helper function to filter sample events
function filterSampleEvents(
  events: TimelineEvent[],
  filters: {
    traditions?: Tradition[];
    eventTypes?: EventType[];
    eraIds?: string[];
    searchQuery?: string;
    yearStart?: number;
    yearEnd?: number;
  }
): TimelineEvent[] {
  let result = [...events];

  if (filters.traditions?.length) {
    result = result.filter((event) =>
      event.traditions_affected.some((t) =>
        filters.traditions?.includes(t as Tradition)
      )
    );
  }

  if (filters.eventTypes?.length) {
    result = result.filter((event) =>
      filters.eventTypes?.includes(event.event_type as EventType)
    );
  }

  if (filters.yearStart !== undefined) {
    result = result.filter((event) => event.year_start >= filters.yearStart!);
  }

  if (filters.yearEnd !== undefined) {
    result = result.filter((event) => event.year_start <= filters.yearEnd!);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.summary.toLowerCase().includes(query)
    );
  }

  return result;
}
