import type { ILogSheet, ILogSheetEntry, ILogSheetPhoto } from './types';
import type {
  TLogSheetStatus,
  TLogSheetEntryRole,
  TLogSheetPhotoType,
} from './types';
import type { TValueType } from '@/features/parameters/types';

type TPrismaLogSheetFields = {
  id: string;
  projectId: string;
  date: Date;
  notes: string | null;
  status: string;
  locked?: boolean | null;
  technicianSignatureUrl?: string | null;
  technicianSignedAt?: Date | null;
  technicianSignedByUserId?: string | null;
  clientPicSignatureUrl?: string | null;
  clientPicSignedAt?: Date | null;
  clientPicSignedByUserId?: string | null;
  submittedAt?: Date | null;
  submittedByUserId?: string | null;
  approvedAt?: Date | null;
  approvedByUserId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
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
  technicianSignedBy?: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
  clientPicSignedBy?: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
};

export type TPrismaLogSheet = TPrismaLogSheetFields;

export type TPrismaLogSheetEntry = {
  id: string;
  logSheetId: string;
  parameterId: string;
  machineId: string | null;
  role: string;
  valueType: string;
  numericValue: number | null;
  boolValue: boolean | null;
  textValue: string | null;
  fileUrl: string | null;
  checkedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type TPrismaLogSheetPhoto = {
  id: string;
  logSheetId: string;
  type: string;
  url: string;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export function mapToLogSheet(row: TPrismaLogSheetFields): ILogSheet {
  return {
    id: row.id,
    projectId: row.projectId,
    date: row.date,
    notes: row.notes,
    status: row.status as TLogSheetStatus,
    locked: row.locked ?? false,
    technicianSignatureUrl: row.technicianSignatureUrl ?? null,
    technicianSignedAt: row.technicianSignedAt ?? null,
    technicianSignedByUserId: row.technicianSignedByUserId ?? null,
    clientPicSignatureUrl: row.clientPicSignatureUrl ?? null,
    clientPicSignedAt: row.clientPicSignedAt ?? null,
    clientPicSignedByUserId: row.clientPicSignedByUserId ?? null,
    submittedAt: row.submittedAt ?? null,
    submittedByUserId: row.submittedByUserId ?? null,
    approvedAt: row.approvedAt ?? null,
    approvedByUserId: row.approvedByUserId ?? null,
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
    deletedAt: row.deletedAt ?? null,
    project: row.project,
    replacedBy: row.replacedBy,
    submittedBy: row.submittedBy,
    approvedBy: row.approvedBy,
    technicianSignedBy: row.technicianSignedBy,
    clientPicSignedBy: row.clientPicSignedBy,
  };
}

export function mapToLogSheetEntry(row: TPrismaLogSheetEntry): ILogSheetEntry {
  return {
    id: row.id,
    logSheetId: row.logSheetId,
    parameterId: row.parameterId,
    machineId: row.machineId,
    role: row.role as TLogSheetEntryRole,
    valueType: row.valueType as TValueType,
    numericValue: row.numericValue,
    boolValue: row.boolValue,
    textValue: row.textValue,
    fileUrl: row.fileUrl,
    checkedAt: row.checkedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

export function mapToLogSheetPhoto(row: TPrismaLogSheetPhoto): ILogSheetPhoto {
  return {
    id: row.id,
    logSheetId: row.logSheetId,
    type: row.type as TLogSheetPhotoType,
    url: row.url,
    caption: row.caption,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
