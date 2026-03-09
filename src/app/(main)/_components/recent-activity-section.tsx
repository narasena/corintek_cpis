/**
 * Recent Activity Section (Server Component)
 * @module app/(main)/_components/recent-activity-section
 */
import type { TRbacRole } from '@/lib/rbac';

import { Suspense } from 'react';
import { RecentActivityClient } from './recent-activity-client';
import { getRecentActivitiesAction } from '@/features/dashboard/actions';
import { getCurrentUserDetails } from '@/features/auth/lib/user-context';
import { getDashboardConfig } from '@/features/dashboard/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RecentActivitySectionProps {
  projectId?: string;
}

export async function RecentActivitySection({
  projectId,
}: RecentActivitySectionProps): Promise<React.ReactElement> {
  const user = await getCurrentUserDetails();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Silakan login untuk melihat aktivitas
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = getDashboardConfig(user.role as TRbacRole);
  const initialResult = await getRecentActivitiesAction({
    projectId,
    timeRange: config.defaultTimeRange,
    limit: 15,
  });

  const initialData =
    initialResult.success && initialResult.data
      ? initialResult.data.activities
      : [];

  return (
    <Card className="flex flex-col border transition-all hover:border-primary/40 hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-bold">Aktivitas Terbaru</CardTitle>
        <CardDescription className="text-xs">
          Aktivitas tim dan proyek terkini
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Suspense fallback={<div>Memuat aktivitas...</div>}>
          <RecentActivityClient
            initialActivities={initialData}
            projectId={projectId}
            defaultTimeRange={config.defaultTimeRange}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
