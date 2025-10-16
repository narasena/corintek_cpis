import z from 'zod';

export const logSheetSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  description: z.string().nullable().optional(),
});
