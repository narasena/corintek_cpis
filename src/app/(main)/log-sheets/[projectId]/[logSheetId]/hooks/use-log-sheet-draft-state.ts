import { useEffect, useState } from 'react';

import { makeEntryKey } from '@/features/log-sheets/utils';
import type { TChemicalUsageState } from '@/features/log-sheets/components/chemical-usage-section';
import type { TDetail, TEntryState } from '../types';

export function useLogSheetDraftState(detail: TDetail | null) {
  const [notes, setNotes] = useState('');
  const [replacedByUserId, setReplacedByUserId] = useState<string | null>(null);
  const [entryState, setEntryState] = useState<Record<string, TEntryState>>({});
  const [chemicalState, setChemicalState] = useState<TChemicalUsageState>([]);
  const [activeChillerIds, setActiveChillerIds] = useState<string[]>([]);
  const [activeCTIds, setActiveCTIds] = useState<string[]>([]);

  useEffect(() => {
    if (!detail) return;

    setNotes(detail.logSheet.notes ?? '');
    setReplacedByUserId(detail.logSheet.replacedBy?.id ?? null);
    setActiveChillerIds(detail.activeMachineIds.chillers);
    setActiveCTIds(detail.activeMachineIds.coolingTowers);

    const initial: Record<string, TEntryState> = {};
    for (const entry of detail.entries) {
      initial[makeEntryKey(entry.parameterId, entry.machineId, entry.role)] = {
        valueType: entry.valueType,
        numericValue: entry.numericValue,
        boolValue: entry.boolValue,
        textValue: entry.textValue,
        fileUrl: entry.fileUrl,
      };
    }

    const ctCategories = new Set([
      'COOLING_WATER_QUALITY',
      'GENERAL_CONDITION',
      'JOB_DESCRIPTION',
    ]);
    const ctIds = detail.activeMachineIds.coolingTowers;

    for (const param of detail.parameters) {
      if (param.valueType !== 'BOOLEAN') continue;
      if (!ctCategories.has(param.category)) continue;

      if (param.category === 'COOLING_WATER_QUALITY') {
        for (const ctId of ctIds) {
          const key = makeEntryKey(param.id, ctId, 'VALUE');
          if (!initial[key]) {
            initial[key] = {
              valueType: 'BOOLEAN',
              boolValue: false,
              numericValue: null,
              textValue: null,
            };
          }
        }
        const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
        if (!initial[rawKey]) {
          initial[rawKey] = {
            valueType: 'BOOLEAN',
            boolValue: false,
            numericValue: null,
            textValue: null,
          };
        }
        continue;
      }

      for (const ctId of ctIds) {
        const key = makeEntryKey(param.id, ctId, 'VALUE');
        if (!initial[key]) {
          initial[key] = {
            valueType: 'BOOLEAN',
            boolValue: false,
            numericValue: null,
            textValue: null,
          };
        }
      }
    }
    setEntryState(initial);

    const chemicals = detail.chemicalUsages.map(u => ({
      id: u.id,
      chemicalId: u.chemicalId,
      amount: u.amount,
      chemicalName: u.chemicalName,
      unit: u.chemicalUnit,
    }));
    setChemicalState(chemicals);
  }, [detail]);

  return {
    notes,
    setNotes,
    replacedByUserId,
    setReplacedByUserId,
    entryState,
    setEntryState,
    chemicalState,
    setChemicalState,
    activeChillerIds,
    setActiveChillerIds,
    activeCTIds,
    setActiveCTIds,
  };
}
