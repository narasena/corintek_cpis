import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatLimit,
  formatRawWaterLimit,
  isOutOfRange,
} from './utils';

describe('log-sheets detail utils (characterization)', () => {
  describe('formatDate', () => {
    it('formats a Date into Indonesian long date string (main path)', () => {
      // Using a local Date (not UTC) to mirror runtime behavior in browsers.
      const result = formatDate(new Date(2024, 0, 2)); // 2 Jan 2024

      // Characterization: output is locale-dependent but should include these tokens.
      expect(result).toContain('2024');
      expect(result.toLowerCase()).toContain('januari');
      expect(result).toMatch(/\b2\b/);
    });

    it('accepts a string and relies on JS Date parsing (surprising behavior)', () => {
      // This locks the current behavior: it calls `new Date(value)`.
      // Note: behavior can be environment-dependent for non-ISO formats.
      const result = formatDate('2024-01-02T00:00:00.000Z');
      expect(result).toContain('2024');
    });

    it('handles an invalid date string by returning "Invalid Date"-like output (error-ish path)', () => {
      // Current implementation does not guard invalid dates.
      // `toLocaleDateString` on invalid date returns "Invalid Date" in Node.
      const result = formatDate('not-a-date');
      expect(result.toLowerCase()).toContain('invalid');
    });
  });

  describe('formatLimit', () => {
    it('formats min/max/unit using shared limits-format helper (main path)', () => {
      const result = formatLimit({ minValue: 1, maxValue: 2, unit: 'ppm' });
      // Keep this flexible but still locks key aspects.
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result.toLowerCase()).toContain('ppm');
    });

    it('handles null limits (edge case)', () => {
      const result = formatLimit({
        minValue: null,
        maxValue: null,
        unit: null,
      });
      // Characterization: whatever the helper returns today, it should be a string.
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatRawWaterLimit', () => {
    it('formats raw water limits and unit (main path)', () => {
      const result = formatRawWaterLimit({
        rawWaterMinValue: 10,
        rawWaterMaxValue: 20,
        unit: 'ppm',
      });
      expect(result).toContain('10');
      expect(result).toContain('20');
      expect(result.toLowerCase()).toContain('ppm');
    });

    it('handles missing unit by passing null (edge case)', () => {
      const result = formatRawWaterLimit({
        rawWaterMinValue: 10,
        rawWaterMaxValue: 20,
        unit: null,
      });
      expect(typeof result).toBe('string');
      expect(result).toContain('10');
      expect(result).toContain('20');
    });
  });

  describe('isOutOfRange', () => {
    it('returns false for null/undefined values (edge case)', () => {
      expect(isOutOfRange(null, 0, 1)).toBe(false);
      expect(isOutOfRange(undefined, 0, 1)).toBe(false);
    });

    it('returns false when min/max are null (edge case)', () => {
      expect(isOutOfRange(123, null, null)).toBe(false);
    });

    it('returns true when below min (main path)', () => {
      expect(isOutOfRange(4, 5, null)).toBe(true);
    });

    it('returns true when above max (main path)', () => {
      expect(isOutOfRange(6, null, 5)).toBe(true);
    });

    it('returns false when within range (main path)', () => {
      expect(isOutOfRange(5, 5, 5)).toBe(false);
      expect(isOutOfRange(5.5, 5, 6)).toBe(false);
    });

    it('treats extreme values normally (edge case)', () => {
      expect(isOutOfRange(Number.POSITIVE_INFINITY, null, 999)).toBe(true);
      expect(isOutOfRange(Number.NEGATIVE_INFINITY, -999, null)).toBe(true);
    });
  });
});
