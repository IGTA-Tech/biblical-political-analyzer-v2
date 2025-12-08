'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Timeline } from '@/components/timeline/Timeline';
import { TimelineControls } from '@/components/timeline/TimelineControls';
import { TimelineFilters } from '@/components/timeline/TimelineFilters';
import { TimelineEventListItem } from '@/components/timeline/TimelineEvent';
import { useTimeline } from '@/hooks/useTimeline';
import { TimelineEvent } from '@/types/timeline';

// Timeline boundaries
const TIMELINE_START = -4;
const TIMELINE_END = 2024;

export default function TimelinePage() {
  const router = useRouter();

  // Timeline state from hook
  const {
    events,
    eras,
    filters,
    setFilters,
    clearFilters,
    isLoading,
    error,
    filteredEvents,
    viewportStart,
    viewportEnd,
    setViewport,
    zoomLevel,
    setZoomLevel,
  } = useTimeline();

  // Local state
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showEventList, setShowEventList] = useState(true);

  // Handlers
  const handleEventSelect = useCallback((event: TimelineEvent | null) => {
    setSelectedEvent(event);
  }, []);

  const handleViewEventDetails = useCallback(
    (eventId: string) => {
      router.push(`/event/${eventId}`);
    },
    [router]
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel(Math.min(10, zoomLevel * 1.5));
  }, [zoomLevel, setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(Math.max(0.1, zoomLevel / 1.5));
  }, [zoomLevel, setZoomLevel]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setViewport(TIMELINE_START, TIMELINE_END);
  }, [setZoomLevel, setViewport]);

  const handlePanLeft = useCallback(() => {
    const range = viewportEnd - viewportStart;
    const panAmount = range * 0.25;
    setViewport(
      Math.max(TIMELINE_START, viewportStart - panAmount),
      viewportEnd - panAmount
    );
  }, [viewportStart, viewportEnd, setViewport]);

  const handlePanRight = useCallback(() => {
    const range = viewportEnd - viewportStart;
    const panAmount = range * 0.25;
    setViewport(
      viewportStart + panAmount,
      Math.min(TIMELINE_END, viewportEnd + panAmount)
    );
  }, [viewportStart, viewportEnd, setViewport]);

  const handleJumpToYear = useCallback(
    (year: number) => {
      const range = viewportEnd - viewportStart;
      const halfRange = range / 2;
      setViewport(
        Math.max(TIMELINE_START, year - halfRange),
        Math.min(TIMELINE_END, year + halfRange)
      );
    },
    [viewportStart, viewportEnd, setViewport]
  );

  const handleJumpToEra = useCallback(
    (eraStart: number, eraEnd: number) => {
      const padding = (eraEnd - eraStart) * 0.1;
      setViewport(
        Math.max(TIMELINE_START, eraStart - padding),
        Math.min(TIMELINE_END, eraEnd + padding)
      );
    },
    [setViewport]
  );

  return (
    <div className="min-h-screen bg-faith-cream">
      {/* Header */}
      <header className="bg-white border-b border-faith-stone/20 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-serif font-bold text-faith-ink">
                Historical Faith Timeline
              </h1>
              <p className="text-sm text-faith-stone">
                2,000 years of religious history
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Filters Toggle */}
              <div className="relative">
                <TimelineFilters
                  filters={filters}
                  eras={eras}
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                  isOpen={isFiltersOpen}
                  onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
                />
              </div>

              {/* Event List Toggle */}
              <button
                onClick={() => setShowEventList(!showEventList)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${
                    showEventList
                      ? 'bg-faith-burgundy text-white'
                      : 'bg-white border border-faith-stone/20 text-faith-ink hover:bg-faith-parchment'
                  }
                `}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <span className="font-medium">Event List</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Error loading timeline</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-faith-burgundy mx-auto mb-4" />
              <p className="text-faith-stone">Loading timeline...</p>
            </div>
          </div>
        )}

        {/* Content Grid */}
        {!isLoading && (
          <div className="flex gap-6">
            {/* Main Timeline */}
            <div className="flex-1 min-w-0">
              <Timeline
                events={filteredEvents}
                eras={eras}
                selectedEventId={selectedEvent?.id}
                onEventSelect={handleEventSelect}
                onViewEventDetails={handleViewEventDetails}
                height={600}
              />
            </div>

            {/* Sidebar */}
            {showEventList && (
              <div className="w-80 flex-shrink-0">
                {/* Controls */}
                <div className="mb-4">
                  <TimelineControls
                    zoomLevel={zoomLevel}
                    viewportStart={viewportStart}
                    viewportEnd={viewportEnd}
                    timelineStart={TIMELINE_START}
                    timelineEnd={TIMELINE_END}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetZoom={handleResetZoom}
                    onPanLeft={handlePanLeft}
                    onPanRight={handlePanRight}
                    onJumpToYear={handleJumpToYear}
                    onJumpToEra={handleJumpToEra}
                  />
                </div>

                {/* Event List */}
                <div className="bg-white rounded-lg border border-faith-stone/20 shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-faith-stone/10 bg-faith-parchment">
                    <h2 className="font-serif font-semibold text-faith-ink">
                      Events ({filteredEvents.length})
                    </h2>
                  </div>

                  <div className="max-h-[calc(100vh-400px)] overflow-y-auto p-2 space-y-2">
                    {filteredEvents.length === 0 ? (
                      <div className="text-center py-8 text-faith-stone">
                        <p>No events found</p>
                        <p className="text-xs mt-1">
                          Try adjusting your filters
                        </p>
                      </div>
                    ) : (
                      filteredEvents.map((event) => (
                        <TimelineEventListItem
                          key={event.id}
                          event={event}
                          isSelected={selectedEvent?.id === event.id}
                          onClick={() => handleEventSelect(event)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-faith-stone/20 bg-white py-4 mt-8">
        <div className="max-w-screen-2xl mx-auto px-4 text-center text-sm text-faith-stone">
          Historical Faith Tracker - Exploring 2,000 years of religious history
        </div>
      </footer>
    </div>
  );
}
