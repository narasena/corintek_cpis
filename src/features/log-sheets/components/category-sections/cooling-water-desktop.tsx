'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { entryKeys } from '@/features/log-sheets/utils';
import {
  formatLimit,
  formatRawWaterLimit,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import {
  BooleanCell,
  NumberCell,
  TextCell,
  RawWaterCell,
} from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

interface ICoolingWaterQualityDesktopProps {
  category: string;
  params: TParameter[];
  activeCTs: TMachine[];
}

export function CoolingWaterQualityDesktop({
  category,
  params,
  activeCTs,
}: ICoolingWaterQualityDesktopProps) {
  return (
    <div className="space-y-3">
      <CategoryHeader title={category} />
      <div className="rounded-md border">
        <Table className="w-max min-w-full">
          <CoolingWaterTableHeader activeCTs={activeCTs} />
          <TableBody>
            {params.map(param => (
              <ParameterRow
                key={param.id}
                param={param}
                activeCTs={activeCTs}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface ICategoryHeaderProps {
  title: string;
}

function CategoryHeader({ title }: ICategoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

interface ICoolingWaterTableHeaderProps {
  activeCTs: TMachine[];
}

function CoolingWaterTableHeader({ activeCTs }: ICoolingWaterTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-muted/40">
        <TableHead className="w-max-plus">Parameter</TableHead>
        <TableHead className="w-max-plus">Limit</TableHead>
        {activeCTs.map(m => (
          <TableHead key={m.id} className="min-w-[100px] text-center">
            CT #{m.unitNumber}
          </TableHead>
        ))}
        <TableHead className="w-max-plus text-center">Raw Water</TableHead>
        <TableHead className="w-max-plus text-center">
          Limit (Raw Water)
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface IParameterRowProps {
  param: TParameter;
  activeCTs: TMachine[];
}

function ParameterRow({ param, activeCTs }: IParameterRowProps) {
  return (
    <TableRow>
      <ParameterNameCell param={param} />
      <TargetCell param={param} />
      {activeCTs.map(m => (
        <CoolingWaterValueCell key={m.id} param={param} machineId={m.id} />
      ))}
      <RawWaterCell param={param} />
      <RawWaterTargetCell param={param} />
    </TableRow>
  );
}

interface IParameterNameCellProps {
  param: TParameter;
}

function ParameterNameCell({ param }: IParameterNameCellProps) {
  const displayName = param.unit ? `${param.name} (${param.unit})` : param.name;
  return (
    <TableCell>
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

interface ICoolingWaterValueCellProps {
  param: TParameter;
  machineId: string;
}

function CoolingWaterValueCell({
  param,
  machineId,
}: ICoolingWaterValueCellProps) {
  const key = entryKeys.value(param.id, machineId);

  if (param.valueType === 'BOOLEAN') {
    return <BooleanCell key={key} entryKey={key} showClearButton />;
  }

  if (param.valueType === 'NUMBER') {
    return (
      <NumberCell
        key={key}
        entryKey={key}
        minValue={param.minValue}
        maxValue={param.maxValue}
      />
    );
  }

  return <TextCell key={key} entryKey={key} />;
}

interface IRawWaterTargetCellProps {
  param: TParameter;
}

function RawWaterTargetCell({ param }: IRawWaterTargetCellProps) {
  const rawWaterLimitValue = formatRawWaterLimit(param);
  return (
    <TableCell className="text-center">{rawWaterLimitValue ?? 'N/A'}</TableCell>
  );
}
