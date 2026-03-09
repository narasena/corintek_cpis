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
import {
  ArrowRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
} from 'lucide-react';

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
  if (status === 'ONGOING')
    return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  if (status === 'PAUSED')
    return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  if (status === 'COMPLETED')
    return 'bg-slate-500/10 text-slate-700 border-slate-500/20';
  if (status === 'CANCELLED')
    return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
  return 'bg-muted text-muted-foreground border-transparent';
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
    <div className="flex flex-1 flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Selamat Datang, {displayName}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
          Proyek aktif Anda otomatis ditampilkan di bawah ini. Akses cepat untuk
          membuat log sheet atau laporan harian.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.length === 0 ? (
          <Card className="col-span-full border-border/40 shadow-none bg-primary/5 p-12 flex flex-col items-center justify-center text-center rounded-2xl">
            <div className="p-4 rounded-full bg-background mb-4 shadow-sm">
              <LayoutDashboard className="h-8 w-8 text-primary/60" />
            </div>
            <CardTitle className="text-lg font-bold">
              Tidak ada proyek aktif
            </CardTitle>
            <CardDescription className="text-sm mt-2 max-w-sm">
              Anda saat ini tidak ditugaskan ke proyek aktif mana pun. Hubungi
              supervisor jika ini adalah kesalahan.
            </CardDescription>
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
                className="flex flex-col border border-border/50 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-1 group bg-background/60 backdrop-blur-sm rounded-xl overflow-hidden"
              >
                <div className="h-1.5 w-full bg-linear-to-r from-primary/40 to-primary/10" />
                <CardHeader className="p-4 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <div
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeClass(
                        project.status
                      )}`}
                    >
                      {project.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-sm font-medium text-foreground/80 line-clamp-1">
                      {project.client?.name || 'Klien Internal'}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.quoteNumber && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md font-medium">
                          {project.quoteNumber}
                        </span>
                      )}
                      {project.myAssignmentRoles.map(r => (
                        <span
                          key={r}
                          className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold"
                        >
                          {scopeLabel(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 flex-1 flex flex-col">
                  <div className="flex flex-col gap-2 mt-auto">
                    {canAccess(
                      user.role,
                      RbacResource.LOG_SHEETS,
                      'create'
                    ) && (
                      <Button
                        size="sm"
                        className="w-full justify-start gap-2 h-9 text-xs font-semibold shadow-none rounded-lg bg-primary/95 hover:bg-primary"
                        onClick={() => handleQuickCreateLogSheet(project.id)}
                        disabled={isPending}
                      >
                        <FileText className="h-4 w-4" />
                        Buat Log Sheet Baru
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
                        className="w-full justify-start gap-2 h-9 text-xs font-medium border-border/60 hover:bg-muted rounded-lg"
                        variant="outline"
                      >
                        <Link href={`/work-reports/${project.id}?create=1`}>
                          <ClipboardList className="h-4 w-4 text-muted-foreground" />
                          Buat Laporan Baru
                        </Link>
                      </Button>
                    )}

                    <div className="flex gap-2">
                      {canAccess(user.role, RbacResource.LOG_SHEETS, 'read') &&
                        isPic && (
                          <Button
                            asChild
                            size="sm"
                            className="flex-1 justify-start gap-2 h-9 text-xs font-medium border-border/60 rounded-lg"
                            variant={
                              logSheetPending > 0 ? 'secondary' : 'outline'
                            }
                          >
                            <Link href={`/log-sheets/${project.id}`}>
                              <FileText className="h-4 w-4" />
                              {logSheetPending > 0 ? (
                                <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                                  {logSheetPending}
                                </span>
                              ) : (
                                'Review Log'
                              )}
                            </Link>
                          </Button>
                        )}

                      {canAccess(
                        user.role,
                        RbacResource.WORK_REPORTS,
                        'read'
                      ) &&
                        isPic && (
                          <Button
                            asChild
                            size="sm"
                            className="flex-1 justify-start gap-2 h-9 text-xs font-medium border-border/60 rounded-lg"
                            variant={
                              workReportPending > 0 ? 'secondary' : 'outline'
                            }
                          >
                            <Link href={`/work-reports/${project.id}`}>
                              <ClipboardList className="h-4 w-4" />
                              {workReportPending > 0 ? (
                                <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                                  {workReportPending}
                                </span>
                              ) : (
                                'Review Lap'
                              )}
                            </Link>
                          </Button>
                        )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/40">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-xs h-8 text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold uppercase tracking-widest transition-all rounded-lg"
                    >
                      <Link href={`/my-projects/${project.id}`}>
                        Masuk Proyek <ArrowRight className="h-3.5 w-3.5" />
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
