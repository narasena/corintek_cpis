export type TLogSheetId = string;
export type TProjectId = string;
export type TUnitId = string;

export type TCategoryId =
  | 'UNIT_CONDENSOR'
  | 'UNIT_EVAPORATOR'
  | 'COOLING_WATER_QUALITY'
  | 'GENERAL_CONDITION'
  | 'JOB_DESCRIPTION'
  | 'CONSUMPTION';

export type TValueType = 'NUMBER' | 'BOOLEAN' | 'TEXT';

export type TEntryRole = 'VALUE' | 'RAW_WATER' | 'NOTE';

export interface ILogSheetHeaderSnapshot {
  readonly id: TLogSheetId;
  readonly projectId: TProjectId;
  readonly date: Date;
  readonly status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  readonly notes: string | null;
  readonly locked: boolean;
}

export interface IProjectSnapshot {
  readonly id: TProjectId;
  readonly name: string;
  readonly clientName: string | null;
}

export type TMachineType = 'CHILLER' | 'COOLING_TOWER';

export interface ILogSheetMachineSnapshot {
  readonly id: string;
  readonly unitNumber: number;
  readonly type: TMachineType;
}

export interface IActiveMachineIdsSnapshot {
  readonly chillers: readonly string[];
  readonly coolingTowers: readonly string[];
}

export interface ILogSheetParameterSnapshot {
  readonly id: string;
  readonly name: string;
  readonly variableName: string;
  readonly category: TCategoryId;
  readonly valueType: TValueType;
  readonly unit: string | null;
  readonly minValue: number | null;
  readonly maxValue: number | null;
  readonly rawWaterMinValue?: number | null;
  readonly rawWaterMaxValue?: number | null;
  readonly displayOrder: number;
}

export interface ILogSheetEntrySnapshot {
  readonly logSheetId: TLogSheetId;
  readonly parameterId: string;
  readonly machineId: string | null;
  readonly role: TEntryRole;
  readonly valueType: TValueType;
  readonly numericValue: number | null;
  readonly boolValue: boolean | null;
  readonly textValue: string | null;
  readonly fileUrl: string | null;
}

export interface IReadonlyEntryState {
  readonly valueType: TValueType;
  readonly numericValue?: number | null;
  readonly boolValue?: boolean | null;
  readonly textValue?: string | null;
  readonly fileUrl?: string | null;
}

export type TReadonlyEntryStateMap = Readonly<
  Record<string, IReadonlyEntryState>
>;

export interface ILogSheetDetailSnapshot {
  readonly header: ILogSheetHeaderSnapshot;
  readonly project: IProjectSnapshot;
  readonly machines: {
    readonly chillers: readonly ILogSheetMachineSnapshot[];
    readonly coolingTowers: readonly ILogSheetMachineSnapshot[];
  };
  readonly parameters: readonly ILogSheetParameterSnapshot[];
  readonly entries: readonly ILogSheetEntrySnapshot[];
  readonly activeMachineIds: IActiveMachineIdsSnapshot;
}

export interface IUnitCompletionStats {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly completionRatio: number | null;
}

export type TUnitCompletionStatus = 'EMPTY' | 'IN_PROGRESS' | 'COMPLETE';

export interface IUnitView {
  readonly id: TUnitId;
  readonly label: string;
  readonly type: TMachineType;
  readonly completion: IUnitCompletionStats;
  readonly status: TUnitCompletionStatus;
}

export interface IParameterRowView {
  readonly parameterId: string;
  readonly label: string;
  readonly categoryId: TCategoryId;
  readonly displayOrder: number;
  readonly valueType: TValueType;
  readonly unit: string | null;
  readonly targetRangeText: string | null;
  readonly entryKey: string;
  readonly inRange: boolean | null;
}

export interface ICategoryView {
  readonly id: TCategoryId;
  readonly label: string;
  readonly parameters: readonly IParameterRowView[];
}

export type TSummaryFieldKind = 'WATER_USAGE' | 'CHEMICAL_USAGE' | 'NOTES';

export interface ISummaryFieldView {
  readonly kind: TSummaryFieldKind;
  readonly label: string;
  readonly stateKey: string;
  readonly valueType: TValueType;
}

export interface ILogSheetUnitViewModel {
  readonly units: readonly IUnitView[];
  readonly activeUnitId: TUnitId | null;
  readonly categoriesByUnit: ReadonlyMap<TUnitId, readonly ICategoryView[]>;
  readonly summaryFields: readonly ISummaryFieldView[];
}

export interface ILogSheetUnitViewConfig {
  readonly featureEnabled: boolean;
  readonly maxVisibleUnits?: number;
  readonly defaultViewMode: 'unit-first' | 'overview-first';
  readonly unitSortStrategy: 'byUnitNumber' | 'byTypeThenUnitNumber';
}

export interface ILogSheetUnitViewModelBuilder {
  build(
    detail: ILogSheetDetailSnapshot,
    entryState: TReadonlyEntryStateMap,
    config: ILogSheetUnitViewConfig
  ): ILogSheetUnitViewModel;
}

export interface ILogSheetUnitViewBaseError {
  readonly kind: string;
  readonly message: string;
}

export interface ILogSheetUnitConfigurationError
  extends ILogSheetUnitViewBaseError {
  readonly kind: 'CONFIGURATION_ERROR';
  readonly field?: string;
}

export type TLogSheetUnitViewError = ILogSheetUnitConfigurationError;
