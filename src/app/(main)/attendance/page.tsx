'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { toast } from 'sonner';

import {
  clockInAction,
  clockOutAction,
  getTodayAttendanceAction,
} from '@/features/attendance/actions';
import { CameraInput } from '@/components/camera-input';
import { Button } from '@/components/ui/button';

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

function formatTime(value: string | Date | null | undefined) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<TAttendance | null>(null);
  const [loading, setLoading] = useState(true);

  const [clockInPreview, setClockInPreview] = useState<string | null>(null);
  const [clockInFile, setClockInFile] = useState<File | null>(null);

  const [clockOutPreview, setClockOutPreview] = useState<string | null>(null);
  const [clockOutFile, setClockOutFile] = useState<File | null>(null);

  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getTodayAttendanceAction();
    if (result.success) {
      setAttendance((result.data as TAttendance | null) ?? null);
    } else {
      toast.error('Gagal mengambil absensi hari ini', {
        description: result.error,
      });
      setAttendance(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const statusLabel = useMemo(() => {
    if (!attendance) return 'Belum Absen Masuk';
    if (attendance.status === 'OPEN') return 'Sudah Absen Masuk';
    return 'Sudah Absen Pulang';
  }, [attendance]);

  const canClockIn = !attendance;
  const canClockOut = !!attendance && attendance.status === 'OPEN';

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
            <div className="font-medium">{attendance?.dateLocal ?? '-'}</div>
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
    </div>
  );
}
