import { z } from 'zod';
import { LabAnalysisColumnKind, ValueType } from '@/generated/prisma/enums';

const ColumnSchema = z.object({
  id: z.string().uuid().optional(),
  tempId: z.string().min(1).optional(),
  name: z.string().min(1, 'Nama kolom wajib diisi'),
  kind: z.nativeEnum(LabAnalysisColumnKind),
  displayOrder: z.number().int().min(0),
});

const EntrySchema = z
  .object({
    parameterId: z.string().uuid(),
    columnId: z.string().uuid().optional(),
    columnTempId: z.string().min(1).optional(),
    valueType: z.nativeEnum(ValueType),
    numericValue: z.number().nullable().optional(),
    boolValue: z.boolean().nullable().optional(),
    textValue: z.string().nullable().optional(),
  })
  .refine(v => !!v.columnId || !!v.columnTempId, {
    message: 'Kolom wajib diisi',
  });

export const CreateLabAnalysisSchema = z.object({
  projectId: z.string().uuid(),
  date: z
    .string()
    .or(z.date())
    .transform(val => new Date(val)),
  attention: z.string().optional().nullable(),
  cc: z.string().optional().nullable(),
  customer: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  faxNumber: z.string().optional().nullable(),
  reportNumber: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  columns: z.array(ColumnSchema).min(1, 'Minimal 1 kolom'),
  entries: z.array(EntrySchema).optional().default([]),
});

export const UpdateLabAnalysisSchema = CreateLabAnalysisSchema.extend({
  id: z.string().uuid(),
});

export type CreateLabAnalysisInput = z.infer<typeof CreateLabAnalysisSchema>;
export type UpdateLabAnalysisInput = z.infer<typeof UpdateLabAnalysisSchema>;

export type LabAnalysisRow = {
  id: string;
  projectId: string;
  date: Date;
  reportNumber: string | null;
  customer: string | null;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
};
