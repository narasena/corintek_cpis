'use client';

import { CameraInput } from '@/components/camera-input';
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
      </div>
    </div>
  );
}

interface IWaterMeterRowProps {
  param: IConsumptionParameter;
  disabled?: boolean;
}

function WaterMeterRow({ param, disabled }: IWaterMeterRowProps) {
  const { getEntry, updateCamera } = useEntryStateContext();
  const entryKey = entryKeys.value(param.id, null);
  const state = getEntry(entryKey);

  const handleCameraChange = (url: string | null, file?: File | null) => {
    updateCamera(entryKey, url, file ?? null);
  };

  return (
    <div className="px-4 py-3">
      <div className="font-medium truncate mb-2">{param.name}</div>
      <CameraInput
        value={state?.fileUrl}
        onChange={handleCameraChange}
        disabled={disabled}
      />
    </div>
  );
}

function isWaterMeterParam(param: IConsumptionParameter): boolean {
  const name = param.name.toLowerCase();
  return name.includes('before') || name.includes('after');
}
