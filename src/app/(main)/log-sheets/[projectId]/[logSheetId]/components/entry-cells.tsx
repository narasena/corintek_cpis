'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell } from '@/components/ui/table';
import { CameraInput } from '@/components/camera-input';
import { makeEntryKey } from '@/features/log-sheets/utils';
import { formatRawWaterLimit, isOutOfRange } from '../utils';
import type { TParameter, TEntryState } from '../types';
import {
  createBooleanEntryUpdater,
  createNumberEntryUpdater,
  createTextEntryUpdater,
  createCameraEntryUpdater,
} from '../entry-state-helpers';

interface IBooleanCellProps {
  state: TEntryState | undefined;
  entryKey: string;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  showClearButton?: boolean;
}

export function BooleanCell({
  state,
  entryKey,
  setEntryState,
  showClearButton = false,
}: IBooleanCellProps) {
  const checked = state?.boolValue ?? false;
  const isIndeterminate =
    state?.boolValue === null || state?.boolValue === undefined;

  return (
    <TableCell className="text-center">
      <div className="flex items-center justify-center gap-2">
        <Checkbox
          checked={isIndeterminate ? false : checked}
          onCheckedChange={value => {
            setEntryState(createBooleanEntryUpdater(entryKey, value === true));
          }}
        />
        {showClearButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setEntryState(createBooleanEntryUpdater(entryKey, null))
            }
          >
            Kosongkan
          </Button>
        )}
      </div>
    </TableCell>
  );
}

interface INumberCellProps {
  state: TEntryState | undefined;
  entryKey: string;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  minValue: number | null;
  maxValue: number | null;
  isWaterMeter?: boolean;
}

export function NumberCell({
  state,
  entryKey,
  setEntryState,
  minValue,
  maxValue,
  isWaterMeter = false,
}: INumberCellProps) {
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
            setEntryState(createNumberEntryUpdater(entryKey, e.target.value));
          }}
        />
        {isWaterMeter && (
          <CameraInput
            value={state?.fileUrl}
            onChange={(url, file) => {
              setEntryState(
                createCameraEntryUpdater(entryKey, url, file ?? null)
              );
            }}
          />
        )}
      </div>
    </TableCell>
  );
}

interface ITextCellProps {
  state: TEntryState | undefined;
  entryKey: string;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
}

export function TextCell({ state, entryKey, setEntryState }: ITextCellProps) {
  return (
    <TableCell>
      <Input
        value={state?.textValue ?? ''}
        onChange={e => {
          setEntryState(createTextEntryUpdater(entryKey, e.target.value));
        }}
      />
    </TableCell>
  );
}

interface IRawWaterCellProps {
  param: TParameter;
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
}

export function RawWaterCell({
  param,
  entryState,
  setEntryState,
}: IRawWaterCellProps) {
  const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
  const rawState = entryState[rawKey];

  if (param.valueType === 'BOOLEAN') {
    return (
      <BooleanCell
        state={rawState}
        entryKey={rawKey}
        setEntryState={setEntryState}
        showClearButton
      />
    );
  }

  if (param.valueType === 'NUMBER') {
    return (
      <NumberCell
        state={rawState}
        entryKey={rawKey}
        setEntryState={setEntryState}
        minValue={param.rawWaterMinValue ?? null}
        maxValue={param.rawWaterMaxValue ?? null}
      />
    );
  }

  return (
    <TextCell
      state={rawState}
      entryKey={rawKey}
      setEntryState={setEntryState}
    />
  );
}

interface IRawWaterInputMobileProps {
  param: TParameter;
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
}

export function RawWaterInputMobile({
  param,
  entryState,
  setEntryState,
}: IRawWaterInputMobileProps) {
  const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
  const rawState = entryState[rawKey];

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
          setEntryState(createNumberEntryUpdater(rawKey, e.target.value));
        }}
      />
    </div>
  );
}

interface INoteCellProps {
  paramId: string;
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
}

export function NoteCell({
  paramId,
  entryState,
  setEntryState,
}: INoteCellProps) {
  const key = makeEntryKey(paramId, null, 'NOTE');
  const state = entryState[key];

  return (
    <Input
      value={state?.textValue ?? ''}
      onChange={e => {
        setEntryState(createTextEntryUpdater(key, e.target.value));
      }}
    />
  );
}
