import {
  getDashboardMetricsAction,
  getRecentPhotosAction,
} from '@/features/dashboard/actions';
import { ApproachChart } from './approach-chart';
import { AmpereChart } from './ampere-chart';
import { RecentPhotosGallery } from './recent-photos-gallery';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { subDays } from 'date-fns';

export async function AnalyticsDashboard() {
  // We can default to the last 30 days for metrics
  const to = new Date();
  const from = subDays(to, 30);

  const [metricsRes, photosRes] = await Promise.all([
    getDashboardMetricsAction({ range: { start: from, end: to } }),
    getRecentPhotosAction({ limit: 12 }),
  ]);

  const metrics =
    metricsRes.success && metricsRes.data ? (metricsRes.data as any) : [];
  const photos =
    photosRes.success && photosRes.data ? (photosRes.data as any) : [];

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col border transition-all hover:border-primary/40 hover:shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold">
              Trend Approach (30 Hari)
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
              Trend Ampere (30 Hari)
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
