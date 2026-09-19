import { describe, it, expect } from 'vitest';
import {
  parseLocalDate,
  toYmd,
  formatDateForDisplay,
  isToday,
  getDaysBetween,
  addDays,
} from '../../utils/date-helpers';

describe('parseLocalDate', () => {
  it('returns today for empty input', () => {
    const result = parseLocalDate('');
    expect(result).toBeInstanceOf(Date);
    // Just verify it's recent — don't compare exact ms.
    expect(Date.now() - result.getTime()).toBeLessThan(1000);
  });

  it('parses a date-only string as local midnight (not UTC)', () => {
    // The classic bug: '2024-03-20' parsed by `new Date()` is UTC midnight,
    // which shifts to the previous day in western longitudes. parseLocalDate
    // must use local time so the day stays 20.
    const result = parseLocalDate('2024-03-20');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2); // March
    expect(result.getDate()).toBe(20);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('passes through datetime strings that include time', () => {
    const result = parseLocalDate('2024-03-20T15:30:00');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(20);
    expect(result.getHours()).toBe(15);
    expect(result.getMinutes()).toBe(30);
  });

  it('falls back to Date constructor for non-ISO strings', () => {
    const result = parseLocalDate('March 20, 2024');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(20);
  });
});

describe('toYmd', () => {
  it('formats single-digit months and days with leading zeros', () => {
    expect(toYmd(new Date(2024, 2, 5))).toBe('2024-03-05');
  });

  it('round-trips through parseLocalDate at local midnight', () => {
    const d = new Date(2024, 11, 31, 15, 45);
    const round = parseLocalDate(toYmd(d));
    expect(round.getFullYear()).toBe(2024);
    expect(round.getMonth()).toBe(11);
    expect(round.getDate()).toBe(31);
    expect(round.getHours()).toBe(0);
  });
});

describe('formatDateForDisplay', () => {
  it('formats a date-only string without timezone drift', () => {
    expect(formatDateForDisplay('2024-03-20')).toBe('Mar 20, 2024');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDateForDisplay('not a date')).toBe('');
  });
});

describe('isToday', () => {
  it('returns true for the current time', () => {
    expect(isToday(new Date())).toBe(true);
  });

  it('returns true for a date-only string of today', () => {
    expect(isToday(toYmd(new Date()))).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });
});

describe('getDaysBetween', () => {
  it('returns 0 for the same day', () => {
    expect(getDaysBetween('2024-03-20', '2024-03-20')).toBe(0);
  });

  it('returns positive days when end is after start', () => {
    expect(getDaysBetween('2024-03-20', '2024-03-25')).toBe(5);
  });

  it('returns negative days when end is before start', () => {
    expect(getDaysBetween('2024-03-25', '2024-03-20')).toBe(-5);
  });

  it('normalizes times to midnight so partial days do not drift', () => {
    // Same calendar day, different times — should still be 0.
    expect(getDaysBetween('2024-03-20T00:00:00', '2024-03-20T23:59:59')).toBe(0);
  });

  it('handles month boundaries', () => {
    expect(getDaysBetween('2024-02-28', '2024-03-01')).toBe(2); // 2024 is a leap year
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const result = addDays('2024-03-20', 5);
    expect(result.getDate()).toBe(25);
    expect(result.getMonth()).toBe(2);
  });

  it('subtracts when given negative days', () => {
    const result = addDays('2024-03-20', -5);
    expect(result.getDate()).toBe(15);
  });

  it('handles month rollover', () => {
    const result = addDays('2024-03-31', 1);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(1);
  });
});
