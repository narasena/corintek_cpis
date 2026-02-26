import type { ILogSheetDetailView } from './types';
import type { TLimitEvaluationEntrySnapshot } from '@/features/notifications/types';

function isNumericEntry(entry: ILogSheetDetailView['entries'][number]) {
  return entry.valueType === 'NUMBER' && entry.numericValue !== null;
}

function resolveLimits(
  parameter: ILogSheetDetailView['parameters'][number],
  role: ILogSheetDetailView['entries'][number]['role']
) {
  if (role === 'RAW_WATER') {
    return {
      minLimit: parameter.rawWaterMinValue ?? null,
      maxLimit: parameter.rawWaterMaxValue ?? null,
    };
  }
  return {
    minLimit: parameter.minValue ?? null,
    maxLimit: parameter.maxValue ?? null,
  };
}

function mapEntryToSnapshot(
  detail: ILogSheetDetailView,
  entry: ILogSheetDetailView['entries'][number]
): TLimitEvaluationEntrySnapshot | null {
  if (!isNumericEntry(entry)) {
    return null;
  }

  const parameter = detail.parameters.find(p => p.id === entry.parameterId);
  if (!parameter) {
    return null;
  }

  const limits = resolveLimits(parameter, entry.role);

  return {
    logSheetId: detail.logSheet.id,
    projectId: detail.logSheet.projectId,
    parameterId: parameter.id,
    parameterName: parameter.name,
    value: entry.numericValue,
    minLimit: limits.minLimit,
    maxLimit: limits.maxLimit,
  };
}

export function buildLimitEvaluationInput(
  detail: ILogSheetDetailView
): TLimitEvaluationEntrySnapshot[] {
  const snapshots: TLimitEvaluationEntrySnapshot[] = [];

  for (const entry of detail.entries) {
    const snapshot = mapEntryToSnapshot(detail, entry);
    if (
      snapshot &&
      snapshot.value !== null &&
      Number.isFinite(snapshot.value)
    ) {
      snapshots.push(snapshot);
    }
  }

  return snapshots;
}
