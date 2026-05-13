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
  // TEXT parameters are always considered complete (optional)
  if (param?.valueType === 'TEXT') return false;
  if (!state) return true;
  if (state.fileUrl) return false;
  if (state.valueType === 'TEXT') return false;
  return isEntryValueEmpty(state);
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
  categories: readonly TValidationParameter['category'][];
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

function collectRawWaterMissing(
  input: TLogSheetValidationInput,
  result: TLogSheetValidationResult
) {
  if (input.activeCTIds.length === 0) return;

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

  // Helper: completeness predicate (true if entry is complete)
  const isComplete = (state: TValidationEntryState | undefined, param?: TValidationParameter) => !isEmpty(state, param);

  // Build parameter lists for each machine type
  const chillerParams = CHILLER_CATEGORIES.flatMap(
    cat => input.parametersByCategory.get(cat) ?? []
  );
  const ctParams = CT_CATEGORIES.flatMap(
    cat => input.parametersByCategory.get(cat) ?? []
  );

  const chillerResult = validateCategoryEntries({
    parameters: chillerParams,
    machines: input.detail.machines.chillers,
    activeMachineIds: input.activeChillerIds,
    entryState: input.entryState,
    categories: CHILLER_CATEGORIES,
    machineTypeLabel: 'Chiller',
    isComplete,
  });

  const ctResult = validateCategoryEntries({
    parameters: ctParams,
    machines: input.detail.machines.coolingTowers,
    activeMachineIds: input.activeCTIds,
    entryState: input.entryState,
    categories: CT_CATEGORIES,
    machineTypeLabel: 'Cooling Tower',
    isComplete,
  });

   const hasAnyActiveMachine =
     input.activeChillerIds.length > 0 || input.activeCTIds.length > 0;
   const anyCompleteMachine =
     !!chillerResult.completeMachineId || !!ctResult.completeMachineId;

   // If no machine is complete, add missing fields from both types
   if (hasAnyActiveMachine && !anyCompleteMachine) {
     result.missingFields.push(...chillerResult.allMissing, ...ctResult.allMissing);
   }

   if (!hasAnyActiveMachine) {
     result.errors.push('Minimal satu unit harus dipilih dan diisi.');
   }

   // Raw water required only if CT is active AND no complete chiller (i.e., CT is the only hope)
   if (input.activeCTIds.length > 0 && !chillerResult.completeMachineId) {
     collectRawWaterMissing(input, result);
   }

   collectConsumptionMissing(input, result);

  if (result.missingFields.length > 0) {
    result.errors.push(
      `${result.missingFields.length} field wajib belum diisi.`
    );
  }

   result.valid = result.errors.length === 0;
   return result;
 }

export function hasCompleteMachine(input: TLogSheetValidationInput): boolean {
  if (!input.detail) return false;

  const isComplete = (state: TValidationEntryState | undefined, param?: TValidationParameter) => !isEmpty(state, param);

  const chillerParams = CHILLER_CATEGORIES.flatMap(cat => input.parametersByCategory.get(cat) ?? []);
  const ctParams = CT_CATEGORIES.flatMap(cat => input.parametersByCategory.get(cat) ?? []);

  const chillerResult = validateCategoryEntries({
    parameters: chillerParams,
    machines: input.detail.machines.chillers,
    activeMachineIds: input.activeChillerIds,
    entryState: input.entryState,
    categories: CHILLER_CATEGORIES,
    machineTypeLabel: 'Chiller',
    isComplete,
  });

  const ctResult = validateCategoryEntries({
    parameters: ctParams,
    machines: input.detail.machines.coolingTowers,
    activeMachineIds: input.activeCTIds,
    entryState: input.entryState,
    categories: CT_CATEGORIES,
    machineTypeLabel: 'Cooling Tower',
    isComplete,
  });

  return !!chillerResult.completeMachineId || !!ctResult.completeMachineId;
}
