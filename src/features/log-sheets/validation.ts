import { makeEntryKey, isEntryValueEmpty } from '@/features/log-sheets/utils';
import type { TParameter } from '@/features/log-sheets/types';
import {
  CHILLER_CATEGORIES,
  CT_CATEGORIES,
} from './components/log-sheet-preview/category-helpers';

export type TValidationParameter = {
  id: string;
  name: string;
  variableName: string;
  category: TParameter['category'];
  valueType: TParameter['valueType'];
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
  return isEntryValueEmpty(state);
}

type TMachineCategoryValidatorParams = {
  machines: TValidationMachine[];
  activeIds: string[];
  categories: TValidationParameter['category'][];
  machineTypeLabel: string;
  input: TLogSheetValidationInput;
  result: TLogSheetValidationResult;
};

function validateMachineCategory(params: TMachineCategoryValidatorParams) {
  const { machines, activeIds, categories, machineTypeLabel, input, result } =
    params;
  if (machines.length === 0) return;

  const active = machines.filter(m => activeIds.includes(m.id));

  let completeId: string | null = null;
  const missingById = new Map<string, string[]>();

  active.forEach(machine => {
    const missing: string[] = [];
    categories.forEach(cat => {
      const catParams = input.parametersByCategory.get(cat) ?? [];
      catParams.forEach(param => {
        const key = makeEntryKey(param.id, machine.id, 'VALUE');
        const state = input.entryState[key];
        if (isEmpty(state, param)) {
          missing.push(
            `${cat}: ${param.name} (${machineTypeLabel} #${machine.unitNumber})`
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
  if (active.length === 0) {
    result.errors.push(
      `Minimal satu ${machineTypeLabel} harus dipilih dan diisi lengkap.`
    );
    return;
  }

  const firstId = active[0].id;
  const missing = missingById.get(firstId) ?? [];
  result.missingFields.push(...missing);
  result.errors.push(`Minimal satu ${machineTypeLabel} harus diisi lengkap.`);
}

function validateChillers(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  validateMachineCategory({
    machines: input.detail?.machines.chillers ?? [],
    activeIds: input.activeChillerIds,
    categories: [...CHILLER_CATEGORIES],
    machineTypeLabel: 'Chiller',
    input,
    result,
  });
}

function validateCoolingTowers(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  validateMachineCategory({
    machines: input.detail?.machines.coolingTowers ?? [],
    activeIds: input.activeCTIds,
    categories: [...CT_CATEGORIES],
    machineTypeLabel: 'Cooling Tower',
    input,
    result,
  });
}

function collectRawWaterMissing(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  const params = input.parametersByCategory.get('COOLING_WATER_QUALITY') ?? [];
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
    // Skip auto-calculated "Total Consumption" (derived from After - Before)
    if (param.name.toLowerCase().includes('total')) return;
    const key = makeEntryKey(param.id, null, 'VALUE');
    if (isEmpty(input.entryState[key], param)) {
      result.missingFields.push(`Consumption: ${param.name}`);
    }
  });
}

export type TCompletenessChecker = (
  state: TValidationEntryState | undefined,
  param?: TValidationParameter
) => boolean;

export type TCategoryValidationResult = {
  missingByMachine: Map<string, string[]>;
  completeMachineId: string | null;
  allMissing: string[];
};

export function validateCategoryEntries(params: {
  parameters: TValidationParameter[];
  machines: TValidationMachine[];
  activeMachineIds: string[];
  entryState: Record<string, TValidationEntryState>;
  categories: TValidationParameter['category'][];
  machineTypeLabel: string;
  isComplete: TCompletenessChecker;
  role?: 'VALUE' | 'RAW_WATER' | 'NOTE';
}): TCategoryValidationResult {
  const {
    parameters,
    machines,
    activeMachineIds,
    entryState,
    categories,
    machineTypeLabel,
    isComplete,
    role = 'VALUE',
  } = params;

  const active = machines.filter(m => activeMachineIds.includes(m.id));
  const missingByMachine = new Map<string, string[]>();
  let completeMachineId: string | null = null;
  const allMissing: string[] = [];

  for (const machine of active) {
    const missing: string[] = [];

    for (const category of categories) {
      const catParams = parameters.filter(p => p.category === category);
      for (const param of catParams) {
        const key = makeEntryKey(param.id, machine.id, role);
        const state = entryState[key];
        if (!isComplete(state, param)) {
          missing.push(
            `${category}: ${param.name} (${machineTypeLabel} #${machine.unitNumber})`
          );
        }
      }
    }

    if (missing.length === 0) {
      completeMachineId = machine.id;
    } else {
      missingByMachine.set(machine.id, missing);
      allMissing.push(...missing);
    }
  }

  return { missingByMachine, completeMachineId, allMissing };
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
    result.errors.push(
      `${result.missingFields.length} field wajib belum diisi.`
    );
  }

  result.valid = result.errors.length === 0;
  return result;
}
