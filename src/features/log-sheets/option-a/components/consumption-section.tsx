'use client';

import { CameraInput } from '@/components/camera-input';
import { Input } from '@/components/ui/input';
import { useEntryStateContext } from '../../context';
import { entryKeys } from '../../utils';

interface IConsumptionParameter {
  id: string;
  name: string;
  unit: string | null;
}

interface IConsumptionSectionProps {
  parameters: IConsumptionParameter[];
  disabled?: boolean;
}

export function ConsumptionSection({
  parameters,
  disabled,
}: IConsumptionSectionProps) {
  const waterMeterParams = parameters.filter(isWaterMeterParam);
  const totalParam = parameters.find(p =>
    p.name.toLowerCase().includes('total')
  );

  if (waterMeterParams.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-medium">Water Meter</h3>
      </div>
      <div className="divide-y">
        {waterMeterParams.map(param => (
          <WaterMeterRow key={param.id} param={param} disabled={disabled} />
        ))}
        {totalParam && <TotalRow param={totalParam} disabled={disabled} />}
      </div>
    </div>
  );
}

interface IWaterMeterRowProps {
  param: IConsumptionParameter;
  disabled?: boolean;
}

function WaterMeterRow({ param, disabled }: IWaterMeterRowProps) {
  const { getEntry, updateNumber, updateCamera } = useEntryStateContext();
  const entryKey = entryKeys.value(param.id, null);
  const state = getEntry(entryKey);

  const displayValue =
    state?.numericValue !== null && state?.numericValue !== undefined
      ? String(state.numericValue)
      : '';

  const handleNumberChange = (value: string) => {
    updateNumber(entryKey, value);
  };

  const handleCameraChange = (url: string | null, file?: File | null) => {
    updateCamera(entryKey, url, file ?? null);
  };

  const isBefore = param.name.toLowerCase().includes('before');

  return (
    <div className="px-4 py-3">
      <div className="font-medium truncate mb-2">{param.name}</div>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Nilai..."
            value={displayValue}
            onChange={e => handleNumberChange(e.target.value)}
            disabled={disabled}
          />
        </div>
        {isBefore && (
          <div className="flex-shrink-0">
            <CameraInput
              value={state?.fileUrl}
              onChange={handleCameraChange}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface ITotalRowProps {
  param: IConsumptionParameter;
  disabled?: boolean;
}

function TotalRow({ param, disabled }: ITotalRowProps) {
  const { getEntry } = useEntryStateContext();
  const entryKey = entryKeys.value(param.id, null);
  const state = getEntry(entryKey);

  const displayValue =
    state?.numericValue !== null && state?.numericValue !== undefined
      ? String(state.numericValue)
      : '-';

  return (
    <div className="px-4 py-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="font-medium truncate">{param.name}</div>
        <div className="font-semibold text-lg">
          {displayValue} {param.unit || ''}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Auto-calculated from (After - Before)
      </div>
    </div>
  );
}

function isWaterMeterParam(param: IConsumptionParameter): boolean {
  const name = param.name.toLowerCase();
  return name.includes('before') || name.includes('after');
}
