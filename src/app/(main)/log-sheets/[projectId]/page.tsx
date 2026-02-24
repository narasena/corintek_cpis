'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getProjectsAction } from '@/features/projects/actions';
import type { IProject } from '@/features/projects/types';
import {
  deleteLogSheetAction,
  getLogSheetsByProjectAction,
} from '@/features/log-sheets/actions';
import { getLogSheetColumns, type TLogSheetRow } from './components/columns';
import { LogSheetDialog } from '@/features/log-sheets/components/log-sheet-dialog';

export default function ProjectLogSheetsPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const [project, setProject] = useState<IProject | null>(null);
  const [logSheets, setLogSheets] = useState<TLogSheetRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [projectsRes, logSheetsRes] = await Promise.all([
      getProjectsAction(),
      getLogSheetsByProjectAction(projectId),
    ]);

    if (projectsRes.success && projectsRes.data) {
      const p = (projectsRes.data as IProject[]).find(x => x.id === projectId);
      setProject(p ?? null);
    }

    if (logSheetsRes.success && logSheetsRes.data) {
      setLogSheets(logSheetsRes.data as TLogSheetRow[]);
    }
  }, [projectId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await refresh();
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    const result = await deleteLogSheetAction(id);
    if (result.success) {
      await refresh();
    }
    return result;
  };

  const columns = useMemo(
    () =>
      getLogSheetColumns({
        onOpen: logSheetId =>
          router.push(`/log-sheets/${projectId}/${logSheetId}`),
        onDelete: handleDelete,
      }),
    [projectId, router] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Sheet</h1>
          <p className="text-muted-foreground mt-2">
            {project
              ? `Proyek: ${project.name}`
              : 'Kelola log sheet per proyek.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/my-projects/${projectId}`}>Kembali ke Proyek</Link>
          </Button>
          <LogSheetDialog
            projectId={projectId}
            onCreated={logSheetId =>
              router.push(`/log-sheets/${projectId}/${logSheetId}`)
            }
            onSuccess={() => refresh()}
            trigger={
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Tambah Log Sheet
              </Button>
            }
          />
        </div>
      </div>

      {loading && logSheets.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logSheets}
          emptyMessage="Belum ada log sheet untuk proyek ini."
        />
      )}
    </div>
  );
}
