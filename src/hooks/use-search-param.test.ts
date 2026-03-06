/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearchParam } from './use-search-param';

// Mock Next.js navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn((key: string) => {
      const params = new URLSearchParams(window.location.search);
      return params.get(key);
    }),
    toString: () => window.location.search.slice(1),
  }),
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  usePathname: () => '/test-path',
}));

describe('useSearchParam', () => {
  beforeEach(() => {
    // Reset URL
    window.history.pushState({}, '', '/test-path');
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('reads initial value from URL', () => {
    window.history.pushState({}, '', '/test-path?search=initial');

    const { result } = renderHook(() => useSearchParam());

    expect(result.current.value).toBe('initial');
  });

  it('returns empty string when param not in URL', () => {
    const { result } = renderHook(() => useSearchParam());

    expect(result.current.value).toBe('');
  });

  it('updates URL after debounce', async () => {
    const { result } = renderHook(() => useSearchParam({ debounceMs: 300 }));

    act(() => {
      result.current.setValue('new-value');
    });

    // Should not update immediately
    expect(mockReplace).not.toHaveBeenCalled();

    // Fast-forward past debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/test-path?search=new-value', {
        scroll: false,
      });
    });
  });

  it('uses custom param name', async () => {
    window.history.pushState({}, '', '/test-path?q=custom');

    const { result } = renderHook(() => useSearchParam({ paramName: 'q' }));

    expect(result.current.value).toBe('custom');

    act(() => {
      result.current.setValue('new-query');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/test-path?q=new-query', {
        scroll: false,
      });
    });
  });

  it('clears value from URL', async () => {
    window.history.pushState({}, '', '/test-path?search=remove-me');

    const { result } = renderHook(() => useSearchParam());

    act(() => {
      result.current.clearValue();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/test-path?', {
        scroll: false,
      });
    });
  });

  it('uses push instead of replace when configured', async () => {
    const { result } = renderHook(() => useSearchParam({ replace: false }));

    act(() => {
      result.current.setValue('pushed-value');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test-path?search=pushed-value', {
        scroll: false,
      });
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('handles rapid changes with debounce', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => {
        const hook = useSearchParam({ debounceMs: 300 });
        if (value !== undefined) {
          hook.setValue(value);
        }
        return hook;
      },
      { initialProps: { value: undefined as string | undefined } }
    );

    // Rapid changes
    rerender({ value: 'a' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'abc' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should not have updated yet
    expect(mockReplace).not.toHaveBeenCalled();

    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      // Should only be called once with final value
      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/test-path?search=abc', {
        scroll: false,
      });
    });
  });

  it('preserves other URL parameters', async () => {
    window.history.pushState({}, '', '/test-path?page=2&sort=desc');

    const { result } = renderHook(() => useSearchParam());

    act(() => {
      result.current.setValue('search-term');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      const callUrl = mockReplace.mock.calls[0][0];
      expect(callUrl).toContain('page=2');
      expect(callUrl).toContain('sort=desc');
      expect(callUrl).toContain('search=search-term');
    });
  });

  it('handles special characters in values', async () => {
    const { result } = renderHook(() => useSearchParam());

    act(() => {
      result.current.setValue('hello world & more');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('search=hello+world+%26+more'),
        { scroll: false }
      );
    });
  });

  it('returns cleanup function from setValue', () => {
    const { result } = renderHook(() => useSearchParam({ debounceMs: 300 }));

    let cleanup: (() => void) | undefined;

    act(() => {
      const returnValue = result.current.setValue('test');
      cleanup = returnValue ?? undefined;
    });

    expect(typeof cleanup).toBe('function');
  });

  it('syncs with URL changes', async () => {
    const { result } = renderHook(() => useSearchParam());

    // Initial state
    expect(result.current.value).toBe('');

    // Simulate URL change
    act(() => {
      window.history.pushState({}, '', '/test-path?search=external-change');
    });

    // Hook should detect change
    await waitFor(() => {
      expect(result.current.value).toBe('external-change');
    });
  });

  it('handles empty string value', async () => {
    window.history.pushState({}, '', '/test-path?search=existing');

    const { result } = renderHook(() => useSearchParam());

    act(() => {
      result.current.setValue('');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      // Should remove param, not set to empty string
      expect(mockReplace).toHaveBeenCalledWith('/test-path?', {
        scroll: false,
      });
    });
  });

  it('handles very long values', async () => {
    const { result } = renderHook(() => useSearchParam());
    const longValue = 'a'.repeat(1000);

    act(() => {
      result.current.setValue(longValue);
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(longValue),
        { scroll: false }
      );
    });
  });
});
