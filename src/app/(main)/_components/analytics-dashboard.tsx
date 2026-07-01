import {
  getDashboardMetricsAction,
  getRecentPhotosAction,
} from '@/features/dashboard/actions';
import { ApproachChart } from './approach-chart';
import { AmpereChart } from './ampere-chart';
import { RecentPhotosGallery } from './recent-photos-gallery';
import { TimeRangeSelector } from './time-range-selector';
import { ProjectSelector } from './project-selector';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { getCurrentUserDetails } from '@/features/auth/lib/user-context';

export async function AnalyticsDashboard({
  timeRange = '30d',
  projectId = null,
}: {
  timeRange?: '7d' | '30d' | '90d';
  projectId?: string | null;
}) {
  const user = await getCurrentUserDetails();
  if (!user) {
    return <div>User not found</div>;
  }

  const [metricsRes, photosRes] = await Promise.all([
    getDashboardMetricsAction({ timeRange, projectId: projectId ?? undefined }),
    getRecentPhotosAction({ limit: 12, projectId: projectId ?? undefined }),
  ]);

  const metrics =
    metricsRes.success && metricsRes.data ? (metricsRes.data as any) : [];
  const photos =
    photosRes.success && photosRes.data ? (photosRes.data as any) : [];

  const rangeLabel =
    timeRange === '7d' ? '7 Hari' : timeRange === '30d' ? '30 Hari' : '90 Hari';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Analitik</h2>
          <p className="text-sm text-muted-foreground">
            Pantau metrik performa unit pendingin
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ProjectSelector userRole={user.role} />
          <TimeRangeSelector defaultValue={timeRange} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col border transition-all hover:border-primary/40 hover:shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">
              Trend Approach ({rangeLabel})
            </CardTitle>
            <CardDescription className="text-xs">
              Histori rata-rata Condenser dan Evaporator Approach
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ApproachChart data={metrics} />
          </CardContent>
        </Card>

        <Card className="flex flex-col border transition-all hover:border-primary/40 hover:shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">
              Trend Ampere ({rangeLabel})
            </CardTitle>
            <CardDescription className="text-xs">
              Histori rata-rata Condenser dan Evaporator Ampere
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <AmpereChart data={metrics} />
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col border transition-all hover:border-primary/40 hover:shadow-md">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-bold">
            Galeri Foto Terbaru
          </CardTitle>
          <CardDescription className="text-xs">
            Foto-foto terbaru dari pengisian Log Sheet unit pendingin
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <RecentPhotosGallery photos={photos} />
        </CardContent>
      </Card>
    </div>
  );
}
