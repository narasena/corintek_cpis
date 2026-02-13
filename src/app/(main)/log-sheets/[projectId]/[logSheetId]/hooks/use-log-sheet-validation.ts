import { useCallback } from 'react';

import { makeEntryKey } from '@/features/log-sheets/utils';
import type { TDetail, TEntryState, TParameter } from '../types';

export function useLogSheetValidation(args: {
  detail: TDetail | null;
  entryState: Record<string, TEntryState>;
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

    const unitCategories: TParameter['category'][] = [
      'UNIT_CONDENSOR',
      'UNIT_EVAPORATOR',
      'GENERAL_CONDITION',
      'JOB_DESCRIPTION',
    ];

    unitCategories.forEach(cat => {
      const params = parametersByCategory.get(cat) ?? [];
      const { machines, label } = machinesForCategory(cat);

      params.forEach(param => {
        machines.forEach(m => {
          const key = makeEntryKey(param.id, m.id, 'VALUE');
          const state = entryState[key];
          const isEmpty =
            state?.numericValue === null ||
            state?.numericValue === undefined ||
            state?.boolValue === null ||
            state?.boolValue === undefined ||
            (state?.valueType === 'TEXT' && !state?.textValue?.trim());

          if (isEmpty) {
            missingFields.push(
              `${cat}: ${param.name} (${label} #${m.unitNumber})`
            );
          }
        });
      });
    });

    const cwqParams = parametersByCategory.get('COOLING_WATER_QUALITY') ?? [];
    const activeCTs = detail.machines.coolingTowers.filter(m =>
      activeCTIds.includes(m.id)
    );

    cwqParams.forEach(param => {
      activeCTs.forEach(m => {
        const key = makeEntryKey(param.id, m.id, 'VALUE');
        const state = entryState[key];
        if (state?.numericValue === null || state?.numericValue === undefined) {
          missingFields.push(
            `Cooling Water Quality: ${param.name} (CT #${m.unitNumber})`
          );
        }
      });

      const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
      const rawState = entryState[rawKey];
      if (
        rawState?.numericValue === null ||
        rawState?.numericValue === undefined
      ) {
        missingFields.push(`Raw Water Quality: ${param.name}`);
      }
    });

    const consumptionParams = parametersByCategory.get('CONSUMPTION') ?? [];
    consumptionParams.forEach(param => {
      const key = makeEntryKey(param.id, null, 'VALUE');
      const state = entryState[key];
      if (state?.numericValue === null || state?.numericValue === undefined) {
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
    activeCTIds,
    machinesForCategory,
    parametersByCategory,
  ]);

  return { validateEntries };
}
