import { useMemo } from 'react';

import type {
  ILogSheetDetailSnapshot,
  ILogSheetUnitViewConfig,
  ILogSheetUnitViewModel,
  TReadonlyEntryStateMap,
} from '@/features/log-sheets/option-a/contracts';
import { LogSheetUnitViewModelBuilder } from '@/features/log-sheets/option-a/unit-view-model-builder';
import { buildMobileUnitViewModelForLogSheet } from '@/features/log-sheets/option-a/mobile-view-adapter';

import type { TDetail, TEntryState } from '../types';

function mapDetailToSnapshot(detail: TDetail): ILogSheetDetailSnapshot {
  return {
    header: {
      id: detail.logSheet.id,
      projectId: detail.logSheet.projectId,
      date: new Date(detail.logSheet.date),
      status: detail.logSheet.status,
      notes: detail.logSheet.notes,
      locked: detail.logSheet.status !== 'DRAFT',
    },
    project: {
      id: detail.project.id,
      name: detail.project.name,
      clientName: detail.project.clientName,
    },
    machines: {
      chillers: detail.machines.chillers,
      coolingTowers: detail.machines.coolingTowers,
    },
    parameters: detail.parameters,
    entries: detail.entries.map(entry => ({
      logSheetId: detail.logSheet.id,
      parameterId: entry.parameterId,
      machineId: entry.machineId,
      role: entry.role,
      valueType: entry.valueType,
      numericValue: entry.numericValue,
      boolValue: entry.boolValue,
      textValue: entry.textValue,
      fileUrl: entry.fileUrl,
    })),
    activeMachineIds: detail.activeMachineIds,
  };
}

function mapEntryState(
  entryState: Record<string, TEntryState>
): TReadonlyEntryStateMap {
  const result: Record<string, TReadonlyEntryStateMap[string]> = {};
  for (const [key, state] of Object.entries(entryState)) {
    result[key] = {
      valueType: state.valueType,
      numericValue: state.numericValue,
      boolValue: state.boolValue,
      textValue: state.textValue,
      fileUrl: state.fileUrl,
    };
  }
  return result;
}

function createMobileUnitViewConfig(
  override?: Partial<ILogSheetUnitViewConfig>
): ILogSheetUnitViewConfig {
  const base: ILogSheetUnitViewConfig = {
    featureEnabled: true,
    maxVisibleUnits: 1,
    defaultViewMode: 'unit-first',
    unitSortStrategy: 'byUnitNumber',
  };

  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    featureEnabled: true,
  };
}

export function useMobileUnitViewModel(
  detail: TDetail | null,
  entryState: Record<string, TEntryState>,
  configOverride?: Partial<ILogSheetUnitViewConfig>
): ILogSheetUnitViewModel | null {
  return useMemo(() => {
    if (!detail) return null;

    const snapshot = mapDetailToSnapshot(detail);
    const stateMap = mapEntryState(entryState);
    const config = createMobileUnitViewConfig(configOverride);
    const builder = new LogSheetUnitViewModelBuilder();

    return buildMobileUnitViewModelForLogSheet({
      detail: snapshot,
      entryState: stateMap as TReadonlyEntryStateMap,
      config,
      builder,
    });
  }, [detail, entryState, configOverride]);
}
