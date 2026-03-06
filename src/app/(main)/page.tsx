import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCurrentUserDetails } from '@/features/auth/lib/user-context';
import { getDashboardProjects } from '@/features/projects/service';
import { DashboardScoped } from './components/dashboard-scoped';
import { AnalyticsDashboard } from './_components/analytics-dashboard';
import { RecentActivitySection } from './_components/recent-activity-section';

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
        <div className="grid gap-4 md:grid-cols-3">
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
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-2xl font-bold">Corintek CPIS</span>
          <span className="text-sm text-muted-foreground mt-1">
            Project Information System
          </span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-sm text-muted-foreground uppercase tracking-wider">
            Role Anda
          </span>
          <span className="text-xl font-semibold mt-1">{user.role}</span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-sm text-muted-foreground uppercase tracking-wider">
            Status
          </span>
          <span className="text-xl font-semibold mt-1 text-green-600">
            Online
          </span>
        </div>
      </div>
      <div className="min-h-[60vh] flex-1 rounded-xl bg-muted/50 p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">
            Selamat Datang di Corintek CPIS
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Kelola proyek, klien, dan laporan Anda dengan mudah melalui sistem
            informasi terintegrasi ini.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/projects">Lihat Semua Proyek</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/clients">Kelola Klien</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/users">Manajemen User</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Admin/Director global analytics view */}
      <div className="grid gap-4 md:grid-cols-3">
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
