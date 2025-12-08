'use client';

import React from 'react';
import { Era } from '@/types/timeline';

interface EraBarProps {
  eras: Era[];
  viewportStart: number;
  viewportEnd: number;
  height: number;
  onEraClick?: (era: Era) => void;
  selectedEraId?: string;
}

export function EraBar({
  eras,
  viewportStart,
  viewportEnd,
  height,
  onEraClick,
  selectedEraId,
}: EraBarProps) {
  const viewportRange = viewportEnd - viewportStart;

  // Filter eras that are visible in the current viewport
  const visibleEras = eras.filter(
    (era) => era.end_year >= viewportStart && era.start_year <= viewportEnd
  );

  // Calculate position and width for each era
  const getEraStyle = (era: Era) => {
    // Clamp era boundaries to viewport
    const clampedStart = Math.max(era.start_year, viewportStart);
    const clampedEnd = Math.min(era.end_year, viewportEnd);

    // Calculate percentages
    const leftPercent = ((clampedStart - viewportStart) / viewportRange) * 100;
    const widthPercent = ((clampedEnd - clampedStart) / viewportRange) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor: era.color,
    };
  };

  // Determine if era label should be shown (based on available width)
  const shouldShowLabel = (era: Era): boolean => {
    const clampedStart = Math.max(era.start_year, viewportStart);
    const clampedEnd = Math.min(era.end_year, viewportEnd);
    const widthPercent = ((clampedEnd - clampedStart) / viewportRange) * 100;
    return widthPercent > 5; // Only show label if era takes up more than 5% of viewport
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: `${height}px` }}
      role="region"
      aria-label="Timeline era bands"
    >
      {visibleEras.map((era) => {
        const isSelected = selectedEraId === era.id;
        const style = getEraStyle(era);
        const showLabel = shouldShowLabel(era);

        return (
          <div
            key={era.id}
            className={`
              absolute top-0 h-full transition-all duration-200 cursor-pointer
              border-r border-faith-ink/10
              ${isSelected ? 'ring-2 ring-faith-gold ring-inset' : ''}
              hover:brightness-95
            `}
            style={style}
            onClick={() => onEraClick?.(era)}
            role="button"
            aria-label={`${era.name} (${formatYear(era.start_year)} - ${formatYear(era.end_year)})`}
            aria-pressed={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEraClick?.(era);
              }
            }}
          >
            {showLabel && (
              <div className="absolute inset-0 flex flex-col justify-center items-center p-1 overflow-hidden">
                <span
                  className={`
                    text-xs font-semibold text-faith-ink/70 truncate max-w-full text-center
                    ${isSelected ? 'text-faith-burgundy' : ''}
                  `}
                >
                  {era.name}
                </span>
                <span className="text-[10px] text-faith-ink/50 truncate max-w-full">
                  {formatYear(era.start_year)} - {formatYear(era.end_year)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper function to format years with BC/AD notation
function formatYear(year: number): string {
  if (year <= 0) {
    return `${Math.abs(year) + 1} BC`;
  }
  return `${year} AD`;
}

// Era legend component for the filter panel
export function EraLegend({
  eras,
  selectedEraIds,
  onEraToggle,
}: {
  eras: Era[];
  selectedEraIds: string[];
  onEraToggle: (eraId: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-faith-ink mb-2">Eras</h3>
      <div className="grid grid-cols-2 gap-2">
        {eras.map((era) => {
          const isSelected = selectedEraIds.includes(era.id);
          return (
            <button
              key={era.id}
              onClick={() => onEraToggle(era.id)}
              className={`
                flex items-center gap-2 p-2 rounded-md text-left text-xs
                transition-all duration-150
                ${
                  isSelected
                    ? 'bg-faith-gold/20 border-faith-gold border'
                    : 'bg-white border border-faith-stone/20 hover:border-faith-gold/50'
                }
              `}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: era.color }}
              />
              <span className="truncate text-faith-ink/80">{era.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EraBar;
