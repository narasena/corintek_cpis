import { makeEntryKey } from '@/features/log-sheets/utils';
import type { TPreviewParameter } from '@/features/log-sheets/types';

export type TValidationParameter = {
  id: string;
  name: string;
  variableName: string;
  category: TPreviewParameter['category'];
  valueType: TPreviewParameter['valueType'];
};

export type TValidationEntryState = {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
};

type TValidationMachine = {
  id: string;
  unitNumber: number;
  type: 'CHILLER' | 'COOLING_TOWER';
};

export type TLogSheetValidationInput = {
  detail: {
    machines: {
      chillers: TValidationMachine[];
      coolingTowers: TValidationMachine[];
    };
  } | null;
  entryState: Record<string, TValidationEntryState>;
  activeChillerIds: string[];
  activeCTIds: string[];
  parametersByCategory: Map<string, TValidationParameter[]>;
};

export type TLogSheetValidationResult = {
  valid: boolean;
  errors: string[];
  missingFields: string[];
};

function isEmpty(
  state: TValidationEntryState | undefined,
  param?: TValidationParameter
) {
  if (!state) return true;
  if (state.fileUrl) return false;
  if (state.valueType === 'TEXT' || param?.valueType === 'TEXT') return false;
  if (state.valueType === 'NUMBER') {
    return state.numericValue === null || state.numericValue === undefined;
  }
  if (state.valueType === 'BOOLEAN') {
    return state.boolValue === null || state.boolValue === undefined;
  }
  return true;
}

function validateChillers(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  const { detail, activeChillerIds, parametersByCategory, entryState } = input;
  const chillers = detail?.machines.chillers ?? [];
  if (chillers.length === 0) return;

  const activeChillers = chillers.filter(m => activeChillerIds.includes(m.id));
  const chillerCats: TValidationParameter['category'][] = [
    'UNIT_CONDENSOR',
    'UNIT_EVAPORATOR',
  ];

  let completeChillerId: string | null = null;
  const missingById = new Map<string, string[]>();

  activeChillers.forEach(machine => {
    const missing: string[] = [];
    chillerCats.forEach(cat => {
      const params = parametersByCategory.get(cat) ?? [];
      params.forEach(param => {
        const key = makeEntryKey(param.id, machine.id, 'VALUE');
        const state = entryState[key];
        if (isEmpty(state, param)) {
          missing.push(`${cat}: ${param.name} (Chiller #${machine.unitNumber})`);
        }
      });
    });
    if (missing.length === 0) {
      completeChillerId = machine.id;
    } else {
      missingById.set(machine.id, missing);
    }
  });

  if (completeChillerId) return;
  if (activeChillers.length === 0) {
    result.errors.push(
      'Minimal satu Chiller harus dipilih dan diisi lengkap.'
    );
    return;
  }

  const firstId = activeChillers[0].id;
  const missing = missingById.get(firstId) ?? [];
  result.missingFields.push(...missing);
  result.errors.push('Minimal satu Chiller harus diisi lengkap.');
}

function validateCoolingTowers(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  const { detail, activeCTIds, parametersByCategory, entryState } = input;
  const towers = detail?.machines.coolingTowers ?? [];
  if (towers.length === 0) return;

  const activeTowers = towers.filter(m => activeCTIds.includes(m.id));
  const ctCats: TValidationParameter['category'][] = [
    'COOLING_WATER_QUALITY',
    'GENERAL_CONDITION',
    'JOB_DESCRIPTION',
  ];

  let completeId: string | null = null;
  const missingById = new Map<string, string[]>();

  activeTowers.forEach(machine => {
    const missing: string[] = [];
    ctCats.forEach(cat => {
      const params = parametersByCategory.get(cat) ?? [];
      params.forEach(param => {
        const key = makeEntryKey(param.id, machine.id, 'VALUE');
        const state = entryState[key];
        if (isEmpty(state, param)) {
          missing.push(
            `${cat}: ${param.name} (Cooling Tower #${machine.unitNumber})`
          );
        }
      });
    });
    if (missing.length === 0) {
      completeId = machine.id;
    } else {
      missingById.set(machine.id, missing);
    }
  });

  if (completeId) return;
  if (activeTowers.length === 0) {
    result.errors.push(
      'Minimal satu Cooling Tower harus dipilih dan diisi lengkap.'
    );
    return;
  }

  const firstId = activeTowers[0].id;
  const missing = missingById.get(firstId) ?? [];
  result.missingFields.push(...missing);
  result.errors.push('Minimal satu Cooling Tower harus diisi lengkap.');
}

function collectRawWaterMissing(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  const params =
    input.parametersByCategory.get('COOLING_WATER_QUALITY') ?? [];
  params.forEach(param => {
    if (param.variableName.toLowerCase().includes('cycle')) return;
    const key = makeEntryKey(param.id, null, 'RAW_WATER');
    if (isEmpty(input.entryState[key], param)) {
      result.missingFields.push(`Raw Water Quality: ${param.name}`);
    }
  });
}

function collectConsumptionMissing(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  const params = input.parametersByCategory.get('CONSUMPTION') ?? [];
  params.forEach(param => {
    const key = makeEntryKey(param.id, null, 'VALUE');
    if (isEmpty(input.entryState[key], param)) {
      result.missingFields.push(`Consumption: ${param.name}`);
    }
  });
}

export function validateLogSheetEntries(
  input: TLogSheetValidationInput
): TLogSheetValidationResult {
  if (!input.detail) {
    return {
      valid: false,
      errors: ['Detail log sheet tidak ditemukan'],
      missingFields: [],
    };
  }

  const result: TLogSheetValidationResult = {
    valid: false,
    errors: [],
    missingFields: [],
  };

  validateChillers(input, result);
  validateCoolingTowers(input, result);
  collectRawWaterMissing(input, result);
  collectConsumptionMissing(input, result);

  if (result.missingFields.length > 0) {
    result.errors.push(`${result.missingFields.length} field wajib belum diisi.`);
  }

  result.valid = result.errors.length === 0;
  return result;
}

