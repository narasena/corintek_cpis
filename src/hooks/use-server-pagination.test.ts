/**
 * @fileoverview Unit tests for useServerPagination hook
 * @module hooks/use-server-pagination.test
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useServerPagination } from './use-server-pagination';

describe('useServerPagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useServerPagination());

    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(10);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it('should initialize with custom values', () => {
    const { result } = renderHook(() =>
      useServerPagination({ initialPage: 5, initialLimit: 25, total: 100 })
    );

    expect(result.current.page).toBe(5);
    expect(result.current.limit).toBe(25);
    expect(result.current.total).toBe(100);
    expect(result.current.totalPages).toBe(4);
  });

  it('should update page correctly', () => {
    const { result } = renderHook(() => useServerPagination({ total: 100 }));

    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.page).toBe(5);
  });

  it('should clamp page to valid range', () => {
    const { result } = renderHook(() => useServerPagination({ total: 50 }));

    act(() => {
      result.current.setPage(100); // clamp to totalPages (5)
    });

    expect(result.current.page).toBe(5);
  });

  it('should clamp page to minimum 1', () => {
    const { result } = renderHook(() => useServerPagination());

    act(() => {
      result.current.setPage(0);
    });

    expect(result.current.page).toBe(1);
  });

  it('should update limit and reset to page 1', () => {
    const { result } = renderHook(() =>
      useServerPagination({ initialPage: 5, total: 100 })
    );

    act(() => {
      result.current.setLimit(50);
    });

    expect(result.current.limit).toBe(50);
    expect(result.current.page).toBe(1); // Reset to page 1
  });

  it('should clamp limit to MAX_LIMIT (100)', () => {
    const { result } = renderHook(() => useServerPagination());

    act(() => {
      result.current.setLimit(500);
    });

    expect(result.current.limit).toBe(100);
  });

  it('should not allow limit below 1', () => {
    const { result } = renderHook(() => useServerPagination());

    act(() => {
      result.current.setLimit(0);
    });

    expect(result.current.limit).toBe(1);
  });

  it('should navigate next page', () => {
    const { result } = renderHook(() => useServerPagination({ total: 100 }));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe(2);
  });

  it('should not navigate past last page', () => {
    const { result } = renderHook(() =>
      useServerPagination({ total: 20, initialPage: 2 })
    );

    act(() => {
      result.current.nextPage();
      result.current.nextPage();
      result.current.nextPage();
    });

    expect(result.current.page).toBe(2); // Stays at last page
  });

  it('should navigate previous page', () => {
    const { result } = renderHook(() =>
      useServerPagination({ total: 100, initialPage: 5 })
    );

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(4);
  });

  it('should not navigate before first page', () => {
    const { result } = renderHook(() => useServerPagination());

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(1);
  });

  it('should go to first page', () => {
    const { result } = renderHook(() =>
      useServerPagination({ total: 100, initialPage: 10 })
    );

    act(() => {
      result.current.firstPage();
    });

    expect(result.current.page).toBe(1);
  });

  it('should go to last page', () => {
    const { result } = renderHook(() =>
      useServerPagination({ total: 100, initialPage: 1 })
    );

    act(() => {
      result.current.lastPage();
    });

    expect(result.current.page).toBe(10);
  });

  it('should reset to initial values', () => {
    const { result } = renderHook(() =>
      useServerPagination({ initialPage: 1, initialLimit: 10, total: 100 })
    );

    act(() => {
      result.current.setLimit(50); // This resets page to 1
    });

    act(() => {
      result.current.setPage(2); // Page 2 is valid with limit 50 (totalPages=2)
    });

    expect(result.current.page).toBe(2);
    expect(result.current.limit).toBe(50);

    act(() => {
      result.current.reset();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(10);
  });

  it('should update total', () => {
    const { result } = renderHook(() => useServerPagination());

    act(() => {
      result.current.setTotal(500);
    });

    expect(result.current.total).toBe(500);
    expect(result.current.totalPages).toBe(50);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should handle negative total (edge case)', () => {
    const { result } = renderHook(() => useServerPagination());

    act(() => {
      result.current.setTotal(-10);
    });

    expect(result.current.total).toBe(0); // Clamped to 0
  });

  it('should update hasNextPage/hasPrevPage when total changes', () => {
    const { result } = renderHook(() =>
      useServerPagination({ initialPage: 1, total: 100 })
    );

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);

    act(() => {
      result.current.setTotal(0);
    });

    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });
});
