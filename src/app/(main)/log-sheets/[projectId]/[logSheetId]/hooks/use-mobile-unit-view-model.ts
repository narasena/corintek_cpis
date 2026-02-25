import { useMemo } from 'react';

import type {
  IActiveMachineIdsSnapshot,
  ILogSheetDetailSnapshot,
  ILogSheetUnitViewConfig,
  ILogSheetUnitViewModel,
  TReadonlyEntryStateMap,
} from '@/features/log-sheets/option-a/contracts';
import { LogSheetUnitViewModelBuilder } from '@/features/log-sheets/option-a/unit-view-model-builder';
import { buildMobileUnitViewModelForLogSheet } from '@/features/log-sheets/option-a/mobile-view-adapter';

import type { TDetail, TEntryState } from '../types';

const viewModelBuilder = new LogSheetUnitViewModelBuilder();

export interface IActiveMachineIdsOverride {
  chillers: string[];
  coolingTowers: string[];
}

function mapDetailToSnapshot(
  detail: TDetail,
  activeMachineIdsOverride?: IActiveMachineIdsOverride
): ILogSheetDetailSnapshot {
  return {
    header: buildHeaderSnapshot(detail),
    project: buildProjectSnapshot(detail),
    machines: buildMachinesSnapshot(detail),
    parameters: detail.parameters,
    entries: buildEntriesSnapshot(detail),
    activeMachineIds: resolveActiveMachineIds(detail, activeMachineIdsOverride),
  };
}

function buildHeaderSnapshot(
  detail: TDetail
): ILogSheetDetailSnapshot['header'] {
  return {
    id: detail.logSheet.id,
    projectId: detail.logSheet.projectId,
    date: new Date(detail.logSheet.date),
    status: detail.logSheet.status,
    notes: detail.logSheet.notes,
    locked: detail.logSheet.status !== 'DRAFT',
  };
}

function buildProjectSnapshot(
  detail: TDetail
): ILogSheetDetailSnapshot['project'] {
  return {
    id: detail.project.id,
    name: detail.project.name,
    clientName: detail.project.clientName,
  };
}

function buildMachinesSnapshot(
  detail: TDetail
): ILogSheetDetailSnapshot['machines'] {
  return {
    chillers: detail.machines.chillers,
    coolingTowers: detail.machines.coolingTowers,
  };
}

function buildEntriesSnapshot(
  detail: TDetail
): ILogSheetDetailSnapshot['entries'] {
  return detail.entries.map(entry => ({
    logSheetId: detail.logSheet.id,
    parameterId: entry.parameterId,
    machineId: entry.machineId,
    role: entry.role,
    valueType: entry.valueType,
    numericValue: entry.numericValue,
    boolValue: entry.boolValue,
    textValue: entry.textValue,
    fileUrl: entry.fileUrl,
  }));
}

function resolveActiveMachineIds(
  detail: TDetail,
  override?: IActiveMachineIdsOverride
): IActiveMachineIdsSnapshot {
  if (!override) {
    return detail.activeMachineIds;
  }
  return {
    chillers: override.chillers,
    coolingTowers: override.coolingTowers,
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
    defaultViewMode: 'overview-first',
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
  activeMachineIds?: IActiveMachineIdsOverride,
  configOverride?: Partial<ILogSheetUnitViewConfig>
): ILogSheetUnitViewModel | null {
  return useMemo(() => {
    if (!detail) return null;

    const snapshot = mapDetailToSnapshot(detail, activeMachineIds);
    const stateMap = mapEntryState(entryState);
    const config = createMobileUnitViewConfig(configOverride);

    return buildMobileUnitViewModelForLogSheet({
      detail: snapshot,
      entryState: stateMap as TReadonlyEntryStateMap,
      config,
      builder: viewModelBuilder,
    });
  }, [detail, entryState, activeMachineIds, configOverride]);
}
