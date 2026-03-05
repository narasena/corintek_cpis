'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TMachine } from '../types';

type TMachineType = 'CHILLER' | 'COOLING_TOWER';

interface IMachineSelectionPanelProps {
  chillers: TMachine[];
  coolingTowers: TMachine[];
  activeChillerIds: string[];
  activeCTIds: string[];
  onToggleMachine: (machineId: string, type: TMachineType) => void;
  onSelectAllMachines: (type: TMachineType) => void;
  onClearMachines: (type: TMachineType) => void;
}

interface IMachineCardProps {
  machine: TMachine;
  isActive: boolean;
  onToggle: () => void;
  type: TMachineType;
}

function MachineCard({ machine, isActive, onToggle, type }: IMachineCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 min-w-[80px]',
        'active:scale-95 touch-manipulation',
        isActive
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/50'
      )}
    >
      {isActive && (
        <div className="absolute top-1 right-1">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}
      <span className="text-lg font-bold">#{machine.unitNumber}</span>
      <span
        className={cn(
          'text-[10px] uppercase font-medium mt-1',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {isActive ? 'Aktif' : 'Nonaktif'}
      </span>
    </button>
  );
}

interface IMachineGroupProps {
  title: string;
  machines: TMachine[];
  activeIds: string[];
  type: TMachineType;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

function MachineGroup({
  title,
  machines,
  activeIds,
  type,
  onToggle,
  onSelectAll,
  onClear,
}: IMachineGroupProps) {
  const activeCount = activeIds.length;
  const totalCount = machines.length;

  if (totalCount === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="text-sm text-muted-foreground italic py-2">
          Tidak ada {title.toLowerCase()} di proyek ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground ml-2">
            ({activeCount}/{totalCount} aktif)
          </span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded transition-colors"
          >
            Semua
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-xs px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            Kosong
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {machines.map(m => (
          <MachineCard
            key={m.id}
            machine={m}
            isActive={activeIds.includes(m.id)}
            onToggle={() => onToggle(m.id)}
            type={type}
          />
        ))}
      </div>
    </div>
  );
}

export function MachineSelectionPanel({
  chillers,
  coolingTowers,
  activeChillerIds,
  activeCTIds,
  onToggleMachine,
  onSelectAllMachines,
  onClearMachines,
}: IMachineSelectionPanelProps) {
  const totalActive = activeChillerIds.length + activeCTIds.length;
  const totalMachines = chillers.length + coolingTowers.length;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="font-semibold">Unit Mesin Aktif</h3>
          <p className="text-xs text-muted-foreground">
            Ketuk unit untuk mengaktifkan/nonaktifkan ({totalActive}/
            {totalMachines})
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MachineGroup
          title="Chillers"
          machines={chillers}
          activeIds={activeChillerIds}
          type="CHILLER"
          onToggle={id => onToggleMachine(id, 'CHILLER')}
          onSelectAll={() => onSelectAllMachines('CHILLER')}
          onClear={() => onClearMachines('CHILLER')}
        />

        <MachineGroup
          title="Cooling Towers"
          machines={coolingTowers}
          activeIds={activeCTIds}
          type="COOLING_TOWER"
          onToggle={id => onToggleMachine(id, 'COOLING_TOWER')}
          onSelectAll={() => onSelectAllMachines('COOLING_TOWER')}
          onClear={() => onClearMachines('COOLING_TOWER')}
        />
      </div>
    </div>
  );
}
