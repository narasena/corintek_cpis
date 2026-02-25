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
  NoteCell,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

interface IParameterTableRowProps {
  param: TParameter;
  machines: TMachine[];
  hasNotes: boolean;
  cat: TParameter['category'];
}

export function ParameterTableRow({
  param,
  machines,
  hasNotes,
  cat,
}: IParameterTableRowProps) {
  const targets = getTargetMachines(machines);

  return (
    <TableRow>
      <ParameterNameCell param={param} />
      <TargetCell param={param} />
      {targets.map(m => (
        <ValueCell
          key={m.id}
          param={param}
          machine={m}
          hasMachines={machines.length > 0}
          cat={cat}
        />
      ))}
      {hasNotes && <NoteCell paramId={param.id} />}
    </TableRow>
  );
}

function getTargetMachines(machines: TMachine[]): TMachine[] {
  if (machines.length > 0) return machines;
  return [{ id: 'null', unitNumber: 0, type: 'CHILLER' }] as TMachine[];
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
  return <TableCell>{formatLimit(param)}</TableCell>;
}

interface IValueCellProps {
  param: TParameter;
  machine: TMachine;
  hasMachines: boolean;
  cat: TParameter['category'];
}

function ValueCell({ param, machine, hasMachines, cat }: IValueCellProps) {
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
