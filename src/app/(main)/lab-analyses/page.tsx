'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { getProjectsAction } from '@/features/projects/actions';
import type { IProject } from '@/features/projects/types';
import { getLabAnalysisProjectColumns } from './components/project-columns';

export default function LabAnalysesPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProjectsAction();
      if (result.success && result.data) {
        setProjects(result.data as IProject[]);
      } else {
        toast.error('Gagal mengambil data proyek');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => getLabAnalysisProjectColumns(), []);

  return (
    <div className="space-y-4 md:space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lab Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Pilih proyek untuk mengelola lab analysis.
        </p>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          emptyMessage="Belum ada data proyek."
          searchConfig={{ enableUrlSync: true, urlParamName: 'q' }}
        />
      )}
    </div>
  );
}
