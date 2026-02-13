'use client';

import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CameraInput } from '@/components/camera-input';
import { makeEntryKey } from '@/features/log-sheets/utils';

import { formatLimit, isOutOfRange } from '../utils';
import type { TEntryState, TMachine, TParameter } from '../types';

export interface MobileEntryCardProps {
  param: TParameter;
  machines: TMachine[];
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  hasNotes?: boolean;
  isWaterMeter?: (paramName: string) => boolean;
}

export function MobileEntryCard({
  param,
  machines,
  entryState,
  setEntryState,
  hasNotes,
  isWaterMeter,
}: MobileEntryCardProps) {
  const targets =
    machines.length > 0
      ? machines
      : ([
          {
            id: 'null',
            unitNumber: 0,
            type: 'CHILLER' as const,
          },
        ] as TMachine[]);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 shadow-sm">
      <div className="flex items-start justify-between border-b pb-2">
        <div>
          <h3 className="font-semibold text-sm">
            {param.name}
            {param.unit ? ` (${param.unit})` : ''}
          </h3>
          <p className="text-xs text-muted-foreground">
            Target: {formatLimit(param)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {targets.map(m => {
          const machineIdValue = machines.length > 0 ? m.id : null;
          const key = makeEntryKey(param.id, machineIdValue, 'VALUE');
          const state = entryState[key];

          return (
            <div key={key} className="space-y-2">
              {machines.length > 0 && (
                <div className="text-xs font-medium text-muted-foreground">
                  {m.type === 'CHILLER' ? 'Chiller' : 'CT'} #{m.unitNumber}
                </div>
              )}

              {param.valueType === 'BOOLEAN' ? (
                <div className="flex items-center gap-4">
                  <Checkbox
                    id={key}
                    checked={state?.boolValue ?? false}
                    onCheckedChange={value => {
                      setEntryState(prev => ({
                        ...prev,
                        [key]: {
                          valueType: 'BOOLEAN',
                          boolValue: value === true,
                        },
                      }));
                    }}
                  />
                  <label htmlFor={key} className="text-sm">
                    {state?.boolValue === true
                      ? 'Ya'
                      : state?.boolValue === false
                        ? 'Tidak'
                        : 'Pilih...'}
                  </label>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-7 text-xs ml-auto"
                    onClick={() =>
                      setEntryState(prev => ({
                        ...prev,
                        [key]: { valueType: 'BOOLEAN', boolValue: null },
                      }))
                    }
                  >
                    Kosongkan
                  </Button>
                </div>
              ) : param.valueType === 'NUMBER' ? (
                <div className="flex flex-col gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Nilai..."
                    className={
                      isOutOfRange(
                        state?.numericValue,
                        param.minValue,
                        param.maxValue
                      )
                        ? 'border-red-500 focus-visible:ring-red-500 bg-red-50'
                        : ''
                    }
                    value={
                      state?.numericValue === null ||
                      state?.numericValue === undefined
                        ? ''
                        : String(state.numericValue)
                    }
                    onChange={e => {
                      const raw = e.target.value;
                      setEntryState(prev => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          valueType: 'NUMBER',
                          numericValue: raw === '' ? null : Number(raw),
                        },
                      }));
                    }}
                  />
                  {isWaterMeter?.(param.name) && (
                    <CameraInput
                      value={state?.fileUrl}
                      onChange={(url, file) => {
                        setEntryState(prev => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            valueType: 'NUMBER',
                            numericValue: prev[key]?.numericValue ?? null,
                            fileUrl: url,
                            pendingFile: file,
                          },
                        }));
                      }}
                    />
                  )}
                </div>
              ) : (
                <Input
                  placeholder="Keterangan..."
                  value={state?.textValue ?? ''}
                  onChange={e => {
                    const raw = e.target.value;
                    setEntryState(prev => ({
                      ...prev,
                      [key]: { valueType: 'TEXT', textValue: raw },
                    }));
                  }}
                />
              )}
            </div>
          );
        })}

        {hasNotes && (
          <div className="pt-2 border-t mt-2">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Catatan
            </div>
            {(() => {
              const key = makeEntryKey(param.id, null, 'NOTE');
              const state = entryState[key];
              return (
                <Input
                  placeholder="Catatan tambahan..."
                  value={state?.textValue ?? ''}
                  onChange={e => {
                    setEntryState(prev => ({
                      ...prev,
                      [key]: { valueType: 'TEXT', textValue: e.target.value },
                    }));
                  }}
                />
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
