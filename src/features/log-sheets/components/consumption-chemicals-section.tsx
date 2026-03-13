'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CameraInput } from '@/components/camera-input';
import { useEntryStateContext } from '@/features/log-sheets/context';
import { entryKeys } from '@/features/log-sheets/utils';

interface IConsumptionChemicalsSectionProps {
  consumptionParams: Array<{
    id: string;
    name: string;
    unit: string | null;
  }>;
  chemicals: Array<{
    id: string;
    name: string;
    unit: string | null;
  }>;
  chemicalUsages: Array<{
    id?: string;
    chemicalId: string;
    amount: number;
    chemicalName?: string;
    unit?: string;
  }>;
  onChemicalUsagesChange: (
    usages: Array<{
      id?: string;
      chemicalId: string;
      amount: number;
      chemicalName?: string;
      unit?: string;
    }>
  ) => void;
  disabled?: boolean;
}

function findParamByNamePattern(
  params: Array<{ id: string; name: string; unit: string | null }>,
  pattern: string
) {
  return params.find(p => p.name.toLowerCase().includes(pattern.toLowerCase()));
}

export function ConsumptionChemicalsSection({
  consumptionParams,
  chemicals,
  chemicalUsages,
  onChemicalUsagesChange,
  disabled,
}: IConsumptionChemicalsSectionProps) {
  const [selectedChemicalId, setSelectedChemicalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const beforeParam = findParamByNamePattern(consumptionParams, 'before');
  const afterParam = findParamByNamePattern(consumptionParams, 'after');
  const totalParam = findParamByNamePattern(consumptionParams, 'total');

  const handleAddChemical = () => {
    if (!selectedChemicalId || !amount) {
      toast.error('Pilih chemical dan masukkan jumlah');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Jumlah harus lebih besar dari 0');
      return;
    }

    const chemical = chemicals.find(c => c.id === selectedChemicalId);
    if (!chemical) return;

    const existingIndex = chemicalUsages.findIndex(
      u => u.chemicalId === selectedChemicalId
    );

    const newUsages = [...chemicalUsages];

    if (existingIndex >= 0) {
      newUsages[existingIndex] = {
        ...newUsages[existingIndex],
        amount: newUsages[existingIndex].amount + numAmount,
      };
      toast.success('Jumlah chemical diperbarui');
    } else {
      newUsages.push({
        chemicalId: selectedChemicalId,
        amount: numAmount,
        chemicalName: chemical.name,
        unit: chemical.unit ?? undefined,
      });
    }

    onChemicalUsagesChange(newUsages);
    setSelectedChemicalId('');
    setAmount('');
  };

  const handleRemoveChemical = (index: number) => {
    const newUsages = [...chemicalUsages];
    newUsages.splice(index, 1);
    onChemicalUsagesChange(newUsages);
  };

  const selectedChemical = chemicals.find(c => c.id === selectedChemicalId);
  const hasConsumption = consumptionParams.length > 0;
  const hasChemicals = chemicals.length > 0;

  if (!hasConsumption && !hasChemicals) return null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-semibold">Konsumsi & Chemical</h3>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] divide-y md:divide-y-0 md:divide-x">
        {/* Consumption Section */}
        {hasConsumption && (
          <div className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Water Meter
            </h4>

            <div className="space-y-4">
              {/* Before */}
              {beforeParam && (
                <ConsumptionRow
                  paramId={beforeParam.id}
                  label="Sebelum"
                  unit={beforeParam.unit}
                  disabled={disabled}
                />
              )}

              {/* Divider */}
              <div className="border-t" />

              {/* After */}
              {afterParam && (
                <ConsumptionRow
                  paramId={afterParam.id}
                  label="Sesudah"
                  unit={afterParam.unit}
                  disabled={disabled}
                />
              )}

              {/* Divider */}
              <div className="border-t" />

              {/* Total */}
              {totalParam && beforeParam && afterParam && (
                <CalculatedTotal
                  totalParam={totalParam}
                  beforeParamId={beforeParam.id}
                  afterParamId={afterParam.id}
                />
              )}
            </div>
          </div>
        )}

        {/* Chemicals Section */}
        {hasChemicals && (
          <div className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Penggunaan Chemical
            </h4>

            {/* Add Chemical Form */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Select
                value={selectedChemicalId}
                onValueChange={setSelectedChemicalId}
                disabled={disabled}
              >
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder="Pilih chemical..." />
                </SelectTrigger>
                <SelectContent>
                  {chemicals.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.unit ? `(${c.unit})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 flex-1">
                <Input
                  type="number"
                  placeholder={`Jumlah ${selectedChemical?.unit ? `(${selectedChemical.unit})` : ''}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onWheel={e => e.currentTarget.blur()}
                  disabled={disabled}
                  min="0"
                  step="0.01"
                  className="flex-1 sm:max-w-[150px]"
                />
                <Button
                  onClick={handleAddChemical}
                  disabled={disabled || !selectedChemicalId || !amount}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
            </div>

            {/* Chemical Table - Horizontal */}
            {chemicalUsages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada penggunaan chemical
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {chemicalUsages.map((usage, index) => (
                        <th
                          key={index}
                          className="text-center py-2 px-3 text-sm font-medium text-muted-foreground min-w-[100px]"
                        >
                          {usage.chemicalName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {chemicalUsages.map((usage, index) => (
                        <td
                          key={index}
                          className="text-center py-3 px-3 border-b"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-medium text-lg">
                              {usage.amount}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {usage.unit || ''}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveChemical(index)}
                              disabled={disabled}
                              className="h-6 w-6 text-destructive hover:text-destructive ml-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Consumption row with label+input on one line, camera below
function ConsumptionRow({
  paramId,
  label,
  unit,
  disabled,
}: {
  paramId: string;
  label: string;
  unit: string | null;
  disabled?: boolean;
}) {
  const { getEntry, updateNumber, updateCamera } = useEntryStateContext();
  const entryKey = entryKeys.value(paramId, null);
  const state = getEntry(entryKey);

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      updateNumber(entryKey, value);
    }
  };

  return (
    <div className="space-y-2">
      {/* Line 1: Label and Input */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">
          {label} {unit ? `(${unit})` : ''}
        </label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          defaultValue={
            state?.numericValue !== null && state?.numericValue !== undefined
              ? String(state.numericValue)
              : ''
          }
          onWheel={e => e.currentTarget.blur()}
          onBlur={handleNumberBlur}
          disabled={disabled}
          className="flex-1"
        />
      </div>
      {/* Line 2: Camera button below */}
      <div className="flex justify-end">
        <CameraInput
          value={state?.fileUrl}
          onChange={(url, file) => updateCamera(entryKey, url, file ?? null)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// Calculated total
function CalculatedTotal({
  totalParam,
  beforeParamId,
  afterParamId,
}: {
  totalParam: { id: string; name: string; unit: string | null };
  beforeParamId: string;
  afterParamId: string;
}) {
  const { getEntry } = useEntryStateContext();

  const beforeState = getEntry(entryKeys.value(beforeParamId, null));
  const afterState = getEntry(entryKeys.value(afterParamId, null));

  const beforeValue = beforeState?.numericValue ?? null;
  const afterValue = afterState?.numericValue ?? null;

  const calculatedTotal =
    beforeValue !== null && afterValue !== null
      ? afterValue - beforeValue
      : null;

  const displayValue =
    calculatedTotal !== null && calculatedTotal >= 0
      ? String(calculatedTotal)
      : '—';

  return (
    <div className="flex items-center justify-between py-2">
      <span className="font-medium">{totalParam.name}</span>
      <span className="text-xl font-bold text-primary">
        {displayValue} {totalParam.unit || ''}
      </span>
    </div>
  );
}
