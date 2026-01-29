import { ChemicalType } from '@/features/api/generated/prisma/enums';
import { preprocessBlank } from '@/features/schemas/defaultSchema';
import z from 'zod';

export const chemicalSchema = z.object({
  code: z.string().min(1, 'Kode harus diisi'),
  name: z.string().min(1, 'Nama harus diisi'),
  type: z.enum(ChemicalType),
  description: preprocessBlank(z.string().nullable().optional()),
  unit: preprocessBlank(z.string().nullable().optional()),
});

export type TChemicalAttributes = z.infer<typeof chemicalSchema>;
