import { z } from 'zod/v4';
import { ValueTypeEnum, type TValueType } from '@/features/parameters/types';

export const LogSheetStatusEnum = z.enum(['DRAFT', 'SUBMITTED', 'APPROVED']);
export type TLogSheetStatus = z.infer<typeof LogSheetStatusEnum>;

export const CreateLogSheetSchema = z.object({
  projectId: z.string().uuid('Project ID tidak valid'),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export const UpdateLogSheetSchema = CreateLogSheetSchema.partial().extend({
  id: z.string().uuid(),
  status: LogSheetStatusEnum.optional(),
});

export type TCreateLogSheet = z.infer<typeof CreateLogSheetSchema>;
export type TUpdateLogSheet = z.infer<typeof UpdateLogSheetSchema>;

export const CreateLogSheetEntrySchema = z
  .object({
    logSheetId: z.string().uuid('Log sheet ID tidak valid'),
    parameterId: z.string().uuid('Parameter ID tidak valid'),
    machineId: z.string().uuid('Machine ID tidak valid').nullable().optional(),
    valueType: ValueTypeEnum,
    numericValue: z.number().nullable().optional(),
    boolValue: z.boolean().nullable().optional(),
    textValue: z.string().nullable().optional(),
    checkedAt: z.coerce.date().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.valueType === 'NUMBER') {
      if (value.numericValue === null || value.numericValue === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['numericValue'],
          message: 'Nilai angka wajib diisi',
        });
      }
      return;
    }

    if (value.valueType === 'BOOLEAN') {
      if (value.boolValue === null || value.boolValue === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['boolValue'],
          message: 'Nilai boolean wajib diisi',
        });
      }
      return;
    }

    if (value.valueType === 'TEXT') {
      if (
        value.textValue === null ||
        value.textValue === undefined ||
        value.textValue.trim() === ''
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['textValue'],
          message: 'Nilai teks wajib diisi',
        });
      }
    }
  });

export const UpdateLogSheetEntrySchema = CreateLogSheetEntrySchema.partial().extend(
  {
    id: z.string().uuid(),
  }
);

export type TCreateLogSheetEntry = z.infer<typeof CreateLogSheetEntrySchema>;
export type TUpdateLogSheetEntry = z.infer<typeof UpdateLogSheetEntrySchema>;

export interface ILogSheet {
  id: string;
  projectId: string;
  date: Date;
  notes: string | null;
  status: TLogSheetStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  project?: { id: string; name: string };
}

export interface ILogSheetEntry {
  id: string;
  logSheetId: string;
  parameterId: string;
  machineId: string | null;
  valueType: TValueType;
  numericValue: number | null;
  boolValue: boolean | null;
  textValue: string | null;
  checkedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
