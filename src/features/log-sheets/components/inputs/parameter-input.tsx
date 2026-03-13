'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CameraInput } from '@/components/camera-input';
import { useEntryStateContext } from '@/features/log-sheets/context';
import { isOutOfRange } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import { RangeStatusIcon } from './range-status-icon';
import type { TValueType } from '@/features/parameters/types';

export interface IParameterInputProps {
  entryKey: string;
  valueType: TValueType;
  minValue?: number | null;
  maxValue?: number | null;
  isWaterMeter?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showClearButton?: boolean;
}

export function ParameterInput({
  entryKey,
  valueType,
  minValue = null,
  maxValue = null,
  isWaterMeter = false,
  placeholder,
  disabled = false,
  showClearButton = false,
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
        showClearButton={showClearButton}
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
        showClearButton={showClearButton}
        updateNumber={updateNumber}
        updateCamera={updateCamera}
        clearNumber={() => updateNumber(entryKey, '')}
      />
    );
  }

  return (
    <TextInput
      entryKey={entryKey}
      state={state}
      placeholder={placeholder}
      disabled={disabled}
      showClearButton={showClearButton}
      updateText={updateText}
      clearText={() => updateText(entryKey, '')}
    />
  );
}

interface IBooleanInputProps {
  entryKey: string;
  state: { boolValue?: boolean | null } | undefined;
  disabled: boolean;
  showClearButton: boolean;
  updateBoolean: (key: string, value: boolean | null) => void;
}

function BooleanInput({
  entryKey,
  state,
  disabled,
  showClearButton,
  updateBoolean,
}: IBooleanInputProps) {
  const checked = state?.boolValue === true;
  const isIndeterminate =
    state?.boolValue === null || state?.boolValue === undefined;

  return (
    <div className="flex items-center justify-center gap-2">
      <Checkbox
        checked={isIndeterminate ? false : checked}
        onCheckedChange={v => updateBoolean(entryKey, v === true)}
        disabled={disabled}
      />
      <span className="text-sm">
        {isIndeterminate ? 'Pilih...' : checked ? 'Ya' : 'Tidak'}
      </span>
      {showClearButton &&
        state?.boolValue !== null &&
        state?.boolValue !== undefined && (
          <button
            type="button"
            onClick={() => updateBoolean(entryKey, null)}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 ml-1"
          >
            Hapus
          </button>
        )}
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
  showClearButton: boolean;
  updateNumber: (key: string, value: string) => void;
  updateCamera: (key: string, url: string | null, file: File | null) => void;
  clearNumber: () => void;
}

function buildInputClass(hasError: boolean): string {
  const baseClass = 'w-24';
  const errorClass = 'border-red-500 focus-visible:ring-red-500 bg-red-50';
  return hasError ? `${baseClass} ${errorClass}` : baseClass;
}

function formatTargetRange(
  min: number | null,
  max: number | null
): string | null {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;

  if (hasMin && hasMax) return `${min} - ${max}`;
  if (hasMin) return `≥ ${min}`;
  if (hasMax) return `≤ ${max}`;
  return null;
}

function NumberInput({
  entryKey,
  state,
  minValue,
  maxValue,
  isWaterMeter,
  placeholder,
  disabled,
  showClearButton,
  updateNumber,
  updateCamera,
  clearNumber,
}: INumberInputProps) {
  const numericValue = state?.numericValue;
  const hasError = isOutOfRange(numericValue, minValue, maxValue);
  const displayValue =
    numericValue === null || numericValue === undefined
      ? ''
      : String(numericValue);
  const hasValue = numericValue !== null && numericValue !== undefined;

  // Determine if we should show out-of-range icon
  // Only show when: has value AND is out of range
  const inRange: boolean | null = hasValue ? !hasError : null;

  const targetRangeText = formatTargetRange(minValue, maxValue);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={placeholder ?? 'Nilai...'}
          className={buildInputClass(hasError)}
          value={displayValue}
          onChange={e => updateNumber(entryKey, e.target.value)}
          onWheel={e => e.currentTarget.blur()}
          disabled={disabled}
        />
        <RangeStatusIcon inRange={inRange} />
        {showClearButton && hasValue && (
          <button
            type="button"
            onClick={clearNumber}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap disabled:opacity-50"
          >
            Hapus
          </button>
        )}
      </div>
      {targetRangeText && (
        <div className="text-[10px] text-muted-foreground">
          Target: {targetRangeText}
        </div>
      )}
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
  showClearButton: boolean;
  updateText: (key: string, value: string) => void;
  clearText: () => void;
}

function TextInput({
  entryKey,
  state,
  placeholder,
  disabled,
  showClearButton,
  updateText,
  clearText,
}: ITextInputProps) {
  const hasValue =
    state?.textValue !== null &&
    state?.textValue !== undefined &&
    state.textValue !== '';

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder={placeholder ?? 'Keterangan...'}
        value={state?.textValue ?? ''}
        onChange={e => updateText(entryKey, e.target.value)}
        disabled={disabled}
      />
      {showClearButton && hasValue && (
        <button
          type="button"
          onClick={clearText}
          disabled={disabled}
          className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap disabled:opacity-50"
        >
          Hapus
        </button>
      )}
    </div>
  );
}
