'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, ClipboardList, FileText } from 'lucide-react';

import type { IProjectDashboardCard } from '@/features/projects/types';
import type { ICurrentUserDetails } from '@/lib/auth-helpers';
import { canAccess, RbacResource } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDashboardProjectsAction } from '@/features/projects/actions';
import { createLogSheetAction } from '@/features/log-sheets/actions';

interface DashboardScopedProps {
  user: ICurrentUserDetails;
  projects: IProjectDashboardCard[];
  children?: React.ReactNode;
}

function scopeLabel(role: string) {
  if (role === 'PROJECT_PIC') return 'PIC';
  if (role === 'TECHNICIAN') return 'Teknisi';
  if (role === 'CLIENT_PIC') return 'PIC Klien';
  return role;
}

function statusBadgeClass(status: string) {
  if (status === 'ONGOING') return 'bg-emerald-500/10 text-emerald-700';
  if (status === 'PAUSED') return 'bg-amber-500/10 text-amber-700';
  if (status === 'COMPLETED') return 'bg-slate-500/10 text-slate-700';
  if (status === 'CANCELLED') return 'bg-rose-500/10 text-rose-700';
  return 'bg-muted text-muted-foreground';
}

export function DashboardScoped({
  user,
  projects: initialProjects,
  children,
}: DashboardScopedProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] =
    useState<IProjectDashboardCard[]>(initialProjects);

  const displayName = useMemo(() => {
    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
  }, [user.firstName, user.lastName]);

  const refresh = useCallback(() => {
    startTransition(async () => {
      const res = await getDashboardProjectsAction();
      if (res.success && res.data) {
        setProjects(res.data as IProjectDashboardCard[]);
      }
    });
  }, []);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const intervalId = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const handleQuickCreateLogSheet = (projectId: string) => {
    startTransition(async () => {
      const res = await createLogSheetAction({
        projectId,
        date: new Date(),
      });

      if (!res.success) {
        toast.error('Gagal membuat log sheet', { description: res.error });
        return;
      }

      toast.success('Log sheet dibuat');
      const logSheetId = res.data.id;
      router.push(`/log-sheets/${projectId}/${logSheetId}`);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Selamat Datang, {displayName}
        </h1>
        <p className="text-muted-foreground">
          Proyek aktif Anda otomatis ditampilkan berdasarkan penugasan.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <Card className="col-span-full p-8 text-center flex flex-col items-center gap-3 border-dashed">
            <div className="p-3 rounded-full bg-muted/50">
              <ClipboardList className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">
                Tidak ada proyek aktif
              </CardTitle>
              <CardDescription className="text-xs">
                Anda saat ini tidak ditugaskan ke proyek aktif mana pun.
              </CardDescription>
            </div>
          </Card>
        ) : (
          projects.map(project => {
            const isPic = project.myAssignmentRoles.includes('PROJECT_PIC');
            const logSheetPending = project.taskCounts.logSheetsPendingApproval;
            const workReportPending =
              project.taskCounts.workReportsPendingApproval;

            return (
              <Card
                key={project.id}
                className="flex flex-col border transition-all hover:border-primary/40 hover:shadow-md group"
              >
                <CardHeader className="p-3.5 pb-2 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <div
                      className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight border ${statusBadgeClass(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-foreground/70 line-clamp-1">
                      {project.client?.name || 'No Client'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.quoteNumber && (
                        <span className="text-[9px] bg-muted/50 text-muted-foreground px-1 py-0.5 rounded font-medium border border-transparent group-hover:border-muted-foreground/10">
                          {project.quoteNumber}
                        </span>
                      )}
                      {project.myAssignmentRoles.map(r => (
                        <span
                          key={r}
                          className="text-[9px] bg-primary/5 text-primary/80 px-1 py-0.5 rounded font-semibold border border-primary/10"
                        >
                          {scopeLabel(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 pt-1.5 flex-1 flex flex-col">
                  <div className="flex flex-col gap-1.5 mt-auto">
                    {canAccess(
                      user.role,
                      RbacResource.LOG_SHEETS,
                      'create'
                    ) && (
                      <Button
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-xs font-medium shadow-none"
                        onClick={() => handleQuickCreateLogSheet(project.id)}
                        disabled={isPending}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Buat Log Sheet
                      </Button>
                    )}

                    {canAccess(
                      user.role,
                      RbacResource.WORK_REPORTS,
                      'create'
                    ) && (
                      <Button
                        asChild
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-xs font-medium border-muted-foreground/20 hover:bg-muted/50"
                        variant="outline"
                      >
                        <Link href={`/work-reports/${project.id}?create=1`}>
                          <ClipboardList className="h-3.5 w-3.5" />
                          Buat Laporan
                        </Link>
                      </Button>
                    )}

                    {canAccess(user.role, RbacResource.LOG_SHEETS, 'read') &&
                      isPic && (
                        <Button
                          asChild
                          size="sm"
                          className="w-full justify-start gap-2 h-8 text-xs font-medium border-muted-foreground/20"
                          variant={logSheetPending > 0 ? 'default' : 'outline'}
                        >
                          <Link href={`/log-sheets/${project.id}`}>
                            <FileText className="h-3.5 w-3.5" />
                            Persetujuan Log Sheet
                            {logSheetPending > 0 ? (
                              <span className="ml-auto bg-primary-foreground text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                                {logSheetPending}
                              </span>
                            ) : null}
                          </Link>
                        </Button>
                      )}

                    {canAccess(user.role, RbacResource.WORK_REPORTS, 'read') &&
                      isPic && (
                        <Button
                          asChild
                          size="sm"
                          className="w-full justify-start gap-2 h-8 text-xs font-medium border-muted-foreground/20"
                          variant={
                            workReportPending > 0 ? 'default' : 'outline'
                          }
                        >
                          <Link href={`/work-reports/${project.id}`}>
                            <ClipboardList className="h-3.5 w-3.5" />
                            Persetujuan Laporan
                            {workReportPending > 0 ? (
                              <span className="ml-auto bg-primary-foreground text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                                {workReportPending}
                              </span>
                            ) : null}
                          </Link>
                        </Button>
                      )}
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-muted/60">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-[11px] h-7 text-muted-foreground hover:text-primary hover:bg-primary/5 font-semibold uppercase tracking-wider transition-all"
                    >
                      <Link href={`/my-projects/${project.id}`}>
                        Buka Proyek <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {children}
    </div>
  );
}
