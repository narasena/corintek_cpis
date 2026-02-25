'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

export function MachineSelectionPanel({
  chillers,
  coolingTowers,
  activeChillerIds,
  activeCTIds,
  onToggleMachine,
  onSelectAllMachines,
  onClearMachines,
}: IMachineSelectionPanelProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Unit Mesin Aktif Hari Ini</h3>
        <p className="text-xs text-muted-foreground">
          Pilih unit yang beroperasi untuk menampilkan kolom input.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Chillers</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onSelectAllMachines('CHILLER')}
              >
                Pilih Semua
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => onClearMachines('CHILLER')}
              >
                Kosongkan
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {chillers.map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <Checkbox
                  id={`chiller-${m.id}`}
                  checked={activeChillerIds.includes(m.id)}
                  onCheckedChange={() => onToggleMachine(m.id, 'CHILLER')}
                />
                <label
                  htmlFor={`chiller-${m.id}`}
                  className="text-sm cursor-pointer"
                >
                  #{m.unitNumber}
                </label>
              </div>
            ))}
            {chillers.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada chiller di proyek ini
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cooling Towers</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onSelectAllMachines('COOLING_TOWER')}
              >
                Pilih Semua
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => onClearMachines('COOLING_TOWER')}
              >
                Kosongkan
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {coolingTowers.map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <Checkbox
                  id={`ct-${m.id}`}
                  checked={activeCTIds.includes(m.id)}
                  onCheckedChange={() => onToggleMachine(m.id, 'COOLING_TOWER')}
                />
                <label
                  htmlFor={`ct-${m.id}`}
                  className="text-sm cursor-pointer"
                >
                  #{m.unitNumber}
                </label>
              </div>
            ))}
            {coolingTowers.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada cooling tower di proyek ini
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
