'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TimelineEvent,
  Era,
  TimelineFilters,
  TimelineState,
  DEFAULT_ERAS,
} from '@/types/timeline';

// Timeline boundaries
const TIMELINE_START_YEAR = -4; // 4 BC
const TIMELINE_END_YEAR = 2024; // Present

interface UseTimelineOptions {
  initialFilters?: TimelineFilters;
  enableAutoFetch?: boolean;
}

interface UseTimelineReturn extends TimelineState {
  // Actions
  setFilters: (filters: TimelineFilters) => void;
  updateFilter: <K extends keyof TimelineFilters>(
    key: K,
    value: TimelineFilters[K]
  ) => void;
  clearFilters: () => void;
  selectEvent: (event: TimelineEvent | null) => void;
  setZoomLevel: (level: number) => void;
  setViewport: (start: number, end: number) => void;
  refetch: () => Promise<void>;
  // Computed values
  filteredEvents: TimelineEvent[];
  visibleEvents: TimelineEvent[];
  timelineRange: { start: number; end: number };
}

export function useTimeline(options: UseTimelineOptions = {}): UseTimelineReturn {
  const { initialFilters = {}, enableAutoFetch = true } = options;

  // State
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eras, setEras] = useState<Era[]>(DEFAULT_ERAS);
  const [filters, setFilters] = useState<TimelineFilters>(initialFilters);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewportStart, setViewportStart] = useState(TIMELINE_START_YEAR);
  const [viewportEnd, setViewportEnd] = useState(TIMELINE_END_YEAR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch timeline data from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params from filters
      const params = new URLSearchParams();

      if (filters.traditions?.length) {
        params.set('traditions', filters.traditions.join(','));
      }
      if (filters.eventTypes?.length) {
        params.set('eventTypes', filters.eventTypes.join(','));
      }
      if (filters.eraIds?.length) {
        params.set('eraIds', filters.eraIds.join(','));
      }
      if (filters.searchQuery) {
        params.set('search', filters.searchQuery);
      }
      if (filters.yearRange) {
        params.set('yearStart', filters.yearRange.start.toString());
        params.set('yearEnd', filters.yearRange.end.toString());
      }

      const queryString = params.toString();
      const url = `/api/timeline${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch timeline data: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.events) {
        setEvents(data.events);
      }
      if (data.eras) {
        setEras(data.eras);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Timeline fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (enableAutoFetch) {
      fetchData();
    }
  }, [enableAutoFetch, fetchData]);

  // Filter update helpers
  const updateFilter = useCallback(
    <K extends keyof TimelineFilters>(key: K, value: TimelineFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Viewport controls
  const handleSetViewport = useCallback((start: number, end: number) => {
    setViewportStart(Math.max(TIMELINE_START_YEAR, start));
    setViewportEnd(Math.min(TIMELINE_END_YEAR, end));
  }, []);

  const handleSetZoomLevel = useCallback(
    (level: number) => {
      const clampedLevel = Math.max(0.1, Math.min(10, level));
      setZoomLevel(clampedLevel);

      // Adjust viewport based on zoom
      const totalRange = TIMELINE_END_YEAR - TIMELINE_START_YEAR;
      const viewportRange = totalRange / clampedLevel;
      const center = (viewportStart + viewportEnd) / 2;

      handleSetViewport(center - viewportRange / 2, center + viewportRange / 2);
    },
    [viewportStart, viewportEnd, handleSetViewport]
  );

  // Computed: filtered events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by traditions
    if (filters.traditions?.length) {
      result = result.filter((event) =>
        event.traditions_affected.some((t) => filters.traditions?.includes(t))
      );
    }

    // Filter by event types
    if (filters.eventTypes?.length) {
      result = result.filter((event) =>
        filters.eventTypes?.includes(event.event_type)
      );
    }

    // Filter by era IDs
    if (filters.eraIds?.length) {
      const selectedEras = eras.filter((era) => filters.eraIds?.includes(era.id));
      result = result.filter((event) =>
        selectedEras.some(
          (era) =>
            event.year_start >= era.start_year && event.year_start <= era.end_year
        )
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.summary.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
      );
    }

    // Filter by year range
    if (filters.yearRange) {
      result = result.filter(
        (event) =>
          event.year_start >= filters.yearRange!.start &&
          event.year_start <= filters.yearRange!.end
      );
    }

    return result;
  }, [events, eras, filters]);

  // Computed: visible events (within current viewport)
  const visibleEvents = useMemo(() => {
    return filteredEvents.filter(
      (event) =>
        event.year_start >= viewportStart && event.year_start <= viewportEnd
    );
  }, [filteredEvents, viewportStart, viewportEnd]);

  // Timeline range
  const timelineRange = useMemo(
    () => ({
      start: TIMELINE_START_YEAR,
      end: TIMELINE_END_YEAR,
    }),
    []
  );

  return {
    // State
    events,
    eras,
    filters,
    selectedEvent,
    zoomLevel,
    viewportStart,
    viewportEnd,
    isLoading,
    error,
    // Actions
    setFilters,
    updateFilter,
    clearFilters,
    selectEvent: setSelectedEvent,
    setZoomLevel: handleSetZoomLevel,
    setViewport: handleSetViewport,
    refetch: fetchData,
    // Computed
    filteredEvents,
    visibleEvents,
    timelineRange,
  };
}

// Hook for fetching a single event
export function useTimelineEvent(eventId: string | null) {
  const [event, setEvent] = useState<TimelineEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/timeline/${eventId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.statusText}`);
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Event fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, isLoading, error };
}
