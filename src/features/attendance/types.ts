import { z } from 'zod';

export const dateLocalSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const attendanceListFiltersSchema = z.object({
  dateFrom: dateLocalSchema,
  dateTo: dateLocalSchema,
  userId: z.string().uuid().optional(),
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
