import { useCallback } from 'react';

import { makeEntryKey } from '@/features/log-sheets/utils';
import type { TDetail, TEntryState, TParameter } from '../types';

export function useLogSheetValidation(args: {
  detail: TDetail | null;
  entryState: Record<string, TEntryState>;
  activeChillerIds: string[];
  activeCTIds: string[];
  parametersByCategory: Map<string, TParameter[]>;
  machinesForCategory: (category: TParameter['category']) => {
    machines: Array<{
      id: string;
      unitNumber: number;
      type: 'CHILLER' | 'COOLING_TOWER';
    }>;
    label: string;
  };
}) {
  const {
    detail,
    entryState,
    activeChillerIds,
    activeCTIds,
    parametersByCategory,
    machinesForCategory,
  } = args;

  const validateEntries = useCallback(() => {
    if (!detail) {
      return {
        valid: false,
        errors: ['Detail log sheet tidak ditemukan'],
        missingFields: [],
      };
    }

    const errors: string[] = [];
    const missingFields: string[] = [];

    const isEmpty = (state: TEntryState | undefined, param?: TParameter) => {
      if (!state) return true;
      if (state.fileUrl) return false;

      // TEXT parameters (like notes) are optional
      if (state.valueType === 'TEXT' || param?.valueType === 'TEXT') {
        return false;
      }

      if (state.valueType === 'NUMBER') {
        return state.numericValue === null || state.numericValue === undefined;
      }
      if (state.valueType === 'BOOLEAN') {
        return state.boolValue === null || state.boolValue === undefined;
      }
      return true;
    };

    // 1. Chiller Validation (At least one complete chiller if any exist)
    if (detail.machines.chillers.length > 0) {
      const activeChillers = detail.machines.chillers.filter(m =>
        activeChillerIds.includes(m.id)
      );
      const chillerCats: TParameter['category'][] = [
        'UNIT_CONDENSOR',
        'UNIT_EVAPORATOR',
      ];

      let completeChillerId: string | null = null;
      const chillerMissingMap = new Map<string, string[]>();

      activeChillers.forEach(m => {
        const missing: string[] = [];
        chillerCats.forEach(cat => {
          const params = parametersByCategory.get(cat) ?? [];
          params.forEach(param => {
            const key = makeEntryKey(param.id, m.id, 'VALUE');
            const state = entryState[key];
            if (isEmpty(state, param)) {
              missing.push(`${cat}: ${param.name} (Chiller #${m.unitNumber})`);
            }
          });
        });

        if (missing.length === 0) {
          completeChillerId = m.id;
        } else {
          chillerMissingMap.set(m.id, missing);
          // DEBUG
          console.log(`[CPIS-VALIDATION] Chiller #${m.unitNumber} missing:`, missing);
        }
      });

      if (!completeChillerId) {
        if (activeChillers.length === 0) {
          errors.push('Minimal satu Chiller harus dipilih dan diisi lengkap.');
        } else {
          // If none are complete, show missing fields for the first active chiller
          const firstId = activeChillers[0].id;
          const missing = chillerMissingMap.get(firstId) ?? [];
          missingFields.push(...missing);
          errors.push('Minimal satu Chiller harus diisi lengkap.');
        }
      }
    }

    // 2. Cooling Tower Validation (At least one complete CT if any exist)
    if (detail.machines.coolingTowers.length > 0) {
      const activeCTs = detail.machines.coolingTowers.filter(m =>
        activeCTIds.includes(m.id)
      );
      const ctCats: TParameter['category'][] = [
        'COOLING_WATER_QUALITY',
        'GENERAL_CONDITION',
        'JOB_DESCRIPTION',
      ];

      let completeCTId: string | null = null;
      const ctMissingMap = new Map<string, string[]>();

      activeCTs.forEach(m => {
        const missing: string[] = [];
        ctCats.forEach(cat => {
          const params = parametersByCategory.get(cat) ?? [];
          params.forEach(param => {
            const key = makeEntryKey(param.id, m.id, 'VALUE');
            const state = entryState[key];
            if (isEmpty(state, param)) {
              missing.push(
                `${cat}: ${param.name} (Cooling Tower #${m.unitNumber})`
              );
            }
          });
        });

        if (missing.length === 0) {
          completeCTId = m.id;
        } else {
          ctMissingMap.set(m.id, missing);
          // DEBUG
          console.log(`[CPIS-VALIDATION] CT #${m.unitNumber} missing:`, missing);
        }
      });

      if (!completeCTId) {
        if (activeCTs.length === 0) {
          errors.push(
            'Minimal satu Cooling Tower harus dipilih dan diisi lengkap.'
          );
        } else {
          // If none are complete, show missing fields for the first active CT
          const firstId = activeCTs[0].id;
          const missing = ctMissingMap.get(firstId) ?? [];
          missingFields.push(...missing);
          errors.push('Minimal satu Cooling Tower harus diisi lengkap.');
        }
      }
    }

    // 3. Global Quality (Raw Water)
    const cwqParams = parametersByCategory.get('COOLING_WATER_QUALITY') ?? [];
    cwqParams.forEach(param => {
      // Skip Cycle for Raw Water as it's a ratio/COC
      if (param.variableName.toLowerCase().includes('cycle')) return;

      const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
      if (isEmpty(entryState[rawKey], param)) {
        missingFields.push(`Raw Water Quality: ${param.name}`);
      }
    });

    // 4. Consumption
    const consumptionParams = parametersByCategory.get('CONSUMPTION') ?? [];
    consumptionParams.forEach(param => {
      const key = makeEntryKey(param.id, null, 'VALUE');
      if (isEmpty(entryState[key], param)) {
        missingFields.push(`Consumption: ${param.name}`);
      }
    });

    if (missingFields.length > 0) {
      errors.push(`${missingFields.length} field wajib belum diisi.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      missingFields,
    };
  }, [
    detail,
    entryState,
    activeChillerIds,
    activeCTIds,
    machinesForCategory,
    parametersByCategory,
  ]);

  return { validateEntries };
}
