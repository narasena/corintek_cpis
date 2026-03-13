import type {
  ICategoryView,
  ILogSheetDetailSnapshot,
  ILogSheetUnitConfigurationError,
  ILogSheetUnitViewConfig,
  ILogSheetUnitViewModel,
  ILogSheetUnitViewModelBuilder,
  IParameterRowView,
  IRawWaterParameterView,
  IUnitView,
  IUnitCompletionStats,
  TReadonlyEntryStateMap,
  TUnitId,
  TCategoryId,
  ILogSheetMachineSnapshot,
  ILogSheetParameterSnapshot,
} from './contracts';
import { isEntryValueComplete, isNumericInRange } from '../utils/value-type';
import { makeEntryKey } from '../utils';

const CHILLER_CATEGORIES: readonly TCategoryId[] = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
];

const CT_CATEGORIES: readonly TCategoryId[] = [
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
];

const CATEGORY_LABELS: Record<TCategoryId, string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Cooling Water Quality',
  GENERAL_CONDITION: 'General Condition',
  JOB_DESCRIPTION: 'Job Description',
  CONSUMPTION: 'Consumption',
};

export class LogSheetUnitViewModelBuilder implements ILogSheetUnitViewModelBuilder {
  build(
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap,
    config: ILogSheetUnitViewConfig
  ): ILogSheetUnitViewModel {
    this.assertConfiguration(config);
    const units = this.buildUnitViews(detail, entryState);
    const activeUnitId = this.selectActiveUnitId(units, config);
    const categoriesByUnit = this.buildCategoriesByUnit(
      units,
      detail,
      entryState
    );
    const rawWaterParameters = this.buildRawWaterParameters(detail, entryState);

    return {
      units,
      activeUnitId,
      categoriesByUnit,
      rawWaterParameters,
      summaryFields: [],
    };
  }

  private assertConfiguration(
    config: ILogSheetUnitViewConfig
  ): asserts config is ILogSheetUnitViewConfig {
    if (!config.featureEnabled) {
      throw this.configError(
        'Option A unit view is disabled',
        'featureEnabled'
      );
    }
    if (config.maxVisibleUnits !== undefined && config.maxVisibleUnits < 1) {
      throw this.configError('maxVisibleUnits must be >= 1', 'maxVisibleUnits');
    }
  }

  private configError(
    message: string,
    field: string
  ): ILogSheetUnitConfigurationError {
    return { kind: 'CONFIGURATION_ERROR', message, field };
  }

  private buildUnitViews(
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap
  ): IUnitView[] {
    const chillers = this.getVisibleMachines(
      detail.machines?.chillers ?? [],
      detail.activeMachineIds?.chillers ?? []
    );
    const coolingTowers = this.getVisibleMachines(
      detail.machines?.coolingTowers ?? [],
      detail.activeMachineIds?.coolingTowers ?? []
    );

    const chillerUnits = chillers.map(m =>
      this.createUnitView(m, 'CHILLER', detail, entryState)
    );
    const ctUnits = coolingTowers.map(m =>
      this.createUnitView(m, 'COOLING_TOWER', detail, entryState)
    );

    return [...chillerUnits, ...ctUnits];
  }

  private getVisibleMachines(
    machines: readonly ILogSheetMachineSnapshot[],
    activeIds: readonly string[]
  ): readonly ILogSheetMachineSnapshot[] {
    if (activeIds.length === 0) return machines;
    const activeSet = new Set(activeIds);
    return machines.filter(m => activeSet.has(m.id));
  }

  private createUnitView(
    machine: ILogSheetMachineSnapshot,
    type: 'CHILLER' | 'COOLING_TOWER',
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap
  ): IUnitView {
    const id = this.makeUnitId(type, machine.unitNumber);
    const label = `${type === 'CHILLER' ? 'Chiller' : 'Cooling Tower'} #${machine.unitNumber}`;
    const completion = this.calculateCompletion(
      machine.id,
      type,
      detail,
      entryState
    );
    return {
      id,
      machineId: machine.id,
      label,
      type,
      completion,
      status: this.getStatus(completion),
    };
  }

  private makeUnitId(
    type: 'CHILLER' | 'COOLING_TOWER',
    unitNumber: number
  ): TUnitId {
    return `${type}-${unitNumber}`;
  }

  private calculateCompletion(
    machineId: string,
    type: 'CHILLER' | 'COOLING_TOWER',
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap
  ): IUnitCompletionStats {
    const categories = type === 'CHILLER' ? CHILLER_CATEGORIES : CT_CATEGORIES;
    const relevantParams = (detail.parameters ?? []).filter(p =>
      categories.includes(p.category)
    );

    let completed = 0;
    const total = relevantParams.length;

    for (const param of relevantParams) {
      const key = makeEntryKey(param.id, machineId, 'VALUE');
      const state = entryState[key];
      if (isEntryValueComplete(state)) completed++;
    }

    return {
      completedCount: completed,
      totalCount: total,
      completionRatio: total > 0 ? completed / total : null,
    };
  }

  private getStatus(
    completion: IUnitCompletionStats
  ): 'EMPTY' | 'IN_PROGRESS' | 'COMPLETE' {
    if (completion.totalCount === 0) return 'EMPTY';
    if (completion.completedCount === 0) return 'EMPTY';
    if (completion.completedCount === completion.totalCount) return 'COMPLETE';
    return 'IN_PROGRESS';
  }

  private selectActiveUnitId(
    units: readonly IUnitView[],
    config: ILogSheetUnitViewConfig
  ): TUnitId | null {
    if (units.length === 0) return null;
    if (config.defaultViewMode !== 'unit-first') return null;
    return units[0].id;
  }

  private buildCategoriesByUnit(
    units: readonly IUnitView[],
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap
  ): ReadonlyMap<TUnitId, readonly ICategoryView[]> {
    const map = new Map<TUnitId, readonly ICategoryView[]>();
    for (const unit of units) {
      const categories = this.createCategoriesForUnit(unit, detail, entryState);
      map.set(unit.id, categories);
    }
    return map;
  }

  private createCategoriesForUnit(
    unit: IUnitView,
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap
  ): ICategoryView[] {
    const categoryIds =
      unit.type === 'CHILLER' ? CHILLER_CATEGORIES : CT_CATEGORIES;
    return categoryIds
      .map(catId => this.buildCategoryView(catId, unit, detail, entryState))
      .filter(cat => cat.parameters.length > 0);
  }

  private buildCategoryView(
    categoryId: TCategoryId,
    unit: IUnitView,
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap
  ): ICategoryView {
    const params = (detail.parameters ?? []).filter(
      p => p.category === categoryId
    );
    const rows = params
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(p => this.buildParameterRow(p, unit.machineId, entryState));

    return {
      id: categoryId,
      label: CATEGORY_LABELS[categoryId],
      parameters: rows,
    };
  }

  private buildParameterRow(
    param: ILogSheetParameterSnapshot,
    machineId: string,
    entryState: TReadonlyEntryStateMap
  ): IParameterRowView {
    const entryKey = makeEntryKey(param.id, machineId, 'VALUE');
    const state = entryState[entryKey];

    return {
      parameterId: param.id,
      label: param.name,
      categoryId: param.category,
      displayOrder: param.displayOrder,
      valueType: param.valueType,
      unit: param.unit,
      minValue: param.minValue,
      maxValue: param.maxValue,
      targetRangeText: this.formatRange(param.minValue, param.maxValue),
      entryKey,
      inRange: this.checkInRange(param, state),
    };
  }

  private buildRawWaterParameters(
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap
  ): IRawWaterParameterView[] {
    const cwqParams = (detail.parameters ?? []).filter(
      p => p.category === 'COOLING_WATER_QUALITY'
    );

    return cwqParams
      .filter(p => p.rawWaterMinValue !== null || p.rawWaterMaxValue !== null)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(p => this.buildRawWaterParamRow(p, entryState));
  }

  private buildRawWaterParamRow(
    param: ILogSheetParameterSnapshot,
    entryState: TReadonlyEntryStateMap
  ): IRawWaterParameterView {
    const entryKey = makeEntryKey(param.id, null, 'RAW_WATER');
    const state = entryState[entryKey];

    return {
      parameterId: param.id,
      label: param.name,
      unit: param.unit,
      minValue: param.rawWaterMinValue ?? null,
      maxValue: param.rawWaterMaxValue ?? null,
      targetRangeText: this.formatRange(
        param.rawWaterMinValue ?? null,
        param.rawWaterMaxValue ?? null
      ),
      entryKey,
      inRange: this.checkRawWaterInRange(state, param),
    };
  }

  private checkRawWaterInRange(
    state: { valueType?: string; numericValue?: number | null } | undefined,
    param: ILogSheetParameterSnapshot
  ): boolean | null {
    if (!state || state.valueType !== 'NUMBER') return null;
    return isNumericInRange(
      state.numericValue,
      param.rawWaterMinValue ?? null,
      param.rawWaterMaxValue ?? null
    );
  }

  private checkInRange(
    param: ILogSheetParameterSnapshot,
    state: { valueType?: string; numericValue?: number | null } | undefined
  ): boolean | null {
    if (!state || state.valueType !== 'NUMBER') return null;
    return isNumericInRange(state.numericValue, param.minValue, param.maxValue);
  }

  private formatRange(min: number | null, max: number | null): string | null {
    if (min === null && max === null) return null;
    if (min === null) return `≤ ${max}`;
    if (max === null) return `≥ ${min}`;
    return `${min} - ${max}`;
  }
}
