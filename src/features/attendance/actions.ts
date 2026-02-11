'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { attendanceListFiltersSchema } from './types';
import * as service from './service';

type TActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

function toUserError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message.includes('Cannot read properties')) return fallback;
    return error.message;
  }
  return fallback;
}

function getJakartaDateLocal(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

async function uploadAttendancePhoto(
  file: File,
  userId: string,
  dateLocal: string,
  kind: 'clock-in' | 'clock-out'
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workerUrl = process.env.R2_WORKER_URL;
  const authSecret = process.env.R2_AUTH_SECRET;

  if (!workerUrl || !authSecret) {
    throw new Error('Server configuration error: Missing R2 credentials');
  }

  const sanitizedName = (file.name || 'photo').replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `attendance/${userId}/${dateLocal}/${kind}_${Date.now()}_${sanitizedName}`;

  const response = await fetch(`${workerUrl}/${key}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authSecret}`,
      'Content-Type': file.type,
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[CPIS-ERROR] Attendance.Upload:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return `${workerUrl}/${key}`;
}

export async function getTodayAttendanceAction(): Promise<TActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const dateLocal = getJakartaDateLocal(new Date());
    const data = await service.getTodayAttendance(user.id, dateLocal);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] Attendance.GetToday:', error);
    return {
      success: false,
      error:
        toUserError(error, 'Terjadi kesalahan server. Coba muat ulang halaman.'),
    };
  }
}

export async function clockInAction(
  formData: FormData
): Promise<TActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const photo = formData.get('photo') as File | null;
    if (!photo || !photo.size) throw new Error('Foto wajib diisi');

    const now = new Date();
    const dateLocal = getJakartaDateLocal(now);
    const photoUrl = await uploadAttendancePhoto(
      photo,
      user.id,
      dateLocal,
      'clock-in'
    );

    const data = await service.createClockIn({
      userId: user.id,
      dateLocal,
      clockInAt: now,
      clockInPhotoUrl: photoUrl,
    });

    revalidatePath('/attendance');
    revalidatePath('/attendance/admin');

    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] Attendance.ClockIn:', error);
    return {
      success: false,
      error: toUserError(error, 'Gagal absen masuk'),
    };
  }
}

export async function clockOutAction(
  formData: FormData
): Promise<TActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const photo = formData.get('photo') as File | null;
    if (!photo || !photo.size) throw new Error('Foto wajib diisi');

    const now = new Date();
    const dateLocal = getJakartaDateLocal(now);
    const photoUrl = await uploadAttendancePhoto(
      photo,
      user.id,
      dateLocal,
      'clock-out'
    );

    const data = await service.createClockOut({
      userId: user.id,
      dateLocal,
      clockOutAt: now,
      clockOutPhotoUrl: photoUrl,
    });

    revalidatePath('/attendance');
    revalidatePath('/attendance/admin');

    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] Attendance.ClockOut:', error);
    return {
      success: false,
      error: toUserError(error, 'Gagal absen pulang'),
    };
  }
}

export async function getAttendanceListAction(
  filters: unknown
): Promise<TActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = attendanceListFiltersSchema.safeParse(filters);
  if (!parsed.success) return { success: false, error: 'Filter tidak valid' };

  try {
    const data = await service.listAttendance(user, parsed.data);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] Attendance.List:', error);
    return {
      success: false,
      error:
        toUserError(error, 'Gagal mengambil daftar absensi'),
    };
  }
}

export async function exportAttendanceCsvAction(
  filters: unknown
): Promise<TActionResponse<{ csv: string }>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = attendanceListFiltersSchema.safeParse(filters);
  if (!parsed.success) return { success: false, error: 'Filter tidak valid' };

  try {
    const csv = await service.exportAttendanceCsv(user, parsed.data);
    return { success: true, data: { csv } };
  } catch (error) {
    console.error('[CPIS-ERROR] Attendance.ExportCsv:', error);
    return {
      success: false,
      error: toUserError(error, 'Gagal export CSV'),
    };
  }
}
