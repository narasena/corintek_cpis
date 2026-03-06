'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { entryKeys } from '@/features/log-sheets/utils';
import { formatLimit } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import { isWaterMeterParam } from '../category-config';
import {
  BooleanCell,
  NumberCell,
  TextCell,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

interface IParameterTableRowProps {
  param: TParameter;
  machines: TMachine[];
  allMachines: TMachine[];
  cat: TParameter['category'];
  showLimitColumn?: boolean;
}

export function ParameterTableRow({
  param,
  machines,
  allMachines,
  cat,
  showLimitColumn = true,
}: IParameterTableRowProps) {
  const activeMachineIds = new Set(machines.map(m => m.id));
  const displayMachines = allMachines.length > 0 ? allMachines : machines;

  return (
    <TableRow>
      <ParameterNameCell param={param} />
      {showLimitColumn && <TargetCell param={param} />}
      {displayMachines.map(m => (
        <ValueCell
          key={m.id}
          param={param}
          machine={m}
          isActive={activeMachineIds.has(m.id)}
          hasMachines={machines.length > 0}
          cat={cat}
        />
      ))}
    </TableRow>
  );
}

interface IParameterNameCellProps {
  param: TParameter;
}

function ParameterNameCell({ param }: IParameterNameCellProps) {
  const displayName = param.unit ? `${param.name} (${param.unit})` : param.name;
  return (
    <TableCell className="w-max-plus!">
      <div className="font-medium">{displayName}</div>
    </TableCell>
  );
}

interface ITargetCellProps {
  param: TParameter;
}

function TargetCell({ param }: ITargetCellProps) {
  const limitValue = formatLimit(param);
  return <TableCell>{limitValue ?? 'N/A'}</TableCell>;
}

interface IValueCellProps {
  param: TParameter;
  machine: TMachine;
  isActive: boolean;
  hasMachines: boolean;
  cat: TParameter['category'];
}

function ValueCell({
  param,
  machine,
  isActive,
  hasMachines,
  cat,
}: IValueCellProps) {
  if (!isActive) {
    return (
      <TableCell className="bg-muted/20 text-muted-foreground text-center">
        -
      </TableCell>
    );
  }

  const machineId = hasMachines ? machine.id : null;
  const key = entryKeys.value(param.id, machineId);
  const isWaterMeter = isWaterMeterParam(param.name, cat);

  if (param.valueType === 'BOOLEAN') {
    return <BooleanCell key={key} entryKey={key} />;
  }

  if (param.valueType === 'NUMBER') {
    return (
      <NumberCell
        key={key}
        entryKey={key}
        minValue={param.minValue}
        maxValue={param.maxValue}
        isWaterMeter={isWaterMeter}
      />
    );
  }

  return <TextCell key={key} entryKey={key} />;
}
