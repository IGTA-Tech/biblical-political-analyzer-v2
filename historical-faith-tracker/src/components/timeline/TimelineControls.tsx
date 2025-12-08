'use client';

import React, { useCallback } from 'react';

interface TimelineControlsProps {
  zoomLevel: number;
  viewportStart: number;
  viewportEnd: number;
  timelineStart: number;
  timelineEnd: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onJumpToYear: (year: number) => void;
  onJumpToEra: (eraStart: number, eraEnd: number) => void;
}

// Quick jump presets
const QUICK_JUMPS = [
  { label: '1 AD', year: 1 },
  { label: '100', year: 100 },
  { label: '325', year: 325 },
  { label: '500', year: 500 },
  { label: '1054', year: 1054 },
  { label: '1517', year: 1517 },
  { label: '1800', year: 1800 },
  { label: 'Now', year: 2024 },
];

export function TimelineControls({
  zoomLevel,
  viewportStart,
  viewportEnd,
  timelineStart,
  timelineEnd,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPanLeft,
  onPanRight,
  onJumpToYear,
}: TimelineControlsProps) {
  const [inputYear, setInputYear] = React.useState('');

  const handleJumpSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const year = parseInt(inputYear, 10);
      if (!isNaN(year)) {
        // Handle BC dates (negative input)
        const actualYear = inputYear.toLowerCase().includes('bc')
          ? -(parseInt(inputYear, 10) - 1)
          : year;
        onJumpToYear(actualYear);
        setInputYear('');
      }
    },
    [inputYear, onJumpToYear]
  );

  // Calculate zoom percentage for display
  const zoomPercent = Math.round(zoomLevel * 100);

  // Check if at timeline boundaries
  const atStart = viewportStart <= timelineStart;
  const atEnd = viewportEnd >= timelineEnd;

  return (
    <div className="bg-white border border-faith-stone/20 rounded-lg shadow-lg p-3">
      <div className="flex flex-col gap-3">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-faith-stone font-medium min-w-12">
            Zoom:
          </span>
          <div className="flex items-center gap-1 bg-faith-parchment rounded-md p-0.5">
            <button
              onClick={onZoomOut}
              disabled={zoomLevel <= 0.1}
              className="p-1.5 rounded hover:bg-faith-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <svg
                className="w-4 h-4 text-faith-ink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>

            <span className="text-xs text-faith-ink min-w-12 text-center font-mono">
              {zoomPercent}%
            </span>

            <button
              onClick={onZoomIn}
              disabled={zoomLevel >= 10}
              className="p-1.5 rounded hover:bg-faith-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <svg
                className="w-4 h-4 text-faith-ink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>

            <button
              onClick={onResetZoom}
              className="p-1.5 rounded hover:bg-faith-gold/20 transition-colors text-xs text-faith-stone"
              aria-label="Reset zoom"
              title="Reset to full timeline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Pan Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-faith-stone font-medium min-w-12">
            Pan:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onPanLeft}
              disabled={atStart}
              className="p-1.5 rounded bg-faith-parchment hover:bg-faith-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Pan left (earlier)"
              title="Pan to earlier dates"
            >
              <svg
                className="w-4 h-4 text-faith-ink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={onPanRight}
              disabled={atEnd}
              className="p-1.5 rounded bg-faith-parchment hover:bg-faith-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Pan right (later)"
              title="Pan to later dates"
            >
              <svg
                className="w-4 h-4 text-faith-ink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Jump to Year */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-faith-stone font-medium min-w-12">
            Jump:
          </span>
          <form onSubmit={handleJumpSubmit} className="flex gap-1">
            <input
              type="text"
              value={inputYear}
              onChange={(e) => setInputYear(e.target.value)}
              placeholder="Year (e.g., 325)"
              className="w-24 px-2 py-1 text-xs border border-faith-stone/30 rounded focus:outline-none focus:ring-1 focus:ring-faith-gold"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-faith-burgundy text-white text-xs rounded hover:bg-faith-burgundy/90 transition-colors"
            >
              Go
            </button>
          </form>
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex flex-wrap gap-1">
          {QUICK_JUMPS.map((jump) => (
            <button
              key={jump.year}
              onClick={() => onJumpToYear(jump.year)}
              className="px-2 py-1 text-xs bg-faith-parchment hover:bg-faith-gold/20 rounded transition-colors text-faith-ink"
            >
              {jump.label}
            </button>
          ))}
        </div>

        {/* Current View Display */}
        <div className="text-xs text-faith-stone text-center border-t border-faith-stone/10 pt-2">
          Viewing: {formatYear(viewportStart)} - {formatYear(viewportEnd)}
        </div>
      </div>
    </div>
  );
}

// Mini controls for inline/overlay use
export function TimelineMiniControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  zoomLevel,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  zoomLevel: number;
}) {
  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1 border border-faith-stone/20">
      <button
        onClick={onZoomOut}
        disabled={zoomLevel <= 0.1}
        className="p-2 rounded hover:bg-faith-gold/20 disabled:opacity-40 transition-colors"
        aria-label="Zoom out"
      >
        <svg
          className="w-4 h-4 text-faith-ink"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>

      <button
        onClick={onResetZoom}
        className="px-2 py-1 text-xs font-mono text-faith-ink hover:bg-faith-gold/20 rounded transition-colors"
        title="Reset zoom"
      >
        {Math.round(zoomLevel * 100)}%
      </button>

      <button
        onClick={onZoomIn}
        disabled={zoomLevel >= 10}
        className="p-2 rounded hover:bg-faith-gold/20 disabled:opacity-40 transition-colors"
        aria-label="Zoom in"
      >
        <svg
          className="w-4 h-4 text-faith-ink"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}

// Helper function
function formatYear(year: number): string {
  if (year <= 0) {
    return `${Math.abs(year) + 1} BC`;
  }
  return `${year} AD`;
}

export default TimelineControls;
