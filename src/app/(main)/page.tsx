import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCurrentUserDetails } from '@/features/auth/lib/user-context';
import { getDashboardProjects } from '@/features/projects/service';
import { DashboardScoped } from './components/dashboard-scoped';
import { AnalyticsDashboard } from './_components/analytics-dashboard';
import { RecentActivitySection } from './_components/recent-activity-section';
import { Activity, Briefcase, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Page() {
  const user = await getCurrentUserDetails();

  if (!user) {
    return null; // Should be handled by middleware
  }

  const isScopedRole =
    user.role === 'SUPERVISOR' ||
    user.role === 'TECHNICIAN' ||
    user.role === 'CLIENT' ||
    user.role === 'CLIENT_SUPERVISOR' ||
    user.role === 'CLIENT_TECHNICIAN';

  if (isScopedRole) {
    const projects = await getDashboardProjects({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return (
      <DashboardScoped user={user} projects={projects}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <AnalyticsDashboard />
          </div>
          <div className="md:col-span-1">
            <RecentActivitySection />
          </div>
        </div>
      </DashboardScoped>
    );
  }

  // Default Dashboard for ADMIN, DIRECTOR, REPORTING
  const stats = await import('@/features/dashboard/service').then(m =>
    m.getAdminDashboardStats()
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/10 p-8 sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Selamat Datang di Corintek CPIS
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed">
            Kelola proyek, pantau metrik analitik, dan awasi laporan pekerjaan
            dengan mudah melalui sistem informasi terintegrasi ini.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="default" className="rounded-full px-6">
              <Link href="/projects">Lihat Semua Proyek</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="default"
              className="rounded-full px-6 shadow-sm"
            >
              <Link href="/clients">Kelola Klien</Link>
            </Button>
            <Button
              variant="secondary"
              asChild
              size="default"
              className="rounded-full px-6 shadow-sm"
            >
              <Link href="/users">Manajemen User</Link>
            </Button>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
          <Activity className="w-96 h-96 text-primary" />
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif / Total Proyek
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Briefcase className="h-4 w-4 text-primary font-bold" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeProjects} / {stats.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Status: ONGOING
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Log Sheet Baru
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <FileText className="h-4 w-4 text-emerald-600 font-bold" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLogSheets}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Menunggu review
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Klien
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Users className="h-4 w-4 text-blue-600 font-bold" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif berlangganan
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Sistem
            </CardTitle>
            <div className="p-2 bg-green-500/10 rounded-full animate-pulse">
              <Activity className="h-4 w-4 text-green-600 font-bold" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground mt-1">
              Role: <span className="font-semibold">{user.role}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin/Director global analytics view */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <AnalyticsDashboard />
        </div>
        <div className="md:col-span-1">
          <RecentActivitySection />
        </div>
      </div>
    </div>
  );
}
