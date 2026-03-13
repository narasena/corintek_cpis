import { z } from 'zod';

export const dateLocalSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const attendanceListFiltersSchema = z.object({
  dateFrom: dateLocalSchema,
  dateTo: dateLocalSchema,
  userId: z.string().uuid().optional(),
});

export const paginationInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type TAttendanceListFilters = z.infer<
  typeof attendanceListFiltersSchema
>;

export type TClockInInput = {
  userId: string;
  dateLocal: string;
  clockInAt: Date;
  clockInPhotoUrl: string;
};

export type TClockOutInput = {
  userId: string;
  dateLocal: string;
  clockOutAt: Date;
  clockOutPhotoUrl: string;
};

export type TTechnicianAttendanceStatus = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  attendanceStatus: 'BELUM_ABSEN' | 'SUDAH_ABSEN' | 'SUDAH_PULANG';
  clockInAt: Date | null;
  clockOutAt: Date | null;
  dateLocal: string;
};
