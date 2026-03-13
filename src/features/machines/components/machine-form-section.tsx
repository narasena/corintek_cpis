'use client';

import { useFieldArray, Control } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  MachineOwnershipEnum,
  MachineStatusEnum,
} from '@/features/machines/types';
import { TCreateProject } from '@/features/projects/types';
import { createDefaultMachine } from '../helpers';

interface IMachineFormSectionProps {
  control: Control<TCreateProject>;
}

export function MachineFormSection({ control }: IMachineFormSectionProps) {
  const {
    fields: machineFields,
    append: appendMachine,
    remove: removeMachine,
  } = useFieldArray({
    control,
    name: 'machines',
  });

  const addChiller = () => {
    appendMachine(
      createDefaultMachine('CHILLER', (machineFields.length || 0) + 1)
    );
  };

  const addCoolingTower = () => {
    appendMachine(
      createDefaultMachine('COOLING_TOWER', (machineFields.length || 0) + 1)
    );
  };

  // Group machines by type
  const chillers = machineFields
    .map((field, index) => ({ field, index }))
    .filter(item => item.field.type === 'CHILLER');

  const coolingTowers = machineFields
    .map((field, index) => ({ field, index }))
    .filter(item => item.field.type === 'COOLING_TOWER');

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-3 border-b mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h3 className="text-lg font-semibold tracking-tight">
            Mesin ({machineFields.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChiller}
              className="h-8 shadow-xs transition-all hover:bg-accent"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Chiller</span>
              <span className="hidden xs:inline ml-1">Baru</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCoolingTower}
              className="h-8 shadow-xs transition-all hover:bg-accent"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>CT</span>
              <span className="hidden xs:inline ml-1">Baru</span>
            </Button>
          </div>
        </div>
      </div>

      {machineFields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada mesin. Klik tombol di atas untuk menambah mesin (opsional).
        </p>
      )}

      {/* Chillers Section */}
      {chillers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Chiller ({chillers.length})
          </h4>
          {chillers.map(({ field, index }, displayIndex) => (
            <MachineCard
              key={field.id}
              control={control}
              index={index}
              displayIndex={displayIndex}
              type="CHILLER"
              onRemove={() => removeMachine(index)}
              canRemove={machineFields.length > 1}
            />
          ))}
        </div>
      )}

      {/* Cooling Towers Section */}
      {coolingTowers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Cooling Tower ({coolingTowers.length})
          </h4>
          {coolingTowers.map(({ field, index }, displayIndex) => (
            <MachineCard
              key={field.id}
              control={control}
              index={index}
              displayIndex={displayIndex}
              type="COOLING_TOWER"
              onRemove={() => removeMachine(index)}
              canRemove={machineFields.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface IMachineCardProps {
  control: Control<TCreateProject>;
  index: number;
  displayIndex: number;
  type: 'CHILLER' | 'COOLING_TOWER';
  onRemove: () => void;
  canRemove: boolean;
}

function MachineCard({
  control,
  index,
  displayIndex,
  type,
  onRemove,
  canRemove,
}: IMachineCardProps) {
  const typeLabel = type === 'CHILLER' ? 'Chiller' : 'Cooling Tower';

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium">
            {typeLabel} #{displayIndex + 1}
          </h5>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Unit Number */}
          <FormField
            control={control}
            name={`machines.${index}.unitNumber`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Unit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ownership */}
          <FormField
            control={control}
            name={`machines.${index}.ownership`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kepemilikan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kepemilikan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MachineOwnershipEnum.options.map(ownership => (
                      <SelectItem key={ownership} value={ownership}>
                        {ownership}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={control}
            name={`machines.${index}.status`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MachineStatusEnum.options.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Capacity */}
          <FormField
            control={control}
            name={`machines.${index}.capacity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kapasitas (opsional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Contoh: 100.5"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Brand */}
          <FormField
            control={control}
            name={`machines.${index}.brand`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Merek (opsional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Carrier"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model */}
          <FormField
            control={control}
            name={`machines.${index}.model`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model (opsional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: 30XA"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Serial Number */}
          <FormField
            control={control}
            name={`machines.${index}.serialNumber`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Seri (opsional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: SN123456"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Card>
  );
}
