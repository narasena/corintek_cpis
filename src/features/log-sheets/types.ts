import { z } from 'zod/v4';
import { ValueTypeEnum, type TValueType } from '@/features/parameters/types';

export const LogSheetStatusEnum = z.enum(['DRAFT', 'SUBMITTED', 'APPROVED']);
export type TLogSheetStatus = z.infer<typeof LogSheetStatusEnum>;

export const LogSheetEntryRoleEnum = z.enum(['VALUE', 'RAW_WATER', 'NOTE']);
export type TLogSheetEntryRole = z.infer<typeof LogSheetEntryRoleEnum>;

export const LogSheetPhotoTypeEnum = z.enum(['BEFORE', 'AFTER']);
export type TLogSheetPhotoType = z.infer<typeof LogSheetPhotoTypeEnum>;

export const CreateLogSheetSchema = z.object({
  projectId: z.string().uuid('Project ID tidak valid'),
  date: z.coerce.date(),
  notes: z.string().optional(),
  replacedByUserId: z.string().uuid().optional().nullable(),
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
    role: LogSheetEntryRoleEnum.default('VALUE'),
    valueType: ValueTypeEnum,
    numericValue: z.number().nullable().optional(),
    boolValue: z.boolean().nullable().optional(),
    textValue: z.string().nullable().optional(),
    fileUrl: z.string().nullable().optional(),
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

export type TCreateLogSheetEntry = z.infer<typeof CreateLogSheetEntrySchema>;

export const LogSheetPhotoSchema = z.object({
  id: z.string().uuid().optional(),
  type: LogSheetPhotoTypeEnum,
  url: z.string().url(),
  caption: z.string().nullable().optional(),
});

export interface ILogSheet {
  id: string;
  projectId: string;
  date: Date;
  notes: string | null;
  status: TLogSheetStatus;
  submittedAt: Date | null;
  submittedByUserId: string | null;
  approvedAt: Date | null;
  approvedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  project?: { id: string; name: string };
  replacedBy?: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
}

export interface ILogSheetEntry {
  id: string;
  logSheetId: string;
  parameterId: string;
  machineId: string | null;
  role: TLogSheetEntryRole;
  valueType: TValueType;
  numericValue: number | null;
  boolValue: boolean | null;
  textValue: string | null;
  fileUrl: string | null;
  checkedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ILogSheetPhoto {
  id: string;
  logSheetId: string;
  type: TLogSheetPhotoType;
  url: string;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TPreviewParameter = {
  id: string;
  name: string;
  variableName: string;
  category:
    | 'UNIT_CONDENSOR'
    | 'UNIT_EVAPORATOR'
    | 'COOLING_WATER_QUALITY'
    | 'GENERAL_CONDITION'
    | 'JOB_DESCRIPTION'
    | 'CONSUMPTION';
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue?: number | null;
  rawWaterMaxValue?: number | null;
  displayOrder: number;
};

export type TPreviewMachine = {
  id: string;
  unitNumber: number;
  type: 'CHILLER' | 'COOLING_TOWER';
};

export type TLogSheetPhoto = {
  id: string;
  type: 'BEFORE' | 'AFTER';
  url: string;
  caption: string | null;
};

export type TEntryState = {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
};
