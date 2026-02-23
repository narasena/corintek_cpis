import type { TPreviewParameter, TEntryState } from '../../types';

export function formatLimit(
  parameter: Pick<
    TPreviewParameter,
    'minValue' | 'maxValue' | 'unit' | 'valueType' | 'category' | 'variableName'
  >
) {
  const min = parameter.minValue;
  const max = parameter.maxValue;

  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${min}-${max}`;
  }

  if (max !== null && max !== undefined) {
    return `≤ ${max}`;
  }

  if (min !== null && min !== undefined) {
    return `≥ ${min}`;
  }

  if (parameter.valueType === 'BOOLEAN') {
    if (parameter.category === 'JOB_DESCRIPTION') return 'Progress/No';
    if (parameter.category === 'GENERAL_CONDITION') {
      if (parameter.variableName.includes('running_')) {
        return 'Running/Stop';
      }
      if (parameter.variableName.includes('deposit')) {
        return 'Normal';
      }
      return 'Yes/No';
    }
    return 'Normal';
  }

  return '';
}

export function formatRawWaterLimit(
  parameter: Pick<
    TPreviewParameter,
    'rawWaterMinValue' | 'rawWaterMaxValue' | 'unit'
  >
) {
  const unit = parameter.unit ? ` ${parameter.unit}` : '';
  const min = parameter.rawWaterMinValue;
  const max = parameter.rawWaterMaxValue;

  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${min}${unit} ~ ${max}${unit}`;
  }

  if (max !== null && max !== undefined) {
    return `≤ ${max}${unit}`;
  }

  if (min !== null && min !== undefined) {
    return `≥ ${min}${unit}`;
  }

  return '';
}

export function formatValue(state?: TEntryState) {
  if (!state) return '';

  if (state.valueType === 'BOOLEAN') {
    if (state.boolValue === null || state.boolValue === undefined) return '';
    return state.boolValue ? 'Yes' : 'No';
  }

  if (state.valueType === 'NUMBER') {
    if (state.numericValue === null || state.numericValue === undefined)
      return '';
    return String(state.numericValue);
  }

  if (state.textValue === null || state.textValue === undefined) return '';
  return state.textValue;
}
