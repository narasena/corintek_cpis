'use client';

import { Input } from '@/components/ui/input';
import { entryKeys } from '@/features/log-sheets/utils';
import { useEntryStateContext } from '@/features/log-sheets/context';
import {
  ParameterHeader,
  ParameterInput,
} from '@/features/log-sheets/components/inputs';
import type { TMachine, TParameter } from '../types';

export interface IMobileEntryCardProps {
  param: TParameter;
  machines: TMachine[];
  hasNotes?: boolean;
  isWaterMeter?: (paramName: string) => boolean;
}

export function MobileEntryCard({
  param,
  machines,
  hasNotes,
  isWaterMeter,
}: IMobileEntryCardProps) {
  const targets = getTargetMachines(machines);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 shadow-sm">
      <ParameterHeader
        name={param.name}
        unit={param.unit}
        minValue={param.minValue}
        maxValue={param.maxValue}
        className="border-b pb-2"
      />
      <MachineInputs
        param={param}
        machines={targets}
        hasMachines={machines.length > 0}
        isWaterMeter={isWaterMeter}
      />
      {hasNotes && <NoteInput paramId={param.id} />}
    </div>
  );
}

function getTargetMachines(machines: TMachine[]): TMachine[] {
  if (machines.length > 0) return machines;
  return [{ id: 'null', unitNumber: 0, type: 'CHILLER' }] as TMachine[];
}

interface IMachineInputsProps {
  param: TParameter;
  machines: TMachine[];
  hasMachines: boolean;
  isWaterMeter?: (paramName: string) => boolean;
}

function MachineInputs({
  param,
  machines,
  hasMachines,
  isWaterMeter,
}: IMachineInputsProps) {
  return (
    <div className="space-y-4">
      {machines.map(m => (
        <MachineInputRow
          key={m.id}
          param={param}
          machine={m}
          hasMachines={hasMachines}
          isWaterMeter={isWaterMeter}
        />
      ))}
    </div>
  );
}

interface IMachineInputRowProps {
  param: TParameter;
  machine: TMachine;
  hasMachines: boolean;
  isWaterMeter?: (paramName: string) => boolean;
}

function MachineInputRow({
  param,
  machine,
  hasMachines,
  isWaterMeter,
}: IMachineInputRowProps) {
  const machineId = hasMachines ? machine.id : null;
  const entryKey = entryKeys.value(param.id, machineId);
  const showCamera = isWaterMeter?.(param.name) ?? false;

  return (
    <div className="space-y-2">
      {hasMachines && <MachineLabel machine={machine} />}
      <ParameterInput
        entryKey={entryKey}
        valueType={param.valueType}
        minValue={param.minValue}
        maxValue={param.maxValue}
        isWaterMeter={showCamera}
        showClearButton={param.valueType === 'BOOLEAN'}
      />
    </div>
  );
}

interface IMachineLabelProps {
  machine: TMachine;
}

function MachineLabel({ machine }: IMachineLabelProps) {
  const label =
    machine.type === 'CHILLER'
      ? `Chiller #${machine.unitNumber}`
      : `CT #${machine.unitNumber}`;
  return (
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
  );
}

interface INoteInputProps {
  paramId: string;
}

function NoteInput({ paramId }: INoteInputProps) {
  const { getEntry, updateText } = useEntryStateContext();
  const key = entryKeys.note(paramId);
  const state = getEntry(key);

  return (
    <div className="pt-2 border-t mt-2">
      <div className="text-xs font-medium text-muted-foreground mb-1">
        Catatan
      </div>
      <Input
        placeholder="Catatan tambahan..."
        value={state?.textValue ?? ''}
        onChange={e => updateText(key, e.target.value)}
      />
    </div>
  );
}
