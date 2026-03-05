import { describe, it, expect, vi } from 'vitest';
import { SearchFilterService } from './search-filter-service';

describe('SearchFilterService', () => {
  const service = new SearchFilterService({
    defaultDebounceMs: 300,
    defaultMinQueryLength: 1,
  });

  const testData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: '2', name: 'Jane Smith', email: 'jane@test.com', age: 25 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
  ];

  describe('applyGlobalFilter', () => {
    it('returns unfiltered result for empty query', () => {
      const result = service.applyGlobalFilter(testData, { query: '' });

      expect(result.isFiltered).toBe(false);
      expect(result.filteredData).toEqual(testData);
      expect(result.matchCount).toBe(3);
    });

    it('returns unfiltered result for query below min length', () => {
      const result = service.applyGlobalFilter(testData, {
        query: 'J',
        minQueryLength: 3,
      });

      expect(result.isFiltered).toBe(false);
      expect(result.filteredData).toEqual(testData);
    });

    it('filters data matching query', () => {
      const result = service.applyGlobalFilter(testData, { query: 'John' });

      expect(result.isFiltered).toBe(true);
      expect(result.matchCount).toBe(2);
      expect(result.filteredData.map(d => d.name)).toContain('John Doe');
      expect(result.filteredData.map(d => d.name)).toContain('Bob Johnson');
    });

    it('does not mutate original array', () => {
      const original = [...testData];
      service.applyGlobalFilter(testData, { query: 'John' });

      expect(testData).toEqual(original);
    });
  });

  describe('createFilterPredicate', () => {
    it('creates predicate matching all fields', () => {
      const predicate = service.createFilterPredicate({ query: 'example' });

      expect(predicate(testData[0])).toBe(true); // john@example.com
      expect(predicate(testData[1])).toBe(false); // jane@test.com
      expect(predicate(testData[2])).toBe(true); // bob@example.com
    });

    it('is case insensitive by default', () => {
      const predicate = service.createFilterPredicate({ query: 'JOHN' });

      expect(predicate(testData[0])).toBe(true);
      expect(predicate(testData[2])).toBe(true);
    });

    it('respects caseSensitive option', () => {
      const predicate = service.createFilterPredicate({
        query: 'JOHN',
        caseInsensitive: false,
      });

      expect(predicate(testData[0])).toBe(false); // John != JOHN
    });

    it('filters by specific column keys', () => {
      const predicate = service.createFilterPredicate({
        query: 'example',
        columnKeys: ['name'],
      });

      expect(predicate(testData[0])).toBe(false); // "John Doe" doesn't contain "example"
      expect(predicate(testData[2])).toBe(false); // "Bob Johnson" doesn't contain "example"
    });
  });

  describe('valueMatchesQuery', () => {
    it('matches string values', () => {
      expect(service.valueMatchesQuery('hello world', 'world')).toBe(true);
      expect(service.valueMatchesQuery('hello world', 'foo')).toBe(false);
    });

    it('matches number values (converted to string)', () => {
      expect(service.valueMatchesQuery(12345, '23')).toBe(true);
      expect(service.valueMatchesQuery(100, '50')).toBe(false);
    });

    it('matches boolean values (converted to string)', () => {
      expect(service.valueMatchesQuery(true, 'true')).toBe(true);
      expect(service.valueMatchesQuery(false, 'false')).toBe(true);
    });

    it('returns false for null', () => {
      expect(service.valueMatchesQuery(null, 'test')).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(service.valueMatchesQuery(undefined, 'test')).toBe(false);
    });

    it('is case insensitive by default', () => {
      expect(service.valueMatchesQuery('HELLO', 'hello')).toBe(true);
      expect(service.valueMatchesQuery('Hello World', 'WORLD')).toBe(true);
    });

    it('respects caseSensitive option', () => {
      expect(service.valueMatchesQuery('HELLO', 'hello', false)).toBe(false);
      expect(service.valueMatchesQuery('Hello', 'Hello', false)).toBe(true);
    });

    it('handles empty query', () => {
      expect(service.valueMatchesQuery('hello', '')).toBe(true);
    });

    it('handles special characters in query', () => {
      expect(service.valueMatchesQuery('hello@world.com', '@')).toBe(true);
      expect(service.valueMatchesQuery('price: $100', '$')).toBe(true);
      expect(service.valueMatchesQuery('item #123', '#')).toBe(true);
    });
  });

  describe('extractSearchableValues', () => {
    it('extracts all values when no keys specified', () => {
      const values = service.extractSearchableValues(testData[0]);

      expect(values).toContain('1');
      expect(values).toContain('John Doe');
      expect(values).toContain('john@example.com');
      expect(values).toContain('30');
    });

    it('extracts only specified keys', () => {
      const values = service.extractSearchableValues(testData[0], [
        'name',
        'email',
      ]);

      expect(values).toEqual(['John Doe', 'john@example.com']);
    });

    it('excludes null values', () => {
      const obj = { a: 'value', b: null, c: 'another' };
      const values = service.extractSearchableValues(obj);

      expect(values).toContain('value');
      expect(values).toContain('another');
      expect(values).not.toContain(null);
    });

    it('excludes undefined values', () => {
      const obj = { a: 'value', b: undefined, c: 'another' };
      const values = service.extractSearchableValues(obj);

      expect(values).toContain('value');
      expect(values).toContain('another');
      expect(values).not.toContain(undefined);
    });

    it('converts all values to strings', () => {
      const obj = { num: 42, bool: true, str: 'text' };
      const values = service.extractSearchableValues(obj);

      expect(values).toContain('42');
      expect(values).toContain('true');
      expect(values).toContain('text');
    });

    it('handles empty object', () => {
      const values = service.extractSearchableValues({});

      expect(values).toEqual([]);
    });

    it('handles object with only null/undefined values', () => {
      const values = service.extractSearchableValues({ a: null, b: undefined });

      expect(values).toEqual([]);
    });
  });

  describe('constructor configuration', () => {
    it('uses provided defaults', () => {
      const customService = new SearchFilterService({
        defaultDebounceMs: 500,
        defaultMinQueryLength: 2,
      });

      const result = customService.applyGlobalFilter(testData, {
        query: 'J',
      });

      // Should not filter because query length (1) < defaultMinQueryLength (2)
      expect(result.isFiltered).toBe(false);
    });

    it('uses built-in defaults when not provided', () => {
      const minimalService = new SearchFilterService({});

      const result = minimalService.applyGlobalFilter(testData, {
        query: 'J',
      });

      // Should filter because default min length is 1
      expect(result.isFiltered).toBe(true);
    });
  });
});
