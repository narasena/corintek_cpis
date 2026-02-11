'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { toast } from 'sonner';
import { Download, X } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  exportAttendanceCsvAction,
  getAttendanceListAction,
} from '@/features/attendance/actions';
import { getAllUsersAction } from '@/features/users/actions';
import type { TUserResponse } from '@/@types/user.type';
import { columns, type TAttendanceAdminRow } from './components/columns';

function todayLocal() {
  return new Date().toISOString().split('T')[0];
}

export default function AttendanceAdminPage() {
  const [data, setData] = useState<TAttendanceAdminRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState(todayLocal());
  const [dateTo, setDateTo] = useState(todayLocal());
  const [userId, setUserId] = useState('');

  const [technicians, setTechnicians] = useState<TUserResponse[]>([]);

  const [isPending, startTransition] = useTransition();

  const fetchTechnicians = useCallback(async () => {
    const result = await getAllUsersAction();
    if (!result.success || !Array.isArray(result.data)) {
      return;
    }

    const list = (result.data as TUserResponse[]).filter(
      u => u.role === 'TECHNICIAN' || u.role === 'CLIENT_TECHNICIAN'
    );
    setTechnicians(list);
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    const result = await getAttendanceListAction({
      dateFrom,
      dateTo,
      userId: userId || undefined,
    });

    if (result.success && Array.isArray(result.data)) {
      setData(result.data as TAttendanceAdminRow[]);
    } else {
      toast.error('Gagal mengambil data absensi', {
        description: result.error,
      });
      setData([]);
    }
    setLoading(false);
  }, [dateFrom, dateTo, userId]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const canReset = useMemo(() => {
    return userId !== '';
  }, [userId]);

  const resetFilters = () => {
    setUserId('');
  };

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportAttendanceCsvAction({
        dateFrom,
        dateTo,
        userId: userId || undefined,
      });

      if (!result.success || !result.data?.csv) {
        toast.error('Gagal export CSV', { description: result.error });
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
          <Input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full md:w-[180px]"
          />
        </div>
        <div className="w-full md:w-auto">
          <Input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full md:w-[180px]"
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
