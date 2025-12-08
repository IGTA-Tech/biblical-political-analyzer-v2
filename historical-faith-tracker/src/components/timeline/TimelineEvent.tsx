'use client';

import React, { memo } from 'react';
import {
  TimelineEvent as TimelineEventType,
  EVENT_TYPE_COLORS,
  TRADITION_COLORS,
  EventType,
  Tradition,
} from '@/types/timeline';

interface TimelineEventProps {
  event: TimelineEventType;
  x: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showLabel?: boolean;
}

export const TimelineEventMarker = memo(function TimelineEventMarker({
  event,
  x,
  y,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showLabel = false,
}: TimelineEventProps) {
  const color = EVENT_TYPE_COLORS[event.event_type as EventType] || '#6B6B6B';
  const size = getEventSize(event.significance);
  const isActive = isSelected || isHovered;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`${event.title} (${formatYear(event.year_start)})`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Glow effect for active state */}
      {isActive && (
        <circle
          r={size + 6}
          fill={color}
          opacity={0.2}
          className="animate-pulse"
        />
      )}

      {/* Event marker */}
      <circle
        r={size}
        fill={color}
        stroke={isActive ? '#2C2416' : 'white'}
        strokeWidth={isActive ? 2 : 1}
        className="transition-all duration-200"
      />

      {/* Inner dot for major events */}
      {event.significance === 'major' && (
        <circle r={size / 3} fill="white" opacity={0.8} />
      )}

      {/* Year tick */}
      <line
        x1={0}
        y1={size + 2}
        x2={0}
        y2={size + 8}
        stroke={color}
        strokeWidth={1}
      />

      {/* Label (when zoomed in or hovered) */}
      {(showLabel || isActive) && (
        <g transform={`translate(0, ${-size - 8})`}>
          <text
            textAnchor="middle"
            className="text-xs fill-faith-ink font-medium"
            style={{ fontSize: '10px' }}
          >
            {truncateTitle(event.title, 25)}
          </text>
          <text
            textAnchor="middle"
            y={-12}
            className="text-xs fill-faith-stone"
            style={{ fontSize: '9px' }}
          >
            {formatYear(event.year_start)}
          </text>
        </g>
      )}
    </g>
  );
});

// Event card component for hover/selection popup
export function TimelineEventCard({
  event,
  onClose,
  onViewDetails,
}: {
  event: TimelineEventType;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  const color = EVENT_TYPE_COLORS[event.event_type as EventType] || '#6B6B6B';

  return (
    <div
      className="bg-white rounded-lg shadow-xl border border-faith-stone/20 p-4 max-w-sm w-80"
      role="dialog"
      aria-labelledby="event-card-title"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div
            className="inline-block px-2 py-0.5 rounded-full text-xs text-white mb-1"
            style={{ backgroundColor: color }}
          >
            {formatEventType(event.event_type)}
          </div>
          <h3
            id="event-card-title"
            className="text-lg font-serif font-semibold text-faith-ink leading-tight"
          >
            {event.title}
          </h3>
          <p className="text-sm text-faith-stone">
            {formatYear(event.year_start)}
            {event.year_end && event.year_end !== event.year_start
              ? ` - ${formatYear(event.year_end)}`
              : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-faith-stone hover:text-faith-ink transition-colors p-1"
          aria-label="Close"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <p className="text-sm text-faith-ink/80 mb-3 line-clamp-3">
        {event.summary}
      </p>

      {/* Traditions */}
      <div className="flex flex-wrap gap-1 mb-3">
        {event.traditions_affected.map((tradition) => (
          <span
            key={tradition}
            className="px-2 py-0.5 rounded-full text-xs border"
            style={{
              borderColor: TRADITION_COLORS[tradition as Tradition] || '#6B6B6B',
              color: TRADITION_COLORS[tradition as Tradition] || '#6B6B6B',
            }}
          >
            {formatTradition(tradition)}
          </span>
        ))}
      </div>

      {/* Location */}
      {event.location && (
        <p className="text-xs text-faith-stone flex items-center gap-1 mb-3">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {event.location}
        </p>
      )}

      {/* Actions */}
      <button
        onClick={onViewDetails}
        className="w-full py-2 px-4 bg-faith-burgundy text-white rounded-md hover:bg-faith-burgundy/90 transition-colors text-sm font-medium"
      >
        View Full Details
      </button>
    </div>
  );
}

// Event list item for sidebar/list view
export function TimelineEventListItem({
  event,
  isSelected,
  onClick,
}: {
  event: TimelineEventType;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = EVENT_TYPE_COLORS[event.event_type as EventType] || '#6B6B6B';

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg transition-all duration-200 border
        ${
          isSelected
            ? 'bg-faith-gold/10 border-faith-gold shadow-sm'
            : 'bg-white border-transparent hover:bg-faith-parchment hover:border-faith-stone/20'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Event type indicator */}
        <div
          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
          style={{ backgroundColor: color }}
        />

        <div className="flex-1 min-w-0">
          {/* Title and year */}
          <div className="flex items-baseline gap-2">
            <h4 className="font-medium text-faith-ink truncate text-sm">
              {event.title}
            </h4>
            <span className="text-xs text-faith-stone flex-shrink-0">
              {formatYear(event.year_start)}
            </span>
          </div>

          {/* Summary preview */}
          <p className="text-xs text-faith-ink/70 line-clamp-2 mt-1">
            {event.summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] text-white"
              style={{ backgroundColor: color }}
            >
              {formatEventType(event.event_type)}
            </span>
            {event.traditions_affected.slice(0, 2).map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 rounded text-[10px] border border-faith-stone/30 text-faith-stone"
              >
                {formatTradition(t)}
              </span>
            ))}
            {event.traditions_affected.length > 2 && (
              <span className="text-[10px] text-faith-stone">
                +{event.traditions_affected.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// Helper functions
function getEventSize(significance?: string): number {
  switch (significance) {
    case 'major':
      return 8;
    case 'moderate':
      return 6;
    case 'minor':
      return 4;
    default:
      return 5;
  }
}

function formatYear(year: number): string {
  if (year <= 0) {
    return `${Math.abs(year) + 1} BC`;
  }
  return `${year} AD`;
}

function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
}

function formatEventType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTradition(tradition: string): string {
  const traditionNames: Record<string, string> = {
    catholic: 'Catholic',
    orthodox: 'Orthodox',
    protestant: 'Protestant',
    jewish: 'Jewish',
    islamic: 'Islamic',
    early_church: 'Early Church',
    all: 'All Traditions',
  };
  return traditionNames[tradition] || tradition;
}

export default TimelineEventMarker;
