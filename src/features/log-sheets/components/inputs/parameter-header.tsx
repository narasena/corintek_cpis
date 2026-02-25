'use client';

import type { TParameter } from '@/features/log-sheets/types';
import { formatNumericLimit } from '@/features/parameters/limits-format';

export interface IParameterHeaderProps {
  name: string;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  className?: string;
}

export function ParameterHeader({
  name,
  unit,
  minValue,
  maxValue,
  className,
}: IParameterHeaderProps) {
  const targetText = formatNumericLimit(minValue, maxValue, unit);
  const displayName = unit ? `${name} (${unit})` : name;
  const hasTarget = targetText && targetText !== '-';

  return (
    <div className={className}>
      <div className="font-medium">{displayName}</div>
      {hasTarget && (
        <div className="text-xs text-muted-foreground">
          Target: {targetText}
        </div>
      )}
    </div>
  );
}

export function parameterHeaderFromParameter(
  param: Pick<TParameter, 'name' | 'unit' | 'minValue' | 'maxValue'>
) {
  return {
    name: param.name,
    unit: param.unit,
    minValue: param.minValue,
    maxValue: param.maxValue,
  };
}
