import {
  Calendar,
  FileText,
  ClipboardList,
  FlaskConical,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

import { IProject } from '@/features/projects/types';
import { ICurrentUserDetails } from '@/lib/auth-helpers';
import { canAccess, RbacResource } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DashboardScopedProps {
  user: ICurrentUserDetails;
  projects: IProject[];
}

export function DashboardScoped({ user, projects }: DashboardScopedProps) {
  const displayName = user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Selamat Datang, {displayName}
        </h1>
        <p className="text-muted-foreground">
          Berikut adalah proyek aktif Anda. Pilih tugas untuk memulai.
        </p>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <CardTitle>Tidak ada proyek aktif</CardTitle>
              <CardDescription>
                Anda saat ini tidak ditugaskan ke proyek aktif mana pun.
              </CardDescription>
            </div>
          </Card>
        ) : (
          projects.map(project => (
            <Card
              key={project.id}
              className="overflow-hidden border-2 transition-all hover:border-primary/50"
            >
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {project.client?.name || 'No Client'}
                      </span>
                      {project.quoteNumber && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {project.quoteNumber}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wider">
                    {project.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Attendance - Shared across projects but usually done once per day */}
                  {canAccess(user.role, RbacResource.ATTENDANCE, 'read') && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-28 flex-col gap-3 hover:bg-primary/5 hover:border-primary/30"
                    >
                      <Link href="/attendance">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">Absensi</span>
                      </Link>
                    </Button>
                  )}

                  {/* Log Sheets */}
                  {canAccess(user.role, RbacResource.LOG_SHEETS, 'read') && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-28 flex-col gap-3 hover:bg-primary/5 hover:border-primary/30"
                    >
                      <Link href={`/log-sheets/${project.id}`}>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                          <FileText className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">Log Sheet</span>
                      </Link>
                    </Button>
                  )}

                  {/* Work Reports */}
                  {canAccess(user.role, RbacResource.WORK_REPORTS, 'read') && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-28 flex-col gap-3 hover:bg-primary/5 hover:border-primary/30"
                    >
                      <Link href={`/work-reports/${project.id}`}>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">Laporan Kerja</span>
                      </Link>
                    </Button>
                  )}

                  {/* Lab Analyses */}
                  {canAccess(user.role, RbacResource.LAB_ANALYSES, 'read') && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-28 flex-col gap-3 hover:bg-primary/5 hover:border-primary/30"
                    >
                      <Link href={`/lab-analyses/${project.id}`}>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                          <FlaskConical className="h-6 w-6" />
                        </div>
                        <span className="font-semibold">Analisa Lab</span>
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t flex justify-end">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Link href={`/projects/${project.id}`}>
                      Lihat Detail Proyek <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
