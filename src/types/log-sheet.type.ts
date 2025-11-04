import { LogSheetStatus } from '@/features/api/generated/prisma';
import { ITableHelper } from './base.dto';

// Chemical usage data type
export interface IChemicalUsageData {
  id: string;
  quantity: number;
}

// Parameter value type based on ValueType enum
export type ParameterValue = string | number | boolean | null;

// Default values for parameter groups
export interface IParameterGroupDefaultValues {
  [groupId: string]: {
    [parameterId: string]: ParameterValue;
  };
}

// Log sheet form data structure
export interface ILogSheetFormData {
  date: string; // ISO date string
  notes: string;
  chemicalUsageData: IChemicalUsageData[];
  [groupId: string]: unknown; // Dynamic parameter groups
}

// Parameter member type for dynamic schema
export interface IParameterMember {
  parameter: {
    id: string;
    name: string;
    valueType: string;
    unit?: string | null;
    description?: string | null;
  };
}

// Parameter group for dynamic schema
export interface IParameterGroupForSchema {
  id: string;
  name: string;
  description?: string | null;
  members: IParameterMember[];
}

// Form resolver type
export interface IFormResolver {
  _options: {
    resolver: (
      values: unknown
    ) => Promise<{ values: unknown; errors: Record<string, unknown> }>;
  };
}

// Machine-specific parameter data structure
export interface IMachineParameterData {
  [unitNumber: string]: {
    [parameterId: string]: ParameterValue;
  };
}

// General parameter data structure
export interface IGeneralParameterData {
  [parameterId: string]: ParameterValue;
}

// Complete log sheet data structure for service
export interface ILogSheetServiceData {
  date?: string | Date; // ISO date string or Date object
  notes?: string | null;
  chemicalUsageData?: IChemicalUsageData[];
  [groupId: string]: unknown; // Dynamic parameter groups
}

export interface ILogSheet extends ITableHelper {
  project: {
    name: string;
  };
  date: string;
  logSheetHistories: {
    status: LogSheetStatus;
  }[];
  details: {
    groupInfo: {
      id: string;
      name: string;
    };
    units: {
      unitInfo: {
        id: string;
        unitNumber: number;
      } | null;
      parameters: {
        id: string;
        name: string;
        valueType: string;
        unit?: string | null;
        description?: string | null;
        value: string | number | boolean | null;
      }[];
    }[];
  }[];
}
