'use client';

import { Input } from '@/components/ui/input';
import { makeEntryKey } from '@/features/log-sheets/utils';
import { useEntryStateContext } from '@/features/log-sheets/context';
import { formatLimit } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/utils';
import type { TMachine, TParameter } from '@/features/log-sheets/types';
import { RawWaterInputMobile } from '@/app/(main)/log-sheets/[projectId]/[logSheetId]/components/entry-cells';

interface ICoolingWaterQualityMobileProps {
  category: string;
  params: TParameter[];
  activeCTs: TMachine[];
}

export function CoolingWaterQualityMobile({
  category,
  params,
  activeCTs,
}: ICoolingWaterQualityMobileProps) {
  const { entryState, updateNumber } = useEntryStateContext();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{category}</h2>
      <div className="grid gap-4">
        {params.map(param => (
          <div
            key={param.id}
            className="rounded-lg border bg-card p-4 space-y-4 shadow-sm"
          >
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
              {activeCTs.map(m => {
                const key = makeEntryKey(param.id, m.id, 'VALUE');
                const state = entryState[key];
                return (
                  <div key={key} className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      CT #{m.unitNumber}
                    </div>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="Nilai..."
                      value={
                        state?.numericValue === null ||
                        state?.numericValue === undefined
                          ? ''
                          : String(state.numericValue)
                      }
                      onChange={e => {
                        updateNumber(key, e.target.value);
                      }}
                    />
                  </div>
                );
              })}

              <RawWaterInputMobile param={param} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
