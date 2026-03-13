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

    // Characterization requirement: Auto-initialize BOOLEAN parameters for active CTs if missing
    // Specifically for certain categories
    const AUTO_INIT_CATEGORIES = [
      'COOLING_WATER_QUALITY',
      'GENERAL_CONDITION',
      'JOB_DESCRIPTION',
    ];

    if (detail.activeMachineIds.coolingTowers.length > 0) {
      const boolParams = detail.parameters.filter(
        p =>
          p.valueType === 'BOOLEAN' && AUTO_INIT_CATEGORIES.includes(p.category)
      );

      for (const p of boolParams) {
        for (const ctId of detail.activeMachineIds.coolingTowers) {
          const key = makeEntryKey(p.id, ctId, 'VALUE');
          if (initial[key] === undefined) {
            initial[key] = {
              valueType: 'BOOLEAN',
              boolValue: false,
              numericValue: null,
              textValue: null,
            };
          }
        }

        // Also check RAW_WATER for COOLING_WATER_QUALITY
        if (p.category === 'COOLING_WATER_QUALITY') {
          const rawKey = makeEntryKey(p.id, null, 'RAW_WATER');
          if (initial[rawKey] === undefined) {
            initial[rawKey] = {
              valueType: 'BOOLEAN',
              boolValue: false,
              numericValue: null,
              textValue: null,
            };
          }
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
