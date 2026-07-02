'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useTransition,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { ServerPaginationControls } from '@/components/data-table/pagination-controls';
import { Input } from '@/components/ui/input';
import {
  clockInAction,
  clockOutAction,
  getMyAttendanceHistoryAction,
  getTodayAttendanceAction,
  getTechniciansForSupervisorAction,
} from '@/features/attendance/actions';
import { CameraInput } from '@/components/camera-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { columns, type TAttendanceTechnicianRow } from './components/columns';
import { useSession } from '@/hooks/use-session';
import type {
  TTechnicianAttendanceStatus,
  TSupervisorAttendanceFilter,
  TSupervisorAttendanceResponse,
} from '@/features/attendance/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type TAttendance = {
  id: string;
  dateLocal: string;
  clockInAt: string | Date;
  clockOutAt: string | Date | null;
  clockInPhotoUrl: string;
  clockOutPhotoUrl: string | null;
  totalHours: number | null;
  status: 'OPEN' | 'CLOSED';
};

function getJakartaDateLocal(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function todayJakarta(): string {
  return getJakartaDateLocal(new Date());
}

function formatTime(value: string | Date | null | undefined) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, 'dd MMMM yyyy', { locale: id });
}

function getDefaultDateRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const dateLocal = (d: Date) => d.toISOString().split('T')[0];
  return { dateFrom: dateLocal(firstDay), dateTo: dateLocal(now) };
}

function getStatusBadge(
  status: TTechnicianAttendanceStatus['attendanceStatus']
) {
  const styles = {
    BELUM_ABSEN: 'bg-gray-200 text-gray-900',
    SUDAH_ABSEN: 'bg-green-200 text-green-900',
    SUDAH_PULANG: 'bg-blue-200 text-blue-900',
  };
  const labels = {
    BELUM_ABSEN: 'Belum Absen',
    SUDAH_ABSEN: 'Sudah Absen',
    SUDAH_PULANG: 'Sudah Pulang',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

type TDatePreset = 'today' | '7days' | '30days' | 'custom';

const DATE_PRESETS: { value: TDatePreset; label: string }[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: '30days', label: '30 Hari' },
  { value: 'custom', label: 'Kustom' },
];

function getDateDaysAgo(days: number): string {
  return getJakartaDateLocal(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

function SupervisorAttendanceView() {
  const [technicians, setTechnicians] = useState<TTechnicianAttendanceStatus[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [datePreset, setDatePreset] = useState<TDatePreset>('today');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const today = useMemo(() => todayJakarta(), []);

  const dateFrom = datePreset === 'custom'
    ? customDateFrom || today
    : datePreset === 'today'
      ? today
      : getDateDaysAgo(datePreset === '7days' ? 7 : 30);

  const dateTo = datePreset === 'custom' ? customDateTo || today : today;

  const filtersKey = useMemo(
    () => JSON.stringify({ dateFrom, dateTo, search, projectId }),
    [dateFrom, dateTo, search, projectId]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getTechniciansForSupervisorAction({
      dateFrom,
      dateTo,
      search: search || undefined,
      projectId: projectId || undefined,
      page,
      limit,
    } satisfies TSupervisorAttendanceFilter);
    if (result.success && result.data) {
      const data = result.data as TSupervisorAttendanceResponse;
      setTechnicians(data.technicians);
      setProjects(data.projects);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } else {
      toast.error('Gagal mengambil daftar teknisi', {
        description: (result as any).error,
      });
      setTechnicians([]);
      setTotal(0);
      setTotalPages(0);
    }
    setLoading(false);
  }, [dateFrom, dateTo, search, projectId, page, limit]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Reset to page 1 when filters (search, project, date) change
  useEffect(() => {
    setPage(1);
  }, [filtersKey]);

  const showProjectColumn = projects.some(p => p.name);

  return (
    <div className="space-y-4 md:space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Absensi Teknisi</h1>
        <p className="text-muted-foreground mt-2">
          Pantau absensi teknisi yang bertugas di proyek Anda
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Teknisi</label>
          <Input
            placeholder="Cari teknisi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Proyek</label>
          <Select value={projectId || 'all'} onValueChange={v => setProjectId(v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Semua proyek" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua proyek</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tanggal</label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {DATE_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDatePreset(p.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    datePreset === p.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {datePreset === 'custom' && (
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={customDateFrom}
                  onChange={e => setCustomDateFrom(e.target.value)}
                  className="w-full md:w-[160px]"
                />
                <span className="flex items-center text-sm text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={customDateTo}
                  onChange={e => setCustomDateTo(e.target.value)}
                  className="w-full md:w-[160px]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technician list */}
      {loading ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </div>
      ) : technicians.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            Tidak ada teknisi yang ditemukan
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Teknisi</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                {showProjectColumn && (
                  <th className="px-4 py-3 text-left text-sm font-medium">Proyek</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Jam Masuk</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Jam Pulang</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {technicians.map(tech => (
                <tr key={tech.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {tech.avatarUrl ? (
                        <img
                          src={tech.avatarUrl}
                          alt={tech.firstName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {tech.firstName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">
                        {[tech.firstName, tech.lastName].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {tech.email}
                  </td>
                  {showProjectColumn && (
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {tech.projectNames?.join(', ') || '-'}
                    </td>
                  )}
                  <td className="px-4 py-3">{getStatusBadge(tech.attendanceStatus)}</td>
                  <td className="px-4 py-3 text-sm">{formatTime(tech.clockInAt)}</td>
                  <td className="px-4 py-3 text-sm">{formatTime(tech.clockOutAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <ServerPaginationControls
          total={total}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isLoading={loading}
        />
      )}
    </div>
  );
}

export default function AttendancePage() {
  const { user: actor, isLoading: sessionLoading } = useSession();
  const router = useRouter();

  // Redirect effect — runs after session load to navigate based on role
  useEffect(() => {
    if (sessionLoading) return;

    if (!actor) {
      router.replace('/');
      return;
    }

    if (actor.role === 'ADMIN') {
      router.replace('/attendance/admin');
    } else if (actor.role === 'CLIENT_SUPERVISOR') {
      toast.error('Akses ditolak', {
        description: 'Absensi hanya untuk teknisi internal',
      });
      router.replace('/');
    } else if (actor.role !== 'TECHNICIAN' && actor.role !== 'SUPERVISOR') {
      router.replace('/');
    }
  }, [actor, sessionLoading, router]);

  // --- All hooks must be declared before any conditional returns ---
  const [attendance, setAttendance] = useState<TAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<TAttendanceTechnicianRow[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(getDefaultDateRange().dateFrom);
  const [dateTo, setDateTo] = useState(getDefaultDateRange().dateTo);
  const [clockInPreview, setClockInPreview] = useState<string | null>(null);
  const [clockInFile, setClockInFile] = useState<File | null>(null);
  const [clockOutPreview, setClockOutPreview] = useState<string | null>(null);
  const [clockOutFile, setClockOutFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getTodayAttendanceAction({});
    if (result.success) {
      setAttendance((result.data as TAttendance | null) ?? null);
    } else {
      toast.error('Gagal mengambil absensi hari ini', {
        description: (result as any).error,
      });
      setAttendance(null);
    }
    setLoading(false);
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const result = await getMyAttendanceHistoryAction({
      dateFrom,
      dateTo,
    });
    if (result.success && Array.isArray(result.data)) {
      setHistoryData(result.data as TAttendanceTechnicianRow[]);
    } else {
      setHistoryData([]);
    }
    setHistoryLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const statusLabel = useMemo(() => {
    if (!attendance) return 'Belum Absen Masuk';
    if (attendance.status === 'OPEN') return 'Sudah Absen Masuk';
    return 'Sudah Absen Pulang';
  }, [attendance]);

  const canMarkAttendance = actor?.role === 'TECHNICIAN';
  const canClockIn = canMarkAttendance && !attendance;
  const canClockOut =
    canMarkAttendance && !!attendance && attendance.status === 'OPEN';

  // Guard: show nothing while session loads OR if actor is not allowed
  if (sessionLoading) {
    return null;
  }

  if (!actor || (actor.role !== 'TECHNICIAN' && actor.role !== 'SUPERVISOR')) {
    return null;
  }

  const handleClockIn = () => {
    if (!clockInFile) {
      toast.error('Foto wajib diisi');
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set('photo', clockInFile);
      const result = await clockInAction(fd);
      if (result.success) {
        toast.success('Absen masuk berhasil');
        setClockInPreview(null);
        setClockInFile(null);
        await refresh();
      } else {
        toast.error('Gagal absen masuk', { description: result.error });
      }
    });
  };

  const handleClockOut = () => {
    if (!clockOutFile) {
      toast.error('Foto wajib diisi');
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set('photo', clockOutFile);
      const result = await clockOutAction(fd);
      if (result.success) {
        toast.success('Absen pulang berhasil');
        setClockOutPreview(null);
        setClockOutFile(null);
        await refresh();
      } else {
        toast.error('Gagal absen pulang', { description: result.error });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">Absensi</h3>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Supervisor view: show technician attendance table only
  if (actor.role === 'SUPERVISOR') {
    return <SupervisorAttendanceView />;
  }

  // Technician view: clock-in/out + own history
  return (
    <div className="space-y-4 md:space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Absensi</h1>
        <p className="text-muted-foreground mt-2">{statusLabel}</p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Tanggal</div>
            <div className="font-medium">
              {attendance?.dateLocal ? formatDate(attendance.dateLocal) : '-'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium">{attendance?.status ?? 'NONE'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Jam Masuk</div>
            <div className="font-medium">
              {formatTime(attendance?.clockInAt)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Jam Pulang</div>
            <div className="font-medium">
              {formatTime(attendance?.clockOutAt)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Total Jam</div>
            <div className="font-medium">{attendance?.totalHours ?? '-'}</div>
          </div>
        </div>
      </div>

      {canClockIn ? (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Absen Masuk</div>
          <CameraInput
            value={clockInPreview}
            onChange={(url, file) => {
              setClockInPreview(url);
              setClockInFile(file ?? null);
            }}
            disabled={isPending}
            hideUpload
          />
          <Button onClick={handleClockIn} disabled={isPending || !clockInFile}>
            Absen Masuk
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Foto Absen Masuk</div>
          <div className="flex gap-3 items-start">
            <img
              src={attendance?.clockInPhotoUrl}
              alt="Clock In"
              className="w-32 h-32 object-cover rounded-md border"
            />
          </div>
        </div>
      )}

      {canClockOut ? (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Absen Pulang</div>
          <CameraInput
            value={clockOutPreview}
            onChange={(url, file) => {
              setClockOutPreview(url);
              setClockOutFile(file ?? null);
            }}
            disabled={isPending}
            hideUpload
          />
          <Button
            onClick={handleClockOut}
            disabled={isPending || !clockOutFile}
          >
            Absen Pulang
          </Button>
        </div>
      ) : attendance?.status === 'CLOSED' ? (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Foto Absen Pulang</div>
          <div className="flex gap-3 items-start">
            {attendance.clockOutPhotoUrl ? (
              <img
                src={attendance.clockOutPhotoUrl}
                alt="Clock Out"
                className="w-32 h-32 object-cover rounded-md border"
              />
            ) : (
              <div className="text-sm text-muted-foreground">-</div>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Riwayat Absensi
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
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
        </div>
        {historyLoading ? (
          <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Memuat riwayat...</p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={historyData}
            emptyMessage="Belum ada riwayat absensi."
          />
        )}
      </div>
    </div>
  );
}
