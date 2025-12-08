'use client';

import React, { useState, useCallback } from 'react';
import {
  TimelineFilters as TimelineFiltersType,
  Tradition,
  EventType,
  Era,
  EVENT_TYPE_COLORS,
  TRADITION_COLORS,
} from '@/types/timeline';
import { EraLegend } from './EraBar';

interface TimelineFiltersProps {
  filters: TimelineFiltersType;
  eras: Era[];
  onFiltersChange: (filters: TimelineFiltersType) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Available traditions
const TRADITIONS: { value: Tradition; label: string }[] = [
  { value: 'early_church', label: 'Early Church' },
  { value: 'catholic', label: 'Catholic' },
  { value: 'orthodox', label: 'Orthodox' },
  { value: 'protestant', label: 'Protestant' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'islamic', label: 'Islamic' },
];

// Available event types
const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'council', label: 'Council' },
  { value: 'schism', label: 'Schism' },
  { value: 'reformation', label: 'Reformation' },
  { value: 'persecution', label: 'Persecution' },
  { value: 'founding', label: 'Founding' },
  { value: 'theological', label: 'Theological' },
  { value: 'political', label: 'Political' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'missionary', label: 'Missionary' },
  { value: 'manuscript', label: 'Manuscript' },
  { value: 'translation', label: 'Translation' },
];

export function TimelineFilters({
  filters,
  eras,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle,
}: TimelineFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');

  // Toggle a tradition filter
  const toggleTradition = useCallback(
    (tradition: Tradition) => {
      const current = filters.traditions || [];
      const updated = current.includes(tradition)
        ? current.filter((t) => t !== tradition)
        : [...current, tradition];
      onFiltersChange({ ...filters, traditions: updated });
    },
    [filters, onFiltersChange]
  );

  // Toggle an event type filter
  const toggleEventType = useCallback(
    (eventType: EventType) => {
      const current = filters.eventTypes || [];
      const updated = current.includes(eventType)
        ? current.filter((t) => t !== eventType)
        : [...current, eventType];
      onFiltersChange({ ...filters, eventTypes: updated });
    },
    [filters, onFiltersChange]
  );

  // Toggle an era filter
  const toggleEra = useCallback(
    (eraId: string) => {
      const current = filters.eraIds || [];
      const updated = current.includes(eraId)
        ? current.filter((id) => id !== eraId)
        : [...current, eraId];
      onFiltersChange({ ...filters, eraIds: updated });
    },
    [filters, onFiltersChange]
  );

  // Handle search input
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onFiltersChange({ ...filters, searchQuery: searchInput || undefined });
    },
    [filters, searchInput, onFiltersChange]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchInput('');
    onFiltersChange({ ...filters, searchQuery: undefined });
  }, [filters, onFiltersChange]);

  // Count active filters
  const activeFilterCount =
    (filters.traditions?.length || 0) +
    (filters.eventTypes?.length || 0) +
    (filters.eraIds?.length || 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
          ${
            isOpen
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-faith-gold text-faith-ink text-xs px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-faith-stone/20 p-4 z-50 max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-faith-ink">
              Filter Events
            </h2>
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-xs text-faith-burgundy hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search events..."
                className="w-full px-3 py-2 pr-20 border border-faith-stone/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-faith-gold/50"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-1 text-faith-stone hover:text-faith-ink"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  className="px-2 py-1 bg-faith-burgundy text-white text-xs rounded hover:bg-faith-burgundy/90"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Traditions */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-faith-ink mb-2">
              Traditions
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRADITIONS.map(({ value, label }) => {
                const isSelected = filters.traditions?.includes(value);
                const color = TRADITION_COLORS[value];
                return (
                  <button
                    key={value}
                    onClick={() => toggleTradition(value)}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                      transition-all duration-150 border
                      ${
                        isSelected
                          ? 'border-current shadow-sm'
                          : 'border-faith-stone/20 bg-white hover:border-current'
                      }
                    `}
                    style={{
                      color: color,
                      backgroundColor: isSelected ? `${color}15` : undefined,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Types */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-faith-ink mb-2">
              Event Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(({ value, label }) => {
                const isSelected = filters.eventTypes?.includes(value);
                const color = EVENT_TYPE_COLORS[value];
                return (
                  <button
                    key={value}
                    onClick={() => toggleEventType(value)}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                      transition-all duration-150 border
                      ${
                        isSelected
                          ? 'text-white'
                          : 'border-faith-stone/20 bg-white hover:bg-faith-parchment'
                      }
                    `}
                    style={{
                      backgroundColor: isSelected ? color : undefined,
                      borderColor: isSelected ? color : undefined,
                      color: isSelected ? 'white' : '#2C2416',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eras */}
          <EraLegend
            eras={eras}
            selectedEraIds={filters.eraIds || []}
            onEraToggle={toggleEra}
          />

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-faith-stone/10">
              <div className="text-xs text-faith-stone">
                Showing events matching {activeFilterCount} filter
                {activeFilterCount !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Compact inline filters for toolbar
export function TimelineInlineFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: {
  filters: TimelineFiltersType;
  onFiltersChange: (filters: TimelineFiltersType) => void;
  onClearFilters: () => void;
}) {
  // Quick toggle for common filters
  const toggleTradition = (tradition: Tradition) => {
    const current = filters.traditions || [];
    const updated = current.includes(tradition)
      ? current.filter((t) => t !== tradition)
      : [...current, tradition];
    onFiltersChange({ ...filters, traditions: updated });
  };

  const activeCount =
    (filters.traditions?.length || 0) +
    (filters.eventTypes?.length || 0) +
    (filters.eraIds?.length || 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Quick tradition toggles */}
      {TRADITIONS.slice(0, 4).map(({ value, label }) => {
        const isSelected = filters.traditions?.includes(value);
        const color = TRADITION_COLORS[value];
        return (
          <button
            key={value}
            onClick={() => toggleTradition(value)}
            className={`
              px-2 py-1 rounded text-xs transition-all duration-150 border
              ${
                isSelected
                  ? 'text-white border-transparent'
                  : 'border-faith-stone/20 bg-white hover:bg-faith-parchment text-faith-ink'
              }
            `}
            style={{
              backgroundColor: isSelected ? color : undefined,
            }}
          >
            {label}
          </button>
        );
      })}

      {/* Clear button */}
      {activeCount > 0 && (
        <button
          onClick={onClearFilters}
          className="text-xs text-faith-burgundy hover:underline ml-2"
        >
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}

export default TimelineFilters;
