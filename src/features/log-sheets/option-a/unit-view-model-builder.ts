import type {
  ICategoryView,
  ILogSheetDetailSnapshot,
  ILogSheetUnitConfigurationError,
  ILogSheetUnitViewConfig,
  ILogSheetUnitViewModel,
  ILogSheetUnitViewModelBuilder,
  IUnitView,
  TReadonlyEntryStateMap,
  TUnitId,
} from './contracts';

export class LogSheetUnitViewModelBuilder
  implements ILogSheetUnitViewModelBuilder
{
  build(
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap,
    config: ILogSheetUnitViewConfig
  ): ILogSheetUnitViewModel {
    this.assertConfiguration(config);
    const units = this.buildUnitViews(detail);
    const activeUnitId = this.selectActiveUnitId(units, config);
    const categoriesByUnit = this.buildCategoriesByUnit(units);

    return {
      units,
      activeUnitId,
      categoriesByUnit,
      summaryFields: [],
    };
  }

  private assertConfiguration(
    config: ILogSheetUnitViewConfig
  ): asserts config is ILogSheetUnitViewConfig {
    if (!config.featureEnabled) {
      const error: ILogSheetUnitConfigurationError = {
        kind: 'CONFIGURATION_ERROR',
        message: 'Option A unit view is disabled by configuration',
        field: 'featureEnabled',
      };
      throw error;
    }

    if (config.maxVisibleUnits !== undefined && config.maxVisibleUnits < 1) {
      const error: ILogSheetUnitConfigurationError = {
        kind: 'CONFIGURATION_ERROR',
        message: 'maxVisibleUnits must be greater than zero when provided',
        field: 'maxVisibleUnits',
      };
      throw error;
    }
  }

  private buildUnitViews(detail: ILogSheetDetailSnapshot): IUnitView[] {
    const visibleChillers = this.getVisibleChillers(detail);
    return visibleChillers.map(m => ({
      id: `CHILLER-${m.unitNumber}`,
      label: `Chiller #${m.unitNumber}`,
      type: 'CHILLER',
      completion: {
        completedCount: 0,
        totalCount: 0,
        completionRatio: null,
      },
      status: 'EMPTY',
    }));
  }

  private getVisibleChillers(detail: ILogSheetDetailSnapshot) {
    const activeChillerIds = new Set(detail.activeMachineIds.chillers);
    if (activeChillerIds.size === 0) {
      return detail.machines.chillers;
    }
    return detail.machines.chillers.filter(m => activeChillerIds.has(m.id));
  }

  private selectActiveUnitId(
    units: readonly IUnitView[],
    config: ILogSheetUnitViewConfig
  ): TUnitId | null {
    if (units.length === 0) {
      return null;
    }
    if (config.defaultViewMode !== 'unit-first') {
      return null;
    }
    return units[0].id;
  }

  private buildCategoriesByUnit(
    units: readonly IUnitView[]
  ): ReadonlyMap<TUnitId, readonly ICategoryView[]> {
    if (!Array.isArray(units)) {
      throw new Error('Invalid units collection');
    }

    const map = new Map<TUnitId, readonly ICategoryView[]>();
    for (const unit of units) {
      const categories = createCategoriesForUnit(unit);
      map.set(unit.id, categories);
    }
    return map;
  }
}

function createCategoriesForUnit(unit: IUnitView): ICategoryView[] {
  const baseCategories: { id: ICategoryView['id']; label: string }[] = [
    { id: 'UNIT_CONDENSOR', label: 'Unit Condensor' },
    { id: 'UNIT_EVAPORATOR', label: 'Unit Evaporator' },
    { id: 'GENERAL_CONDITION', label: 'General Condition' },
    { id: 'JOB_DESCRIPTION', label: 'Job Description' },
    { id: 'CONSUMPTION', label: 'Consumption' },
  ];

  return baseCategories.map(category => ({
    id: category.id,
    label: `${category.label} - ${unit.label}`,
    parameters: [],
  }));
}
