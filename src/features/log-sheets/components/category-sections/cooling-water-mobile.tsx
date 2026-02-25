'use client';

import { entryKeys } from '@/features/log-sheets/utils';
import {
  ParameterHeader,
  ParameterInput,
} from '@/features/log-sheets/components/inputs';
import { formatMachineLabel } from '@/features/log-sheets/option-a/components/shared-ui';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import { RawWaterInputMobile } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

interface ICoolingWaterQualityMobileProps {
  category: string;
  params: TParameter[];
  activeCTs: TMachine[];
}

export function CoolingWaterQualityMobile({
  category,
  params,
  activeCTs,
}: ICoolingWaterQualityMobileProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{category}</h2>
      <div className="grid gap-4">
        {params.map(param => (
          <CoolingWaterParamCard
            key={param.id}
            param={param}
            activeCTs={activeCTs}
          />
        ))}
      </div>
    </div>
  );
}

interface ICoolingWaterParamCardProps {
  param: TParameter;
  activeCTs: TMachine[];
}

function CoolingWaterParamCard({
  param,
  activeCTs,
}: ICoolingWaterParamCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 shadow-sm">
      <ParameterHeader
        name={param.name}
        unit={param.unit}
        minValue={param.minValue}
        maxValue={param.maxValue}
        className="border-b pb-2"
      />
      <div className="space-y-4">
        {activeCTs.map(m => (
          <CoolingTowerInput key={m.id} param={param} machine={m} />
        ))}
        <RawWaterInputMobile param={param} />
      </div>
    </div>
  );
}

interface ICoolingTowerInputProps {
  param: TParameter;
  machine: TMachine;
}

function CoolingTowerInput({ param, machine }: ICoolingTowerInputProps) {
  const entryKey = entryKeys.value(param.id, machine.id);
  const label = formatMachineLabel(machine.type, machine.unitNumber);

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <ParameterInput
        entryKey={entryKey}
        valueType={param.valueType}
        minValue={param.minValue}
        maxValue={param.maxValue}
      />
    </div>
  );
}
