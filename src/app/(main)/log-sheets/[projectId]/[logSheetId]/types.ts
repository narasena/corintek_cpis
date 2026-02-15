import type { TLogSheetStatus } from '@/features/log-sheets/types';
import type { TUserRole } from '@/@types/user.type';

export type TMachine = {
  id: string;
  unitNumber: number;
  type: 'CHILLER' | 'COOLING_TOWER';
};

export type TEntryRole = 'VALUE' | 'RAW_WATER' | 'NOTE';

export type TParameter = {
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

export type TDetail = {
  viewerRole: TUserRole;
  logSheet: {
    id: string;
    projectId: string;
    date: string | Date;
    notes: string | null;
    status: TLogSheetStatus;
    submittedAt: string | Date | null;
    submittedByUserId: string | null;
    approvedAt: string | Date | null;
    approvedByUserId: string | null;
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
  };
  project: {
    id: string;
    name: string;
    clientName: string | null;
    assignments?: Array<{
      role: 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC';
      user: { id: string; firstName: string; lastName: string | null };
    }>;
  };
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] };
  parameters: TParameter[];
  entries: Array<{
    parameterId: string;
    machineId: string | null;
    role: TEntryRole;
    valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
    numericValue: number | null;
    boolValue: boolean | null;
    textValue: string | null;
    fileUrl: string | null;
  }>;
  photos: Array<{
    id: string;
    type: 'BEFORE' | 'AFTER';
    url: string;
    caption: string | null;
  }>;
  chemicalUsages: Array<{
    id: string;
    chemicalId: string;
    amount: number;
    chemicalName: string;
    chemicalUnit: string;
  }>;
  activeMachineIds: {
    chillers: string[];
    coolingTowers: string[];
  };
};

export type TEntryState = {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
  pendingFile?: File | null;
};
