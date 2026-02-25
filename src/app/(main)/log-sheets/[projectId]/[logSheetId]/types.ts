import type {
  TLogSheetStatus,
  TParameter as TParameterBase,
  TMachine as TMachineBase,
  TEntryState as TEntryStateBase,
} from '@/features/log-sheets/types';
import type { TUserRole } from '@/@types/user.type';

export type TMachine = TMachineBase;
export type TParameter = TParameterBase;

export type TEntryRole = 'VALUE' | 'RAW_WATER' | 'NOTE';

export type TDetail = {
  viewerRole: TUserRole;
  logSheet: {
    id: string;
    projectId: string;
    date: string | Date;
    notes: string | null;
    status: TLogSheetStatus;
    locked: boolean;
    technicianSignatureUrl: string | null;
    technicianSignedAt: string | Date | null;
    technicianSignedByUserId: string | null;
    clientPicSignatureUrl: string | null;
    clientPicSignedAt: string | Date | null;
    clientPicSignedByUserId: string | null;
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
  technicians: Array<{
    id: string;
    firstName: string;
    lastName: string | null;
  }>;
  chemicals: Array<{
    id: string;
    name: string;
    unit: string | null;
  }>;
};

export type TEntryState = TEntryStateBase & {
  pendingFile?: File | null;
};
