'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell } from '@/components/ui/table';
import { CameraInput } from '@/components/camera-input';
import { makeEntryKey } from '@/features/log-sheets/utils';
import { useEntryStateContext } from '@/features/log-sheets/context';
import { formatRawWaterLimit, isOutOfRange } from '../utils';
import type { TParameter } from '../types';

interface IBooleanCellProps {
  entryKey: string;
  showClearButton?: boolean;
}

export function BooleanCell({
  entryKey,
  showClearButton = false,
}: IBooleanCellProps) {
  const { getEntry, updateBoolean } = useEntryStateContext();
  const state = getEntry(entryKey);
  const checked = state?.boolValue ?? false;
  const isIndeterminate =
    state?.boolValue === null || state?.boolValue === undefined;

  return (
    <TableCell className="text-center">
      <div className="flex items-center justify-center gap-2">
        <Checkbox
          checked={isIndeterminate ? false : checked}
          onCheckedChange={value => {
            updateBoolean(entryKey, value === true);
          }}
        />
        {showClearButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => updateBoolean(entryKey, null)}
          >
            Kosongkan
          </Button>
        )}
      </div>
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
  const { getEntry, updateNumber, updateCamera } = useEntryStateContext();
  const state = getEntry(entryKey);
  const isError = isOutOfRange(state?.numericValue, minValue, maxValue);

  return (
    <TableCell>
      <div className="flex flex-col gap-2">
        <Input
          type="number"
          inputMode="decimal"
          className={
            isError ? 'border-red-500 focus-visible:ring-red-500 bg-red-50' : ''
          }
          value={
            state?.numericValue === null || state?.numericValue === undefined
              ? ''
              : String(state.numericValue)
          }
          onChange={e => {
            updateNumber(entryKey, e.target.value);
          }}
        />
        {isWaterMeter && (
          <CameraInput
            value={state?.fileUrl}
            onChange={(url, file) => {
              updateCamera(entryKey, url, file ?? null);
            }}
          />
        )}
      </div>
    </TableCell>
  );
}

interface ITextCellProps {
  entryKey: string;
}

export function TextCell({ entryKey }: ITextCellProps) {
  const { getEntry, updateText } = useEntryStateContext();
  const state = getEntry(entryKey);
  return (
    <TableCell>
      <Input
        value={state?.textValue ?? ''}
        onChange={e => {
          updateText(entryKey, e.target.value);
        }}
      />
    </TableCell>
  );
}

interface IRawWaterCellProps {
  param: TParameter;
}

export function RawWaterCell({ param }: IRawWaterCellProps) {
  const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');

  if (param.valueType === 'BOOLEAN') {
    return <BooleanCell entryKey={rawKey} showClearButton />;
  }

  if (param.valueType === 'NUMBER') {
    return (
      <NumberCell
        entryKey={rawKey}
        minValue={param.rawWaterMinValue ?? null}
        maxValue={param.rawWaterMaxValue ?? null}
      />
    );
  }

  return <TextCell entryKey={rawKey} />;
}

interface IRawWaterInputMobileProps {
  param: TParameter;
}

export function RawWaterInputMobile({ param }: IRawWaterInputMobileProps) {
  const { getEntry, updateNumber } = useEntryStateContext();
  const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
  const rawState = getEntry(rawKey);

  return (
    <div className="space-y-2 pt-2 border-t">
      <div className="flex justify-between items-center">
        <div className="text-xs font-medium text-muted-foreground">
          Raw Water
        </div>
        <div className="text-[10px] text-muted-foreground">
          Target: {formatRawWaterLimit(param)}
        </div>
      </div>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="Nilai Raw Water..."
        value={
          rawState?.numericValue === null ||
          rawState?.numericValue === undefined
            ? ''
            : String(rawState.numericValue)
        }
        onChange={e => {
          updateNumber(rawKey, e.target.value);
        }}
      />
    </div>
  );
}

interface INoteCellProps {
  paramId: string;
}

export function NoteCell({ paramId }: INoteCellProps) {
  const { getEntry, updateText } = useEntryStateContext();
  const key = makeEntryKey(paramId, null, 'NOTE');
  const state = getEntry(key);

  return (
    <Input
      value={state?.textValue ?? ''}
      onChange={e => {
        updateText(key, e.target.value);
      }}
    />
  );
}
