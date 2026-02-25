'use client';

import { Input } from '@/components/ui/input';
import { TableCell } from '@/components/ui/table';
import { entryKeys } from '@/features/log-sheets/utils';
import { useEntryStateContext } from '@/features/log-sheets/context';
import { ParameterInput } from '@/features/log-sheets/components/inputs';
import { formatRawWaterLimit } from '../utils';
import type { TParameter } from '../types';

interface IBooleanCellProps {
  entryKey: string;
  showClearButton?: boolean;
}

export function BooleanCell({
  entryKey,
  showClearButton = false,
}: IBooleanCellProps) {
  return (
    <TableCell className="text-center">
      <ParameterInput
        entryKey={entryKey}
        valueType="BOOLEAN"
        showClearButton={showClearButton}
      />
    </TableCell>
  );
}

interface INumberCellProps {
  entryKey: string;
  minValue: number | null;
  maxValue: number | null;
  isWaterMeter?: boolean;
}

export function NumberCell({
  entryKey,
  minValue,
  maxValue,
  isWaterMeter = false,
}: INumberCellProps) {
  return (
    <TableCell>
      <ParameterInput
        entryKey={entryKey}
        valueType="NUMBER"
        minValue={minValue}
        maxValue={maxValue}
        isWaterMeter={isWaterMeter}
      />
    </TableCell>
  );
}

interface ITextCellProps {
  entryKey: string;
}

export function TextCell({ entryKey }: ITextCellProps) {
  return (
    <TableCell>
      <ParameterInput entryKey={entryKey} valueType="TEXT" />
    </TableCell>
  );
}

interface IRawWaterCellProps {
  param: TParameter;
}

export function RawWaterCell({ param }: IRawWaterCellProps) {
  const rawKey = entryKeys.rawWater(param.id);

  return (
    <TableCell>
      <ParameterInput
        entryKey={rawKey}
        valueType={param.valueType}
        minValue={param.rawWaterMinValue ?? null}
        maxValue={param.rawWaterMaxValue ?? null}
        showClearButton={param.valueType === 'BOOLEAN'}
      />
    </TableCell>
  );
}

interface IRawWaterInputMobileProps {
  param: TParameter;
}

export function RawWaterInputMobile({ param }: IRawWaterInputMobileProps) {
  const { getEntry, updateNumber } = useEntryStateContext();
  const rawKey = entryKeys.rawWater(param.id);
  const rawState = getEntry(rawKey);
  const displayValue =
    rawState?.numericValue === null || rawState?.numericValue === undefined
      ? ''
      : String(rawState.numericValue);

  return (
    <div className="space-y-2 pt-2 border-t">
      <RawWaterHeader param={param} />
      <Input
        type="number"
        inputMode="decimal"
        placeholder="Nilai Raw Water..."
        value={displayValue}
        onChange={e => updateNumber(rawKey, e.target.value)}
      />
    </div>
  );
}

interface IRawWaterHeaderProps {
  param: TParameter;
}

function RawWaterHeader({ param }: IRawWaterHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-xs font-medium text-muted-foreground">Raw Water</div>
      <div className="text-[10px] text-muted-foreground">
        Target: {formatRawWaterLimit(param)}
      </div>
    </div>
  );
}

interface INoteCellProps {
  paramId: string;
}

export function NoteCell({ paramId }: INoteCellProps) {
  const { getEntry, updateText } = useEntryStateContext();
  const key = entryKeys.note(paramId);
  const state = getEntry(key);

  return (
    <Input
      value={state?.textValue ?? ''}
      onChange={e => updateText(key, e.target.value)}
    />
  );
}
