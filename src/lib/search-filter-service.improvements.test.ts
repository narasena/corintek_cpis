import { describe, it, expect } from 'vitest';
import { SearchFilterService } from './search-filter-service';

describe('SearchFilterService - Improvements', () => {
  const service = new SearchFilterService({});

  describe('fuzzyMatch', () => {
    it('returns true for exact match', () => {
      expect(service.fuzzyMatch('hello world', 'hello')).toBe(true);
    });

    it('returns true for substring match', () => {
      expect(service.fuzzyMatch('hello world', 'world')).toBe(true);
    });

    it('returns true for fuzzy match within tolerance', () => {
      expect(service.fuzzyMatch('hello', 'hallo', 1)).toBe(true);
      expect(service.fuzzyMatch('world', 'word', 1)).toBe(true);
      expect(service.fuzzyMatch('kitten', 'sitting', 3)).toBe(true);
    });

    it('returns false when edit distance exceeds tolerance', () => {
      expect(service.fuzzyMatch('hello', 'help', 1)).toBe(false);
      expect(service.fuzzyMatch('world', 'wxyz', 1)).toBe(false);
      expect(service.fuzzyMatch('completely', 'different', 2)).toBe(false);
    });

    it('is case insensitive by default', () => {
      expect(service.fuzzyMatch('HELLO WORLD', 'hello')).toBe(true);
      expect(service.fuzzyMatch('MiXeD CaSe', 'mixed')).toBe(true);
    });

    it('handles empty query', () => {
      expect(service.fuzzyMatch('hello', '')).toBe(true);
      expect(service.fuzzyMatch('', '')).toBe(true);
    });

    it('returns false for null/undefined values', () => {
      expect(service.fuzzyMatch(null, 'test')).toBe(false);
      expect(service.fuzzyMatch(undefined, 'test')).toBe(false);
    });

    it('converts numbers to string for matching', () => {
      expect(service.fuzzyMatch(12345, '234')).toBe(true);
      expect(service.fuzzyMatch(999.88, '999')).toBe(true);
      expect(service.fuzzyMatch(0, '0')).toBe(true);
    });

    it('handles boolean values', () => {
      expect(service.fuzzyMatch(true, 'true')).toBe(true);
      expect(service.fuzzyMatch(false, 'false')).toBe(true);
    });

    it('handles special characters', () => {
      expect(service.fuzzyMatch('hello@world.com', '@world')).toBe(true);
      expect(service.fuzzyMatch('price: $100', '$100')).toBe(true);
      expect(service.fuzzyMatch('item #123', '#123')).toBe(true);
    });

    it('handles unicode characters', () => {
      // Unicode strings should match when they contain the query
      expect(service.fuzzyMatch('日本語', '日本')).toBe(true);
      // Accented characters can match via fuzzy tolerance
      expect(service.fuzzyMatch('café', 'cafe', 1)).toBe(true);
    });

    it('handles very long strings efficiently', () => {
      const longString = 'a'.repeat(1000);
      const query = 'a'.repeat(10);
      expect(service.fuzzyMatch(longString, query)).toBe(true);
    });

    it('optimizes by checking length difference first', () => {
      // If length difference > tolerance, should skip expensive calculation
      const result = service.fuzzyMatch('short', 'very long string indeed', 2);
      expect(result).toBe(false);
    });

    it('handles zero tolerance', () => {
      expect(service.fuzzyMatch('hello', 'hello', 0)).toBe(true);
      expect(service.fuzzyMatch('hello', 'hallo', 0)).toBe(false);
    });

    it('handles large tolerance values', () => {
      expect(service.fuzzyMatch('a', 'abcdefghijklmnopqrstuvwxyz', 25)).toBe(
        true
      );
    });
  });

  describe('highlightMatches', () => {
    it('returns single part when no match', () => {
      const result = service.highlightMatches('hello world', 'xyz');
      expect(result).toEqual([{ text: 'hello world', isMatch: false }]);
    });

    it('highlights single match', () => {
      const result = service.highlightMatches('hello world', 'world');
      expect(result).toEqual([
        { text: 'hello ', isMatch: false },
        { text: 'world', isMatch: true },
      ]);
    });

    it('highlights multiple matches', () => {
      const result = service.highlightMatches('banana', 'an');
      expect(result).toEqual([
        { text: 'b', isMatch: false },
        { text: 'an', isMatch: true },
        { text: 'an', isMatch: true },
        { text: 'a', isMatch: false },
      ]);
    });

    it('is case insensitive by default', () => {
      const result = service.highlightMatches('HELLO World', 'hello');
      expect(result).toEqual([
        { text: 'HELLO', isMatch: true },
        { text: ' World', isMatch: false },
      ]);
    });

    it('respects case sensitivity', () => {
      const result = service.highlightMatches('HELLO world', 'hello', false);
      expect(result).toEqual([{ text: 'HELLO world', isMatch: false }]);
    });

    it('handles empty query', () => {
      const result = service.highlightMatches('hello', '');
      expect(result).toEqual([{ text: 'hello', isMatch: false }]);
    });

    it('handles empty text', () => {
      const result = service.highlightMatches('', 'query');
      expect(result).toEqual([{ text: '', isMatch: false }]);
    });

    it('handles match at start', () => {
      const result = service.highlightMatches('hello world', 'hello');
      expect(result).toEqual([
        { text: 'hello', isMatch: true },
        { text: ' world', isMatch: false },
      ]);
    });

    it('handles match at end', () => {
      const result = service.highlightMatches('hello world', 'world');
      expect(result).toEqual([
        { text: 'hello ', isMatch: false },
        { text: 'world', isMatch: true },
      ]);
    });

    it('handles overlapping matches correctly', () => {
      // "aaa" with query "aa" should find matches at positions 0-1 and 1-2
      const result = service.highlightMatches('aaa', 'aa');
      expect(result).toEqual([
        { text: 'aa', isMatch: true },
        { text: 'a', isMatch: false },
      ]);
    });

    it('handles special regex characters in query', () => {
      const result = service.highlightMatches('price: $100', '$100');
      expect(result).toEqual([
        { text: 'price: ', isMatch: false },
        { text: '$100', isMatch: true },
      ]);
    });

    it('handles consecutive matches', () => {
      const result = service.highlightMatches('testtest', 'test');
      expect(result).toEqual([
        { text: 'test', isMatch: true },
        { text: 'test', isMatch: true },
      ]);
    });

    it('preserves original text case in output', () => {
      const result = service.highlightMatches('HeLLo WoRLd', 'hello');
      expect(result[0].text).toBe('HeLLo');
      expect(result[0].isMatch).toBe(true);
    });
  });

  describe('levenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('hello', 'hello');
      expect(distance).toBe(0);
    });

    it('returns length difference for empty string', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('hello', '');
      expect(distance).toBe(5);
    });

    it('calculates single substitution', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('hello', 'hallo');
      expect(distance).toBe(1);
    });

    it('calculates single deletion', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('hello', 'helo');
      expect(distance).toBe(1);
    });

    it('calculates single insertion', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('helo', 'hello');
      expect(distance).toBe(1);
    });

    it('calculates complex transformations', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('kitten', 'sitting');
      expect(distance).toBe(3);
    });

    it('is symmetric', () => {
      const d1 = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('abc', 'def');
      const d2 = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('def', 'abc');
      expect(d1).toBe(d2);
    });

    it('handles empty strings', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('', '');
      expect(distance).toBe(0);
    });

    it('handles single character strings', () => {
      const distance = (
        service as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('a', 'b');
      expect(distance).toBe(1);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles very long text with many matches efficiently', () => {
      const longText = 'abc'.repeat(1000);
      const start = performance.now();
      const result = service.highlightMatches(longText, 'abc');
      const duration = performance.now() - start;

      expect(result.length).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('handles fuzzy match with large strings efficiently', () => {
      const longValue = 'a'.repeat(500);
      const query = 'a'.repeat(10);
      const start = performance.now();
      const result = service.fuzzyMatch(longValue, query);
      const duration = performance.now() - start;

      expect(result).toBe(true);
      expect(duration).toBeLessThan(50); // Substring match should be fast
    });

    it('rejects obviously different strings quickly', () => {
      const start = performance.now();
      const result = service.fuzzyMatch(
        'short',
        'very long different string',
        2
      );
      const duration = performance.now() - start;

      expect(result).toBe(false);
      expect(duration).toBeLessThan(5); // Length check should be instant
    });
  });
});
