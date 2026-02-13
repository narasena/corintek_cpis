import { useEffect, useState } from 'react';

import { makeEntryKey } from '@/features/log-sheets/utils';
import type { TChemicalUsageState } from '../components/chemical-usage-section';
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
