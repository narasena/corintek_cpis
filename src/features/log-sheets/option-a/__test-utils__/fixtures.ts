import type {
  IActiveMachineIdsSnapshot,
  ILogSheetDetailSnapshot,
  ILogSheetEntrySnapshot,
  ILogSheetHeaderSnapshot,
  ILogSheetMachineSnapshot,
  ILogSheetParameterSnapshot,
  ILogSheetUnitViewConfig,
  IProjectSnapshot,
  IReadonlyEntryState,
  TLogSheetId,
  TProjectId,
  TReadonlyEntryStateMap,
} from '../contracts';

export const createLogSheetHeader = (
  overrides: Partial<ILogSheetHeaderSnapshot> = {}
): ILogSheetHeaderSnapshot => ({
  id: (overrides.id ?? 'ls-1') as TLogSheetId,
  projectId: (overrides.projectId ?? 'proj-1') as TProjectId,
  date: overrides.date ?? new Date('2024-01-01'),
  status: overrides.status ?? 'DRAFT',
  notes: overrides.notes ?? null,
  locked: overrides.locked ?? false,
});

export const createProjectSnapshot = (
  overrides: Partial<IProjectSnapshot> = {}
): IProjectSnapshot => ({
  id: (overrides.id ?? 'proj-1') as TProjectId,
  name: overrides.name ?? 'Project A',
  clientName: overrides.clientName ?? 'Client',
});

export const createMachine = (
  overrides: Partial<ILogSheetMachineSnapshot> = {}
): ILogSheetMachineSnapshot => ({
  id: overrides.id ?? 'm-1',
  unitNumber: overrides.unitNumber ?? 1,
  type: overrides.type ?? 'CHILLER',
});

export const createParameter = (
  overrides: Partial<ILogSheetParameterSnapshot> = {}
): ILogSheetParameterSnapshot => ({
  id: overrides.id ?? 'param-1',
  name: overrides.name ?? 'Condensor Temp',
  variableName: overrides.variableName ?? 'condensor_temp',
  category: overrides.category ?? 'UNIT_CONDENSOR',
  valueType: overrides.valueType ?? 'NUMBER',
  unit: overrides.unit ?? 'C',
  minValue: overrides.minValue ?? 10,
  maxValue: overrides.maxValue ?? 20,
  rawWaterMinValue: overrides.rawWaterMinValue ?? null,
  rawWaterMaxValue: overrides.rawWaterMaxValue ?? null,
  displayOrder: overrides.displayOrder ?? 1,
});

export const createChillerParameter = (
  overrides: Partial<ILogSheetParameterSnapshot> = {}
): ILogSheetParameterSnapshot =>
  createParameter({
    category: 'UNIT_CONDENSOR',
    ...overrides,
  });

export const createCTParameter = (
  overrides: Partial<ILogSheetParameterSnapshot> = {}
): ILogSheetParameterSnapshot =>
  createParameter({
    id: 'param-ct-1',
    name: 'Cooling Water pH',
    category: 'COOLING_WATER_QUALITY',
    ...overrides,
  });

export const createEntry = (
  overrides: Partial<ILogSheetEntrySnapshot> = {}
): ILogSheetEntrySnapshot => ({
  logSheetId: overrides.logSheetId ?? 'ls-1',
  parameterId: overrides.parameterId ?? 'param-1',
  machineId: overrides.machineId ?? 'm-1',
  role: overrides.role ?? 'VALUE',
  valueType: overrides.valueType ?? 'NUMBER',
  numericValue: overrides.numericValue ?? 15,
  boolValue: overrides.boolValue ?? null,
  textValue: overrides.textValue ?? null,
  fileUrl: overrides.fileUrl ?? null,
});

export const createActiveMachineIds = (
  overrides: Partial<IActiveMachineIdsSnapshot> = {}
): IActiveMachineIdsSnapshot => ({
  chillers: overrides.chillers ?? ['m-1'],
  coolingTowers: overrides.coolingTowers ?? [],
});

export const createDetailSnapshot = (
  overrides: Partial<ILogSheetDetailSnapshot> = {}
): ILogSheetDetailSnapshot => ({
  header: overrides.header ?? createLogSheetHeader(),
  project: overrides.project ?? createProjectSnapshot(),
  machines: overrides.machines ?? {
    chillers: [createMachine()],
    coolingTowers: [],
  },
  parameters: overrides.parameters ?? [createParameter()],
  entries: overrides.entries ?? [createEntry()],
  activeMachineIds: overrides.activeMachineIds ?? createActiveMachineIds(),
});

export const createEntryStateMap = (
  overrides: Record<string, IReadonlyEntryState> = {}
): TReadonlyEntryStateMap => {
  const result: Record<string, IReadonlyEntryState> = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

export const createConfig = (
  overrides: Partial<ILogSheetUnitViewConfig> = {}
): ILogSheetUnitViewConfig => ({
  featureEnabled: overrides.featureEnabled ?? true,
  maxVisibleUnits: overrides.maxVisibleUnits,
  defaultViewMode: overrides.defaultViewMode ?? 'overview-first',
  unitSortStrategy: overrides.unitSortStrategy ?? 'byUnitNumber',
});
