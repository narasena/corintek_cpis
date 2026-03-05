/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataTableSearch } from './use-data-table-search';

const testData = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@test.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: '4', name: 'Alice Williams', email: 'alice@test.com' },
];

describe('useDataTableSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns all data when query is empty', () => {
    const { result } = renderHook(() => useDataTableSearch({ data: testData }));

    expect(result.current.query).toBe('');
    expect(result.current.filteredData).toEqual(testData);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.resultInfo).toEqual({ filtered: 4, total: 4 });
  });

  it('filters data based on query', () => {
    const { result } = renderHook(() =>
      useDataTableSearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('John');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.filteredData.map(d => d.name)).toContain('John Doe');
    expect(result.current.filteredData.map(d => d.name)).toContain(
      'Bob Johnson'
    );
  });

  it('is case insensitive', () => {
    const { result } = renderHook(() =>
      useDataTableSearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('JANE');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('Jane Smith');
  });

  it('respects minQueryLength', () => {
    const { result } = renderHook(() =>
      useDataTableSearch({ data: testData, debounceMs: 100, minQueryLength: 3 })
    );

    act(() => {
      result.current.setQuery('Jo'); // Less than minQueryLength
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toEqual(testData); // No filter applied
    expect(result.current.isSearching).toBe(false);

    act(() => {
      result.current.setQuery('Joh'); // Meets minQueryLength
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.isSearching).toBe(true);
  });

  it('clears query correctly', () => {
    const { result } = renderHook(() =>
      useDataTableSearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('John');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toHaveLength(2);

    act(() => {
      result.current.clearQuery();
    });

    // Need to wait for debounce after clearing
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.query).toBe('');
    expect(result.current.filteredData).toEqual(testData);
  });

  it('filters by specific column keys', () => {
    const { result } = renderHook(() =>
      useDataTableSearch({
        data: testData,
        debounceMs: 100,
        searchKeys: ['name'],
      })
    );

    act(() => {
      result.current.setQuery('example.com'); // In email, not name
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should find no matches since we're only searching 'name' column
    expect(result.current.filteredData).toHaveLength(0);
  });

  it('ignores non-string values in search', () => {
    const dataWithNumbers = [
      { id: '1', name: 'Item A', count: 100 },
      { id: '2', name: 'Item B', count: 200 },
    ];

    const { result } = renderHook(() =>
      useDataTableSearch({ data: dataWithNumbers, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('100');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should find Item A because count is converted to string
    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('Item A');
  });

  it('returns no matches for non-matching query', () => {
    const { result } = renderHook(() =>
      useDataTableSearch({ data: testData, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('xyz-not-found');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toHaveLength(0);
    expect(result.current.resultInfo).toEqual({ filtered: 0, total: 4 });
  });

  it('handles empty data array', () => {
    const { result } = renderHook(() =>
      useDataTableSearch({ data: [], debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('test');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toEqual([]);
    expect(result.current.resultInfo).toEqual({ filtered: 0, total: 0 });
  });

  it('ignores null and undefined values', () => {
    const dataWithNulls = [
      { id: '1', name: 'John', email: null },
      { id: '2', name: 'Jane', email: undefined },
      { id: '3', name: 'Bob', email: 'bob@example.com' },
    ];

    const { result } = renderHook(() =>
      useDataTableSearch({ data: dataWithNulls, debounceMs: 100 })
    );

    act(() => {
      result.current.setQuery('example');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('Bob');
  });
});
