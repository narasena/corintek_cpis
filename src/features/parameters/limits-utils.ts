export interface IParameterLike {
  id: string;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
}

export interface IParameterOverrideLike {
  parameterId: string;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
}

function buildOverrideMap<O extends IParameterOverrideLike>(
  overrides: O[]
): Map<string, O> {
  const map = new Map<string, O>();
  if (!Array.isArray(overrides)) return map;
  for (const override of overrides) {
    if (!override || typeof override.parameterId !== 'string') continue;
    if (!map.has(override.parameterId)) map.set(override.parameterId, override);
  }
  return map;
}

export function applyProjectOverridesToParameters<
  P extends IParameterLike,
  O extends IParameterOverrideLike,
>(parameters: P[], overrides: O[]): P[] {
  if (!Array.isArray(parameters) || parameters.length === 0) return parameters;
  const map = buildOverrideMap(overrides);
  if (map.size === 0) return parameters;
  return parameters.map(parameter => {
    const override = map.get(parameter.id);
    if (!override) return parameter;
    return {
      ...parameter,
      minValue: override.minValue ?? parameter.minValue,
      maxValue: override.maxValue ?? parameter.maxValue,
      rawWaterMinValue: override.rawWaterMinValue ?? parameter.rawWaterMinValue,
      rawWaterMaxValue: override.rawWaterMaxValue ?? parameter.rawWaterMaxValue,
    };
  });
}
