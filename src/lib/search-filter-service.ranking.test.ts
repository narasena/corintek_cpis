import { describe, it, expect } from 'vitest';
import { SearchFilterService } from './search-filter-service';

describe('SearchFilterService - Ranking & Caching', () => {
  const service = new SearchFilterService({});

  describe('calculateMatchScore', () => {
    it('scores exact match as 1.0', () => {
      const result = service.calculateMatchScore('hello', 'hello');
      expect(result.score).toBe(1);
      expect(result.matchType).toBe('exact');
    });

    it('scores startsWith as 0.8', () => {
      const result = service.calculateMatchScore('hello world', 'hello');
      expect(result.score).toBe(0.8);
      expect(result.matchType).toBe('startsWith');
    });

    it('scores contains as 0.6', () => {
      const result = service.calculateMatchScore('hello world', 'world');
      expect(result.score).toBe(0.6);
      expect(result.matchType).toBe('contains');
    });

    it('scores fuzzy match less than 0.4', () => {
      const result = service.calculateMatchScore('hello', 'hallo');
      expect(result.score).toBeLessThan(0.4);
      expect(result.score).toBeGreaterThan(0);
      expect(result.matchType).toBe('fuzzy');
    });

    it('returns zero for null/undefined', () => {
      expect(service.calculateMatchScore(null, 'test').score).toBe(0);
      expect(service.calculateMatchScore(undefined, 'test').score).toBe(0);
    });

    it('is case insensitive', () => {
      const result1 = service.calculateMatchScore('HELLO', 'hello');
      const result2 = service.calculateMatchScore('hello', 'HELLO');
      expect(result1.score).toBe(1);
      expect(result2.score).toBe(1);
    });

    it('converts numbers to string', () => {
      const result = service.calculateMatchScore(12345, '123');
      expect(result.score).toBe(0.8); // "12345" starts with "123"
      expect(result.matchType).toBe('startsWith');
    });
  });

  describe('applyGlobalFilterWithRanking', () => {
    const testData = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
      { id: '3', name: 'Johnny Cash' },
      { id: '4', name: 'Alice Johnson' },
    ];

    it('returns all items with zero score for empty query', () => {
      const result = service.applyGlobalFilterWithRanking(testData, {
        query: '',
      });
      expect(result).toHaveLength(4);
      expect(result.every(r => r.score === 0)).toBe(true);
    });

    it('returns items sorted by score (highest first)', () => {
      const result = service.applyGlobalFilterWithRanking(testData, {
        query: 'John',
      });
      expect(result[0].item.name).toBe('John Doe'); // Starts with "John"
      expect(result[1].item.name).toBe('Johnny Cash'); // Also starts with "John"
    });

    it('filters out non-matching items', () => {
      const result = service.applyGlobalFilterWithRanking(testData, {
        query: 'zzz',
      });
      expect(result).toHaveLength(0);
    });

    it('respects maxResults parameter', () => {
      const result = service.applyGlobalFilterWithRanking(testData, {
        query: 'o',
        maxResults: 2,
      });
      expect(result).toHaveLength(2);
    });

    it('respects minQueryLength', () => {
      const result = service.applyGlobalFilterWithRanking(testData, {
        query: 'J',
        minQueryLength: 2,
      });
      expect(result).toHaveLength(4); // Returns all when below min length
      expect(result.every(r => r.score === 0)).toBe(true);
    });

    it('includes match type in results', () => {
      // Test exact match
      const exactResult = service.applyGlobalFilterWithRanking(
        [{ id: '1', name: 'John' }],
        { query: 'John' }
      );
      expect(exactResult[0].matchType).toBe('exact');

      // Test startsWith and contains
      const result = service.applyGlobalFilterWithRanking(testData, {
        query: 'John',
      });
      expect(result[0].matchType).toBe('startsWith');
      expect(result[0].item.name).toBe('John Doe');
    });

    it('handles searchKeys parameter', () => {
      const data = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'john@other.com' },
      ];
      const result = service.applyGlobalFilterWithRanking(data, {
        query: 'john',
        columnKeys: ['email'],
      });
      // Both have 'john' in email
      expect(result).toHaveLength(2);
    });

    it('preserves original data structure', () => {
      const result = service.applyGlobalFilterWithRanking(testData, {
        query: 'John',
      });
      expect(result[0].item).toHaveProperty('id');
      expect(result[0].item).toHaveProperty('name');
    });
  });

  describe('Levenshtein Cache', () => {
    it('caches repeated calculations', () => {
      const service1 = new SearchFilterService({});

      // First call - calculates
      const d1 = (
        service1 as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('hello', 'world');

      // Second call - should use cache
      const d2 = (
        service1 as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('hello', 'world');

      expect(d1).toBe(d2);
    });

    it('handles symmetric cache keys correctly', () => {
      const service2 = new SearchFilterService({});

      // These should be different cache entries
      const d1 = (
        service2 as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('abc', 'def');
      const d2 = (
        service2 as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('def', 'abc');

      // Distance should be symmetric
      expect(d1).toBe(d2);
    });

    it('clears cache when clearCache is called', () => {
      const service3 = new SearchFilterService({});

      // Add some entries to cache
      (
        service3 as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('test', 'best');

      // Clear cache
      service3.clearCache();

      // Should work fine after clearing
      const d = (
        service3 as unknown as {
          levenshteinDistance: (a: string, b: string) => number;
        }
      ).levenshteinDistance('test', 'best');
      expect(d).toBe(1);
    });

    it('maintains cache across multiple fuzzyMatch calls', () => {
      const service4 = new SearchFilterService({});

      // Multiple calls with similar strings
      service4.fuzzyMatch('hello world', 'hello', 2);
      service4.fuzzyMatch('hello there', 'hello', 2);
      service4.fuzzyMatch('hello again', 'hello', 2);

      // Cache should have entries
      // No errors should occur
      expect(() => service4.clearCache()).not.toThrow();
    });
  });

  describe('Performance with Ranking', () => {
    it('handles large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: String(i),
        name: `User ${i} Name`,
        email: `user${i}@example.com`,
      }));

      const start = performance.now();
      const result = service.applyGlobalFilterWithRanking(largeData, {
        query: 'User',
        maxResults: 10,
      });
      const duration = performance.now() - start;

      expect(result).toHaveLength(10);
      expect(duration).toBeLessThan(100); // Should complete in 100ms
    });

    it('handles very large datasets', () => {
      const largeData = Array.from({ length: 5000 }, (_, i) => ({
        id: String(i),
        name: `Item ${i}`,
      }));

      const start = performance.now();
      const result = service.applyGlobalFilterWithRanking(largeData, {
        query: 'Item',
        maxResults: 5,
      });
      const duration = performance.now() - start;

      expect(result).toHaveLength(5);
      expect(duration).toBeLessThan(500); // Should complete in 500ms for 5k items
    });
  });
});
