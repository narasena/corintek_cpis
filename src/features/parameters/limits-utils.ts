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
    if (
      !override ||
      typeof override.parameterId !== 'string' ||
      !override.parameterId
    )
      continue;
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

export interface ICategoryLimitLike {
  parameterId: string;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
}

export interface ILimitResolutionContext {
  categoryId?: string | null;
  categoryLimitsMap?: Map<string, ICategoryLimitLike>;
  overrides?: IParameterOverrideLike[];
}

function buildCategoryLimitMap(
  limits: ICategoryLimitLike[]
): Map<string, ICategoryLimitLike> {
  const map = new Map<string, ICategoryLimitLike>();
  if (!Array.isArray(limits)) return map;
  for (const limit of limits) {
    if (!limit || typeof limit.parameterId !== 'string' || !limit.parameterId)
      continue;
    if (!map.has(limit.parameterId)) map.set(limit.parameterId, limit);
  }
  return map;
}

export function applyProjectLimits<P extends IParameterLike>(
  parameters: P[] | null | undefined,
  context: ILimitResolutionContext
): P[] {
  if (!Array.isArray(parameters) || parameters.length === 0) return [];

  const { categoryLimitsMap, overrides } = context;

  if (!categoryLimitsMap && (!overrides || overrides.length === 0)) {
    return parameters;
  }

  const overrideMap = buildOverrideMap(overrides || []);

  return parameters.map(parameter => {
    const override = overrideMap.get(parameter.id);
    const categoryLimit = categoryLimitsMap?.get(parameter.id);

    let minValue = parameter.minValue;
    let maxValue = parameter.maxValue;
    let rawWaterMinValue = parameter.rawWaterMinValue;
    let rawWaterMaxValue = parameter.rawWaterMaxValue;

    if (categoryLimit) {
      minValue = categoryLimit.minValue ?? minValue;
      maxValue = categoryLimit.maxValue ?? maxValue;
      rawWaterMinValue = categoryLimit.rawWaterMinValue ?? rawWaterMinValue;
      rawWaterMaxValue = categoryLimit.rawWaterMaxValue ?? rawWaterMaxValue;
    }

    if (override) {
      minValue = override.minValue ?? minValue;
      maxValue = override.maxValue ?? maxValue;
      rawWaterMinValue = override.rawWaterMinValue ?? rawWaterMinValue;
      rawWaterMaxValue = override.rawWaterMaxValue ?? rawWaterMaxValue;
    }

    if (
      minValue === parameter.minValue &&
      maxValue === parameter.maxValue &&
      rawWaterMinValue === parameter.rawWaterMinValue &&
      rawWaterMaxValue === parameter.rawWaterMaxValue
    ) {
      return parameter;
    }

    return {
      ...parameter,
      minValue,
      maxValue,
      rawWaterMinValue,
      rawWaterMaxValue,
    };
  });
}

export { buildCategoryLimitMap as buildCategoryLimitsMap };
