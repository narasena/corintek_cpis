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
  allCoolingTowers: TMachine[];
}

export function CoolingWaterQualityDesktop({
  category,
  params,
  activeCTs,
  allCoolingTowers,
}: ICoolingWaterQualityDesktopProps) {
  const activeMachineIds = new Set(activeCTs.map(m => m.id));
  const displayMachines =
    allCoolingTowers.length > 0 ? allCoolingTowers : activeCTs;

  return (
    <div className="space-y-3">
      <CategoryHeader title={category} />
      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full table-fixed">
          <CoolingWaterTableHeader
            activeCTs={activeCTs}
            allCoolingTowers={allCoolingTowers}
          />
          <TableBody>
            {params.map(param => (
              <ParameterRow
                key={param.id}
                param={param}
                activeCTs={activeCTs}
                allCoolingTowers={allCoolingTowers}
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
  allCoolingTowers: TMachine[];
}

function CoolingWaterTableHeader({
  activeCTs,
  allCoolingTowers,
}: ICoolingWaterTableHeaderProps) {
  const activeMachineIds = new Set(activeCTs.map(m => m.id));

  return (
    <TableHeader>
      <TableRow className="bg-muted/40">
        <TableHead className="w-[180px]">Parameter</TableHead>
        <TableHead className="w-[100px]">Limit</TableHead>
        {allCoolingTowers.map(m => (
          <TableHead
            key={m.id}
            className={
              activeMachineIds.has(m.id)
                ? 'text-center'
                : 'text-center bg-muted/30 text-muted-foreground'
            }
          >
            CT #{m.unitNumber}
            {!activeMachineIds.has(m.id) && (
              <div className="text-[10px]">Tidak Aktif</div>
            )}
          </TableHead>
        ))}
        <TableHead className="w-[100px] text-center">Raw Water</TableHead>
        <TableHead className="w-[120px] text-center">Limit (Raw)</TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface IParameterRowProps {
  param: TParameter;
  activeCTs: TMachine[];
  allCoolingTowers: TMachine[];
}

function ParameterRow({
  param,
  activeCTs,
  allCoolingTowers,
}: IParameterRowProps) {
  const activeMachineIds = new Set(activeCTs.map(m => m.id));

  return (
    <TableRow>
      <ParameterNameCell param={param} />
      <TargetCell param={param} />
      {allCoolingTowers.map(m => (
        <CoolingWaterValueCell
          key={m.id}
          param={param}
          machineId={m.id}
          isActive={activeMachineIds.has(m.id)}
        />
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
  isActive: boolean;
}

function CoolingWaterValueCell({
  param,
  machineId,
  isActive,
}: ICoolingWaterValueCellProps) {
  const key = entryKeys.value(param.id, machineId);

  if (!isActive) {
    return (
      <TableCell className="bg-muted/20 text-muted-foreground text-center">
        -
      </TableCell>
    );
  }

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
