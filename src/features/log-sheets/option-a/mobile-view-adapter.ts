import type {
  ILogSheetDetailSnapshot,
  ILogSheetUnitViewConfig,
  ILogSheetUnitViewModel,
  ILogSheetUnitViewModelBuilder,
  TReadonlyEntryStateMap,
} from './contracts';

type TBuildMobileUnitViewModelArgs = {
  detail: ILogSheetDetailSnapshot;
  entryState: TReadonlyEntryStateMap;
  config: ILogSheetUnitViewConfig;
  builder: ILogSheetUnitViewModelBuilder;
};

export function buildMobileUnitViewModelForLogSheet(
  args: TBuildMobileUnitViewModelArgs
): ILogSheetUnitViewModel {
  const { detail, entryState, config, builder } = args;
  try {
    return builder.build(detail, entryState, config);
  } catch {
    return {
      units: [],
      activeUnitId: null,
      categoriesByUnit: new Map(),
      rawWaterParameters: [],
      summaryFields: [],
    };
  }
}
