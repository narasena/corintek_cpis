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

function buildDisplayName(name: string, unit: string | null): string {
  return unit ? `${name} (${unit})` : name;
}

export function ParameterHeader({
  name,
  unit,
  minValue,
  maxValue,
  className,
}: IParameterHeaderProps) {
  const limitText = formatNumericLimit(minValue, maxValue, unit);
  const displayName = buildDisplayName(name, unit);

  return (
    <div className={className}>
      <div className="font-medium">{displayName}</div>
      {limitText && (
        <div className="text-xs text-muted-foreground">Limit: {limitText}</div>
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
