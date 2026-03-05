/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFuzzySearch } from './use-fuzzy-search';

const testData = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@test.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: '4', name: 'Alice Williams', email: 'alice@test.com' },
  { id: '5', name: 'Jonny Cash', email: 'jonny@music.com' },
];

describe('useFuzzySearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns empty results for empty query', () => {
    const { result } = renderHook(() => useFuzzySearch({ data: testData }));

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('returns empty results for query below min length', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, minQueryLength: 3 })
    );

    act(() => {
      result.current.setQuery('Jo');
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('finds exact matches', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('John Doe');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].item.name).toBe('John Doe');
    expect(result.current.results[0].distance).toBe(0);
  });

  it('finds substring matches', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('John');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should find "John Doe" and "Bob Johnson"
    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
  });

  it('finds fuzzy matches within tolerance', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, debounceMs: 100, tolerance: 2 })
    );

    act(() => {
      result.current.setQuery('Jonny'); // Fuzzy match for "Johnny"
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should find "Jonny Cash" (exact) and potentially others
    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
  });

  it('is case insensitive', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('JOHN');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
  });

  it('respects maxResults', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({
        data: testData,
        debounceMs: 100,
        maxResults: 2,
      })
    );

    act(() => {
      result.current.setQuery('e'); // Many matches
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results.length).toBeLessThanOrEqual(2);
  });

  it('clears query correctly', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('John');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearQuery();
    });

    expect(result.current.query).toBe('');

    // Results clear after debounce delay
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.results).toEqual([]);
  });

  it('respects searchKeys parameter', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({
        data: testData,
        debounceMs: 100,
        searchKeys: ['email'],
      })
    );

    act(() => {
      result.current.setQuery('example.com');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should find items with example.com in email
    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
  });

  it('sets isPending during debounce', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, debounceMs: 200 })
    );

    act(() => {
      result.current.setQuery('John');
    });

    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isPending).toBe(false);
  });

  it('ignores invalid query types', () => {
    const { result } = renderHook(() => useFuzzySearch({ data: testData }));

    act(() => {
      // @ts-expect-error - Testing invalid input
      result.current.setQuery(null);
    });

    expect(result.current.query).toBe('');
  });

  it('sorts results by distance', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({
        data: [
          { id: '1', name: 'test' },
          { id: '2', name: 'tester' },
          { id: '3', name: 'testing' },
        ],
        debounceMs: 100,
        tolerance: 3,
      })
    );

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Exact match "test" should be first
    expect(result.current.results[0].item.name).toBe('test');
  });

  it('handles empty data array', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: [], debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results).toEqual([]);
  });

  it('handles special characters in query', () => {
    const { result } = renderHook(() =>
      useFuzzySearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('@example.com');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
  });
});
