import { useCallback, useMemo } from 'react';

import { CATEGORY_ORDER } from '@/features/log-sheets/components/log-sheet-preview';
import type { TUserResponse } from '@/@types/user.type';
import type { TDetail, TMachine, TParameter } from '../types';

export function useLogSheetDerived(args: {
  detail: TDetail | null;
  activeChillerIds: string[];
  activeCTIds: string[];
  technicians: TUserResponse[];
  replacedByUserId: string | null;
}) {
  const {
    detail,
    activeChillerIds,
    activeCTIds,
    technicians,
    replacedByUserId,
  } = args;

  const categories = useMemo(() => {
    if (!detail) return [];
    const unique = Array.from(new Set(detail.parameters.map(p => p.category)));
    return unique.sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b);
    });
  }, [detail]);

  const parametersByCategory = useMemo(() => {
    const map = new Map<string, TParameter[]>();
    if (!detail) return map;
    for (const p of detail.parameters) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    for (const [key, list] of map.entries()) {
      map.set(
        key,
        [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      );
    }
    return map;
  }, [detail]);

  const machinesForCategory = useCallback(
    (category: TParameter['category']) => {
      if (!detail) return { machines: [] as TMachine[], label: '' };
      if (category === 'UNIT_CONDENSOR' || category === 'UNIT_EVAPORATOR') {
        const filtered = detail.machines.chillers.filter(m =>
          activeChillerIds.includes(m.id)
        );
        return { machines: filtered, label: 'Chiller' };
      }
      if (
        category === 'COOLING_WATER_QUALITY' ||
        category === 'GENERAL_CONDITION' ||
        category === 'JOB_DESCRIPTION'
      ) {
        const filtered = detail.machines.coolingTowers.filter(m =>
          activeCTIds.includes(m.id)
        );
        return {
          machines: filtered,
          label: 'Cooling Tower',
        };
      }
      return { machines: [] as TMachine[], label: '' };
    },
    [detail, activeChillerIds, activeCTIds]
  );

  const activeMachines = useMemo(() => {
    if (!detail) return { chillers: [], coolingTowers: [] };
    return {
      chillers: detail.machines.chillers.filter(m =>
        activeChillerIds.includes(m.id)
      ),
      coolingTowers: detail.machines.coolingTowers.filter(m =>
        activeCTIds.includes(m.id)
      ),
    };
  }, [detail, activeChillerIds, activeCTIds]);

  const replacedByName = useMemo(() => {
    if (!replacedByUserId) return null;

    const tech = technicians.find(t => t.id === replacedByUserId);
    if (tech) return `${tech.firstName} ${tech.lastName || ''}`.trim();

    if (detail?.logSheet.replacedBy?.id === replacedByUserId) {
      return `${detail.logSheet.replacedBy.firstName} ${
        detail.logSheet.replacedBy.lastName || ''
      }`.trim();
    }

    return null;
  }, [replacedByUserId, technicians, detail]);

  return {
    categories,
    parametersByCategory,
    machinesForCategory,
    activeMachines,
    replacedByName,
  };
}
