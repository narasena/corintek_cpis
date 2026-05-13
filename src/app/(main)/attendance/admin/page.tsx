'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Download, X } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  exportAttendanceCsvAction,
  getAttendanceListAction,
} from '@/features/attendance/actions';
import { getAllUsersAction } from '@/features/users/actions';
import { getProjectsAction } from '@/features/projects/actions';
import { useSession } from '@/hooks/use-session';
import type { TUserResponse } from '@/@types/user.type';
import { columns, type TAttendanceAdminRow } from './components/columns';

type TProjectOption = { id: string; name: string };

function getJakartaDateLocal(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function todayJakarta(): Date {
  const now = new Date();
  const jakartaDateStr = getJakartaDateLocal(now);
  return new Date(jakartaDateStr);
}

export default function AttendanceAdminPage() {
  const { user: actor, isLoading } = useSession();
  const router = useRouter();

  // Initialize all state hooks BEFORE any conditional returns
  const [data, setData] = useState<TAttendanceAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(todayJakarta());
  const [dateTo, setDateTo] = useState<Date>(todayJakarta());
  const [userId, setUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [technicians, setTechnicians] = useState<TUserResponse[]>([]);
  const [projects, setProjects] = useState<TProjectOption[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchTechnicians = useCallback(async () => {
    const result = await getAllUsersAction({});
    if (!result.success || !Array.isArray(result.data)) {
      return;
    }

    const list = (result.data as TUserResponse[]).filter(
      u => u.role === 'TECHNICIAN' || u.role === 'CLIENT_TECHNICIAN'
    );
    setTechnicians(list);
  }, []);

  const fetchProjects = useCallback(async () => {
    const result = await getProjectsAction({});
    if (!result.success || !Array.isArray(result.data)) {
      return;
    }
    const mapped = (
      result.data as unknown as Array<{ id: string; name: string }>
    ).map(p => ({
      id: p.id,
      name: p.name,
    }));
    setProjects(mapped);
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    const result = await getAttendanceListAction({
      dateFrom: getJakartaDateLocal(dateFrom),
      dateTo: getJakartaDateLocal(dateTo),
      userId: userId || undefined,
      projectId: projectId || undefined,
    });

    if (!result.success) {
      toast.error('Gagal mengambil data absensi', {
        description: (result as any).error,
      });
      setData([]);
    } else if (Array.isArray(result.data)) {
      setData(result.data as TAttendanceAdminRow[]);
    }
    setLoading(false);
  }, [dateFrom, dateTo, userId, projectId]);

  useEffect(() => {
    if (isLoading) return;
    fetchTechnicians();
    fetchProjects();
  }, [fetchTechnicians, fetchProjects, isLoading]);

  useEffect(() => {
    if (isLoading || !actor) return;
    fetchAttendance();
  }, [fetchAttendance, actor, isLoading]);

  const canReset = useMemo(() => {
    return userId !== '' || projectId !== '';
  }, [userId, projectId]);

  const resetFilters = () => {
    setUserId('');
    setProjectId('');
  };

  // Admin-only guard — placed after all hooks to respect Rules of Hooks
  if (!isLoading && (!actor || actor.role !== 'ADMIN')) {
    router.replace('/');
    toast.error('Akses ditolak');
    return null;
  }

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportAttendanceCsvAction({
        dateFrom: getJakartaDateLocal(dateFrom),
        dateTo: getJakartaDateLocal(dateTo),
        userId: userId || undefined,
        projectId: projectId || undefined,
      });

      if (!result.success) {
        toast.error('Gagal export CSV', { description: result.error });
        return;
      }

      if (!result.data.csv) {
        toast.error('Gagal export CSV', { description: 'Data tidak tersedia' });
        return;
      }

      const withBom = `\ufeff${result.data.csv}`;
      const blob = new Blob([withBom], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${dateFrom}_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      toast.success('CSV berhasil diunduh');
    });
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Absensi (Admin)</h1>
          <p className="text-muted-foreground mt-2">
            Pantau absensi teknisi dan export CSV.
          </p>
        </div>
        <Button onClick={handleExport} disabled={isPending || loading}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="w-full md:w-auto">
          <DatePicker
            value={dateFrom}
            onChange={date => date && setDateFrom(date)}
            placeholder="Pilih tanggal mulai"
          />
        </div>
        <div className="w-full md:w-auto">
          <DatePicker
            value={dateTo}
            onChange={date => date && setDateTo(date)}
            placeholder="Pilih tanggal akhir"
          />
        </div>
        <div className="w-full md:w-[320px]">
          <select
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Semua Teknisi</option>
            {technicians.map(u => (
              <option key={u.id} value={u.id}>
                {[u.firstName, u.lastName].filter(Boolean).join(' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-[320px]">
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Semua Proyek</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {canReset && (
          <Button variant="ghost" onClick={resetFilters} className="h-10 px-3">
            <X className="mr-2 h-4 w-4" />
            Reset Filter
          </Button>
        )}
      </div>

      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          emptyMessage="Belum ada data absensi."
        />
      )}
    </div>
  );
}
