import { preprocessBlank } from '@/features/schemas/defaultSchema';
import { z } from 'zod';

export const standardMethodSchema = z.object({
  methodName: z.string().min(1, 'Nama metode harus diisi'),
  year: z
    .number()
    .min(1900, 'Tahun tidak valid')
    .max(new Date().getFullYear() + 10, 'Tahun tidak valid'),
  version: z.string().min(1, 'Versi harus diisi'),
  isActive: z.boolean(),
  description: preprocessBlank(z.string().nullable().optional()),
});
