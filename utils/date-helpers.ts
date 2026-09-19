// utils/date-helpers.ts
// Date utilities for consistent parsing/formatting — the single owner of
// date formatting in the shell. These helpers handle the local-vs-UTC
// edge cases that bite date-only strings: `new Date('2024-03-20')` lands
// at UTC midnight, which shifts to the previous calendar day in western
// longitudes.

import { parseISO, startOfDay } from 'date-fns';

/**
 * Parse a date string as local time to avoid UTC timezone issues.
 * When date is just "2024-03-20", `new Date()` interprets as UTC midnight
 * which can shift to the previous day in some timezones.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  const parsed = parseISO(dateStr);

  if (!isNaN(parsed.getTime())) {
    if (parsed.getTime() === startOfDay(parsed).getTime()) {
      const parts = dateStr.split(/[-T:]/);
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return parsed;
  }

  return new Date(dateStr);
}

/**
 * Coerce a Date | string to a Date, parsing date-only strings as local
 * midnight (avoids the UTC-offset drift that `new Date('2024-03-20')` causes
 * in western longitudes). Pass everything through here when the input is
 * user-controlled or comes in as a date-only ISO string.
 */
function toDate(date: Date | string): Date {
  return typeof date === 'string' ? parseLocalDate(date) : date;
}

/**
 * Format a Date as a local YYYY-MM-DD string (the kit's wire format —
 * DatePickerField, CalendarGrid, and the activity grid all speak it).
 * Built from local components so the day never drifts across timezones.
 */
export function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format a date for display in the UI using Intl.DateTimeFormat.
 */
export function formatDateForDisplay(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  const d = toDate(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', options);
}

/**
 * True when the given date is the same calendar day as today.
 */
export function isToday(date: Date | string): boolean {
  const d = toDate(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Whole days between two dates (can be negative if end < start).
 * Times are normalized to midnight so partial-day diffs don't drift.
 */
export function getDaysBetween(start: Date | string, end: Date | string): number {
  const startDate = toDate(start);
  const endDate = toDate(end);

  const startMidnight = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const endMidnight = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  const diffTime = endMidnight.getTime() - startMidnight.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/** Add days to a date (negative subtracts). Returns a new Date. */
export function addDays(date: Date | string, days: number): Date {
  const d = toDate(date);
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}
