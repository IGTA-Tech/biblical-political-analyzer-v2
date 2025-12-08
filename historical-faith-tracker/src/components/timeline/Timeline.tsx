'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TimelineEvent,
  Era,
  TimelineFilters as TimelineFiltersType,
  EVENT_TYPE_COLORS,
  EventType,
} from '@/types/timeline';
import { TimelineEventMarker, TimelineEventCard } from './TimelineEvent';
import { EraBar } from './EraBar';
import { TimelineMiniControls } from './TimelineControls';

// Timeline boundaries
const TIMELINE_START = -4; // 4 BC
const TIMELINE_END = 2024;

// Layout constants
const MARGIN = { top: 60, right: 40, bottom: 60, left: 40 };
const EVENT_ROW_HEIGHT = 100;
const ERA_BAR_HEIGHT = 40;
const AXIS_HEIGHT = 30;

interface TimelineProps {
  events: TimelineEvent[];
  eras: Era[];
  selectedEventId?: string | null;
  onEventSelect: (event: TimelineEvent | null) => void;
  onViewEventDetails: (eventId: string) => void;
  width?: number;
  height?: number;
  initialViewport?: { start: number; end: number };
}

export function Timeline({
  events,
  eras,
  selectedEventId,
  onEventSelect,
  onViewEventDetails,
  width: propWidth,
  height: propHeight = 500,
  initialViewport,
}: TimelineProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // State
  const [dimensions, setDimensions] = useState({ width: propWidth || 800, height: propHeight });
  const [viewportStart, setViewportStart] = useState(initialViewport?.start ?? TIMELINE_START);
  const [viewportEnd, setViewportEnd] = useState(initialViewport?.end ?? TIMELINE_END);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Calculate zoom level
  const zoomLevel = useMemo(() => {
    const totalRange = TIMELINE_END - TIMELINE_START;
    const currentRange = viewportEnd - viewportStart;
    return totalRange / currentRange;
  }, [viewportStart, viewportEnd]);

  // D3 scale for mapping years to x-coordinates
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([viewportStart, viewportEnd])
      .range([MARGIN.left, dimensions.width - MARGIN.right]);
  }, [viewportStart, viewportEnd, dimensions.width]);

  // Assign vertical positions to events to avoid overlapping
  const eventPositions = useMemo(() => {
    const positions: Map<string, { x: number; y: number; row: number }> = new Map();
    const rows: { endX: number }[] = [];

    // Sort events by year
    const sortedEvents = [...events].sort((a, b) => a.year_start - b.year_start);

    // Filter to visible events
    const visibleEvents = sortedEvents.filter(
      (e) => e.year_start >= viewportStart && e.year_start <= viewportEnd
    );

    visibleEvents.forEach((event) => {
      const x = xScale(event.year_start);
      const eventWidth = 80; // Approximate width needed for event

      // Find first row where this event fits
      let rowIndex = rows.findIndex((row) => row.endX < x - 10);

      if (rowIndex === -1) {
        // Create new row
        rowIndex = rows.length;
        rows.push({ endX: x + eventWidth });
      } else {
        // Update row end
        rows[rowIndex].endX = x + eventWidth;
      }

      const y = MARGIN.top + ERA_BAR_HEIGHT + AXIS_HEIGHT + rowIndex * 35 + 20;
      positions.set(event.id, { x, y, row: rowIndex });
    });

    return positions;
  }, [events, viewportStart, viewportEnd, xScale]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions((prev) => ({ ...prev, width }));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const totalRange = TIMELINE_END - TIMELINE_START;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 20])
      .translateExtent([
        [MARGIN.left, 0],
        [dimensions.width - MARGIN.right, dimensions.height],
      ])
      .on('zoom', (event) => {
        const transform = event.transform;
        const newViewportRange = totalRange / transform.k;

        // Calculate center point based on mouse position
        const centerRatio = (event.sourceEvent?.offsetX - MARGIN.left) /
          (dimensions.width - MARGIN.left - MARGIN.right);
        const center = viewportStart + (viewportEnd - viewportStart) * (centerRatio || 0.5);

        let newStart = center - newViewportRange / 2 - transform.x / transform.k * totalRange /
          (dimensions.width - MARGIN.left - MARGIN.right);
        let newEnd = newStart + newViewportRange;

        // Clamp to boundaries
        if (newStart < TIMELINE_START) {
          newStart = TIMELINE_START;
          newEnd = TIMELINE_START + newViewportRange;
        }
        if (newEnd > TIMELINE_END) {
          newEnd = TIMELINE_END;
          newStart = TIMELINE_END - newViewportRange;
        }

        setViewportStart(Math.max(TIMELINE_START, newStart));
        setViewportEnd(Math.min(TIMELINE_END, newEnd));
      });

    svg.call(zoom);

    // Clean up
    return () => {
      svg.on('.zoom', null);
    };
  }, [dimensions.width, dimensions.height, viewportStart, viewportEnd]);

  // Draw axis
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous axis
    svg.select('.x-axis').remove();

    // Create axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(20, Math.floor(dimensions.width / 80)))
      .tickFormat((d) => formatYear(d as number));

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${MARGIN.top + ERA_BAR_HEIGHT})`)
      .call(xAxis)
      .selectAll('text')
      .attr('class', 'text-xs fill-faith-ink')
      .style('font-family', 'Georgia, serif');

  }, [xScale, dimensions.width]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const center = (viewportStart + viewportEnd) / 2;
    const range = (viewportEnd - viewportStart) / 1.5;
    setViewportStart(Math.max(TIMELINE_START, center - range / 2));
    setViewportEnd(Math.min(TIMELINE_END, center + range / 2));
  }, [viewportStart, viewportEnd]);

  const handleZoomOut = useCallback(() => {
    const center = (viewportStart + viewportEnd) / 2;
    const range = (viewportEnd - viewportStart) * 1.5;
    setViewportStart(Math.max(TIMELINE_START, center - range / 2));
    setViewportEnd(Math.min(TIMELINE_END, center + range / 2));
  }, [viewportStart, viewportEnd]);

  const handleResetZoom = useCallback(() => {
    setViewportStart(TIMELINE_START);
    setViewportEnd(TIMELINE_END);
  }, []);

  // Event handlers
  const handleEventClick = useCallback(
    (event: TimelineEvent) => {
      onEventSelect(selectedEventId === event.id ? null : event);
    },
    [selectedEventId, onEventSelect]
  );

  const handleEventHover = useCallback(
    (event: TimelineEvent | null, clientX?: number, clientY?: number) => {
      setHoveredEventId(event?.id || null);
      if (event && clientX !== undefined && clientY !== undefined) {
        setTooltipPosition({ x: clientX, y: clientY });
      } else {
        setTooltipPosition(null);
      }
    },
    []
  );

  // Selected or hovered event
  const activeEvent = useMemo(() => {
    if (selectedEventId) {
      return events.find((e) => e.id === selectedEventId) || null;
    }
    if (hoveredEventId) {
      return events.find((e) => e.id === hoveredEventId) || null;
    }
    return null;
  }, [events, selectedEventId, hoveredEventId]);

  // Visible events
  const visibleEvents = useMemo(() => {
    return events.filter(
      (e) => e.year_start >= viewportStart && e.year_start <= viewportEnd
    );
  }, [events, viewportStart, viewportEnd]);

  // Calculate required height based on event rows
  const maxRow = useMemo(() => {
    let max = 0;
    eventPositions.forEach((pos) => {
      if (pos.row > max) max = pos.row;
    });
    return max;
  }, [eventPositions]);

  const calculatedHeight = Math.max(
    propHeight,
    MARGIN.top + ERA_BAR_HEIGHT + AXIS_HEIGHT + (maxRow + 1) * 35 + MARGIN.bottom + 50
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-faith-parchment rounded-lg border border-faith-stone/20 overflow-hidden"
    >
      {/* Era Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <EraBar
          eras={eras}
          viewportStart={viewportStart}
          viewportEnd={viewportEnd}
          height={ERA_BAR_HEIGHT}
        />
      </div>

      {/* Mini Controls */}
      <div className="absolute top-12 right-4 z-20">
        <TimelineMiniControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          zoomLevel={zoomLevel}
        />
      </div>

      {/* Main SVG */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={calculatedHeight}
        className="cursor-grab active:cursor-grabbing"
        style={{ marginTop: ERA_BAR_HEIGHT }}
      >
        {/* Background */}
        <rect
          x={0}
          y={0}
          width={dimensions.width}
          height={calculatedHeight}
          fill="transparent"
        />

        {/* Vertical grid lines */}
        <g className="grid-lines">
          {xScale.ticks(Math.min(20, Math.floor(dimensions.width / 100))).map((tick) => (
            <line
              key={tick}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={MARGIN.top}
              y2={calculatedHeight - MARGIN.bottom}
              stroke="#E5E5E5"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}
        </g>

        {/* Event markers */}
        <g className="events">
          {visibleEvents.map((event) => {
            const position = eventPositions.get(event.id);
            if (!position) return null;

            return (
              <TimelineEventMarker
                key={event.id}
                event={event}
                x={position.x}
                y={position.y}
                isSelected={selectedEventId === event.id}
                isHovered={hoveredEventId === event.id}
                onClick={() => handleEventClick(event)}
                onMouseEnter={() => handleEventHover(event)}
                onMouseLeave={() => handleEventHover(null)}
                showLabel={zoomLevel > 2}
              />
            );
          })}
        </g>

        {/* Event range lines for events with duration */}
        <g className="event-ranges">
          {visibleEvents
            .filter((e) => e.year_end && e.year_end !== e.year_start)
            .map((event) => {
              const position = eventPositions.get(event.id);
              if (!position || !event.year_end) return null;

              const endX = xScale(Math.min(event.year_end, viewportEnd));
              const color = EVENT_TYPE_COLORS[event.event_type as EventType] || '#6B6B6B';

              return (
                <line
                  key={`range-${event.id}`}
                  x1={position.x}
                  x2={endX}
                  y1={position.y}
                  y2={position.y}
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.4}
                />
              );
            })}
        </g>

        {/* Current year indicator */}
        <g className="current-year">
          <line
            x1={xScale(2024)}
            x2={xScale(2024)}
            y1={MARGIN.top}
            y2={calculatedHeight - MARGIN.bottom}
            stroke="#722F37"
            strokeWidth={2}
            strokeDasharray="8,4"
          />
          <text
            x={xScale(2024)}
            y={calculatedHeight - MARGIN.bottom + 20}
            textAnchor="middle"
            className="text-xs fill-faith-burgundy font-medium"
          >
            Present
          </text>
        </g>
      </svg>

      {/* Event Card Popup */}
      {activeEvent && selectedEventId && (
        <div
          className="absolute z-30"
          style={{
            left: Math.min(
              (eventPositions.get(activeEvent.id)?.x || 0) + 20,
              dimensions.width - 340
            ),
            top: Math.min(
              (eventPositions.get(activeEvent.id)?.y || 0) + ERA_BAR_HEIGHT - 50,
              calculatedHeight - 200
            ),
          }}
        >
          <TimelineEventCard
            event={activeEvent}
            onClose={() => onEventSelect(null)}
            onViewDetails={() => onViewEventDetails(activeEvent.id)}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-faith-stone bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
        Scroll to zoom | Drag to pan | Click events for details
      </div>

      {/* Event count */}
      <div className="absolute bottom-4 right-4 text-xs text-faith-stone bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
        Showing {visibleEvents.length} of {events.length} events
      </div>
    </div>
  );
}

// Helper function
function formatYear(year: number): string {
  if (year <= 0) {
    return `${Math.abs(year) + 1} BC`;
  }
  return `${year}`;
}

export default Timeline;
