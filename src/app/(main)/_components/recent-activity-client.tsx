/**
 * Recent Activity Client Component
 * @module app/(main)/_components/recent-activity-client
 */

'use client';

import { RecentActivityList } from './recent-activity-list';
import { useRecentActivities } from '../hooks/use-recent-activities';
import type { IRecentActivityCardProps } from '@/features/dashboard/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function RecentActivityClient({
  initialActivities,
  projectId,
  defaultTimeRange = '7d',
}: IRecentActivityCardProps): React.ReactElement {
  const { activities, hasMore, loading, error, loadMore, setTimeRange } =
    useRecentActivities({
      initialData: initialActivities
        ? { activities: initialActivities, hasMore: false, nextCursor: null }
        : undefined,
      projectId,
      timeRange: defaultTimeRange,
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          defaultValue={defaultTimeRange}
          onValueChange={v => setTimeRange(v as '7d' | '30d')}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 hari terakhir</SelectItem>
            <SelectItem value="30d">30 hari terakhir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {error}
        </div>
      )}

      <RecentActivityList
        activities={activities}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
      />
    </div>
  );
}
