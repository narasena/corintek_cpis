'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CameraInput } from '@/components/camera-input';
import { useEntryStateContext } from '@/features/log-sheets/context';
import { isOutOfRange } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import type { TValueType } from '@/features/parameters/types';

export interface IParameterInputProps {
  entryKey: string;
  valueType: TValueType;
  minValue?: number | null;
  maxValue?: number | null;
  isWaterMeter?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ParameterInput({
  entryKey,
  valueType,
  minValue = null,
  maxValue = null,
  isWaterMeter = false,
  placeholder,
  disabled = false,
}: IParameterInputProps) {
  const { getEntry, updateNumber, updateBoolean, updateText, updateCamera } =
    useEntryStateContext();

  const state = getEntry(entryKey);

  if (valueType === 'BOOLEAN') {
    return (
      <BooleanInput
        entryKey={entryKey}
        state={state}
        disabled={disabled}
        updateBoolean={updateBoolean}
      />
    );
  }

  if (valueType === 'NUMBER') {
    return (
      <NumberInput
        entryKey={entryKey}
        state={state}
        minValue={minValue}
        maxValue={maxValue}
        isWaterMeter={isWaterMeter}
        placeholder={placeholder}
        disabled={disabled}
        updateNumber={updateNumber}
        updateCamera={updateCamera}
      />
    );
  }

  return (
    <TextInput
      entryKey={entryKey}
      state={state}
      placeholder={placeholder}
      disabled={disabled}
      updateText={updateText}
    />
  );
}

interface IBooleanInputProps {
  entryKey: string;
  state: { boolValue?: boolean | null } | undefined;
  disabled: boolean;
  updateBoolean: (key: string, value: boolean | null) => void;
}

function BooleanInput({
  entryKey,
  state,
  disabled,
  updateBoolean,
}: IBooleanInputProps) {
  const checked = state?.boolValue === true;
  const isIndeterminate =
    state?.boolValue === null || state?.boolValue === undefined;

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={isIndeterminate ? false : checked}
        onCheckedChange={v => updateBoolean(entryKey, v === true)}
        disabled={disabled}
      />
      <span className="text-sm">
        {isIndeterminate ? 'Pilih...' : checked ? 'Ya' : 'Tidak'}
      </span>
    </div>
  );
}

interface INumberInputProps {
  entryKey: string;
  state: { numericValue?: number | null; fileUrl?: string | null } | undefined;
  minValue: number | null;
  maxValue: number | null;
  isWaterMeter: boolean;
  placeholder?: string;
  disabled: boolean;
  updateNumber: (key: string, value: string) => void;
  updateCamera: (key: string, url: string | null, file: File | null) => void;
}

function NumberInput({
  entryKey,
  state,
  minValue,
  maxValue,
  isWaterMeter,
  placeholder,
  disabled,
  updateNumber,
  updateCamera,
}: INumberInputProps) {
  const hasError = isOutOfRange(state?.numericValue, minValue, maxValue);
  const displayValue =
    state?.numericValue === null || state?.numericValue === undefined
      ? ''
      : String(state.numericValue);

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="number"
        inputMode="decimal"
        placeholder={placeholder ?? 'Nilai...'}
        className={
          hasError ? 'border-red-500 focus-visible:ring-red-500 bg-red-50' : ''
        }
        value={displayValue}
        onChange={e => updateNumber(entryKey, e.target.value)}
        disabled={disabled}
      />
      {isWaterMeter && (
        <CameraInput
          value={state?.fileUrl}
          onChange={(url, file) => updateCamera(entryKey, url, file ?? null)}
        />
      )}
    </div>
  );
}

interface ITextInputProps {
  entryKey: string;
  state: { textValue?: string | null } | undefined;
  placeholder?: string;
  disabled: boolean;
  updateText: (key: string, value: string) => void;
}

function TextInput({
  entryKey,
  state,
  placeholder,
  disabled,
  updateText,
}: ITextInputProps) {
  return (
    <Input
      placeholder={placeholder ?? 'Keterangan...'}
      value={state?.textValue ?? ''}
      onChange={e => updateText(entryKey, e.target.value)}
      disabled={disabled}
    />
  );
}
