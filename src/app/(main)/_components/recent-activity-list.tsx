/**
 * Recent Activity List Component
 * @module app/(main)/_components/recent-activity-list
 */

import { ActivityItem } from './activity-item';
import type { IActivityListProps } from '@/features/dashboard/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function RecentActivityList({
  activities,
  hasMore,
  loading,
  onLoadMore,
  emptyMessage = 'Belum ada aktivitas',
}: IActivityListProps): React.ReactNode {
  if (activities.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}

      {hasMore && (
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat...
              </>
            ) : (
              'Muat lebih banyak'
            )}
          </Button>
        </div>
      )}

      {!hasMore && activities.length > 0 && (
        <div className="pt-4 text-center text-xs text-muted-foreground">
          Tidak ada aktivitas lagi
        </div>
      )}
    </div>
  );
}
