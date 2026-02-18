import { useCallback } from 'react';

import type { TDetail, TEntryState, TParameter } from '../types';
import {
  type TLogSheetValidationInput,
  type TValidationParameter,
  validateLogSheetEntries,
} from '@/features/log-sheets/validation';

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
    const mappedParams = new Map<string, TValidationParameter[]>();
    parametersByCategory.forEach((params, category) => {
      const mapped = params.map<TValidationParameter>(param => ({
        id: param.id,
        name: param.name,
        variableName: param.variableName,
        category: param.category,
        valueType: param.valueType,
      }));
      mappedParams.set(category, mapped);
    });

    const input: TLogSheetValidationInput = detail
      ? {
          detail: {
            machines: {
              chillers: detail.machines.chillers,
              coolingTowers: detail.machines.coolingTowers,
            },
          },
          entryState,
          activeChillerIds,
          activeCTIds,
          parametersByCategory: mappedParams,
        }
      : {
          detail: null,
          entryState,
          activeChillerIds,
          activeCTIds,
          parametersByCategory: mappedParams,
        };

    return validateLogSheetEntries(input);
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
