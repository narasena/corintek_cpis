import type { Dispatch, SetStateAction, TransitionStartFunction } from 'react';
import { toast } from 'sonner';

import { saveLogSheetMachinesAction } from '@/features/log-sheets/actions';
import type { TDetail } from '../types';

export function useLogSheetActiveMachines(args: {
  detail: TDetail | null;
  logSheetId: string;
  activeChillerIds: string[];
  setActiveChillerIds: Dispatch<SetStateAction<string[]>>;
  activeCTIds: string[];
  setActiveCTIds: Dispatch<SetStateAction<string[]>>;
  startTransition: TransitionStartFunction;
}) {
  const {
    detail,
    logSheetId,
    activeChillerIds,
    setActiveChillerIds,
    activeCTIds,
    setActiveCTIds,
    startTransition,
  } = args;

  const handleToggleMachine = (
    id: string,
    type: 'CHILLER' | 'COOLING_TOWER'
  ) => {
    startTransition(async () => {
      let newIds: string[] = [];
      if (type === 'CHILLER') {
        newIds = activeChillerIds.includes(id)
          ? activeChillerIds.filter(i => i !== id)
          : [...activeChillerIds, id];
        setActiveChillerIds(newIds);
      } else {
        newIds = activeCTIds.includes(id)
          ? activeCTIds.filter(i => i !== id)
          : [...activeCTIds, id];
        setActiveCTIds(newIds);
      }

      const res = await saveLogSheetMachinesAction({
        logSheetId,
        machineIds:
          type === 'CHILLER'
            ? [...newIds, ...activeCTIds]
            : [...activeChillerIds, ...newIds],
      });

      if (!res.success) {
        toast.error('Gagal menyimpan unit aktif', { description: res.error });
        if (type === 'CHILLER') {
          setActiveChillerIds(activeChillerIds);
        } else {
          setActiveCTIds(activeCTIds);
        }
      }
    });
  };

  const handleSelectAllMachines = (type: 'CHILLER' | 'COOLING_TOWER') => {
    if (!detail) return;
    startTransition(async () => {
      const allIds =
        type === 'CHILLER'
          ? detail.machines.chillers.map(m => m.id)
          : detail.machines.coolingTowers.map(m => m.id);

      if (type === 'CHILLER') setActiveChillerIds(allIds);
      else setActiveCTIds(allIds);

      const res = await saveLogSheetMachinesAction({
        logSheetId,
        machineIds:
          type === 'CHILLER'
            ? [...allIds, ...activeCTIds]
            : [...activeChillerIds, ...allIds],
      });
      if (!res.success) toast.error('Gagal menyimpan unit aktif');
    });
  };

  const handleClearMachines = (type: 'CHILLER' | 'COOLING_TOWER') => {
    startTransition(async () => {
      if (type === 'CHILLER') setActiveChillerIds([]);
      else setActiveCTIds([]);

      const res = await saveLogSheetMachinesAction({
        logSheetId,
        machineIds:
          type === 'CHILLER' ? [...activeCTIds] : [...activeChillerIds],
      });
      if (!res.success) toast.error('Gagal menyimpan unit aktif');
    });
  };

  return {
    handleToggleMachine,
    handleSelectAllMachines,
    handleClearMachines,
  };
}
