/**
 * Hook for fetching recent activities with infinite scroll
 * @module app/(main)/hooks/use-recent-activities
 */

'use client';

import { useState, useCallback } from 'react';
import { getRecentActivitiesAction } from '@/features/dashboard/actions';
import type { IActivity, TActivityTimeRange } from '@/features/dashboard/types';

interface UseRecentActivitiesOptions {
  initialData?: {
    activities: IActivity[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  projectId?: string;
  timeRange?: TActivityTimeRange;
}

interface UseRecentActivitiesReturn {
  activities: IActivity[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setTimeRange: (range: TActivityTimeRange) => void;
}

export function useRecentActivities(
  options: UseRecentActivitiesOptions = {}
): UseRecentActivitiesReturn {
  const [activities, setActivities] = useState<IActivity[]>(
    options.initialData?.activities ?? []
  );
  const [hasMore, setHasMore] = useState(options.initialData?.hasMore ?? false);
  const [cursor, setCursor] = useState<string | null>(
    options.initialData?.nextCursor ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRangeState] = useState<TActivityTimeRange>(
    options.timeRange ?? '7d'
  );

  const fetchActivities = useCallback(
    async (cursorParam?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getRecentActivitiesAction({
          projectId: options.projectId,
          timeRange,
          limit: 15,
          cursor: cursorParam,
        });

        if (result.success && result.data) {
          if (cursorParam) {
            setActivities(prev => [...prev, ...result.data!.activities]);
          } else {
            setActivities(result.data.activities);
          }
          setHasMore(result.data.hasMore);
          setCursor(result.data.nextCursor);
        } else {
          setError(result.error ?? 'Gagal memuat aktivitas');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gagal memuat aktivitas');
      } finally {
        setLoading(false);
      }
    },
    [options.projectId, timeRange]
  );

  const loadMore = useCallback(async () => {
    if (cursor && !loading) await fetchActivities(cursor);
  }, [cursor, loading, fetchActivities]);

  const refresh = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  const setTimeRange = useCallback((range: TActivityTimeRange) => {
    setTimeRangeState(range);
    setActivities([]);
    setCursor(null);
  }, []);

  return {
    activities,
    hasMore,
    loading,
    error,
    loadMore,
    refresh,
    setTimeRange,
  };
}
