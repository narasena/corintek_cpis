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
import { useEntryStateContext } from '@/features/log-sheets/context';
import { entryKeys } from '@/features/log-sheets/utils';

// Types
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

// Helper functions
function isWaterMeterParam(name: string): boolean {
  const lowerName = name.toLowerCase();
  return lowerName.includes('before') || lowerName.includes('after');
}

function findParamByNamePattern(
  params: Array<{ id: string; name: string; unit: string | null }>,
  pattern: string
) {
  return params.find(p => p.name.toLowerCase().includes(pattern.toLowerCase()));
}

// Consumption input component
function ConsumptionInput({
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
  const { getEntry, updateNumber } = useEntryStateContext();
  const entryKey = entryKeys.value(paramId, null);
  const state = getEntry(entryKey);

  const displayValue =
    state?.numericValue !== null && state?.numericValue !== undefined
      ? String(state.numericValue)
      : '';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {unit ? `(${unit})` : ''}
      </label>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="0"
        value={displayValue}
        onChange={e => updateNumber(entryKey, e.target.value)}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
}

// Chemical usage row component
function ChemicalUsageRow({
  usage,
  onRemove,
  disabled,
}: {
  usage: {
    chemicalId: string;
    amount: number;
    chemicalName?: string;
    unit?: string;
  };
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
      <div className="flex-1">
        <span className="font-medium">{usage.chemicalName || 'Unknown'}</span>
        <span className="text-muted-foreground ml-2">
          {usage.amount} {usage.unit || ''}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled}
        className="text-destructive hover:text-destructive h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Main component
export function ConsumptionChemicalsSection({
  consumptionParams,
  chemicals,
  chemicalUsages,
  onChemicalUsagesChange,
  disabled,
}: IConsumptionChemicalsSectionProps) {
  // Chemical form state
  const [selectedChemicalId, setSelectedChemicalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Find water meter parameters
  const beforeParam = findParamByNamePattern(consumptionParams, 'before');
  const afterParam = findParamByNamePattern(consumptionParams, 'after');
  const totalParam = findParamByNamePattern(consumptionParams, 'total');

  // Handle add chemical
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

  // Handle remove chemical
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
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-semibold">Konsumsi & Chemical</h3>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        {/* Consumption Section */}
        {hasConsumption && (
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Water Meter
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {beforeParam && (
                <ConsumptionInput
                  paramId={beforeParam.id}
                  label="Sebelum"
                  unit={beforeParam.unit}
                  disabled={disabled}
                />
              )}
              {afterParam && (
                <ConsumptionInput
                  paramId={afterParam.id}
                  label="Sesudah"
                  unit={afterParam.unit}
                  disabled={disabled}
                />
              )}
            </div>

            {totalParam && beforeParam && afterParam && (
              <CalculatedTotal
                totalParam={totalParam}
                beforeParamId={beforeParam.id}
                afterParamId={afterParam.id}
              />
            )}
          </div>
        )}

        {/* Chemicals Section */}
        {hasChemicals && (
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Penggunaan Chemical
            </h4>

            {/* Add Chemical Form */}
            <div className="flex flex-col gap-2">
              <Select
                value={selectedChemicalId}
                onValueChange={setSelectedChemicalId}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
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

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Jumlah ${selectedChemical?.unit ? `(${selectedChemical.unit})` : ''}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={disabled}
                  min="0"
                  step="0.1"
                  className="flex-1"
                />
                <Button
                  onClick={handleAddChemical}
                  disabled={disabled || !selectedChemicalId || !amount}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chemical List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {chemicalUsages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada penggunaan chemical
                </p>
              ) : (
                chemicalUsages.map((usage, index) => (
                  <ChemicalUsageRow
                    key={`${usage.chemicalId}-${index}`}
                    usage={usage}
                    onRemove={() => handleRemoveChemical(index)}
                    disabled={disabled}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Calculated total component
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

  const displayValue = calculatedTotal !== null ? String(calculatedTotal) : '-';

  return (
    <div className="pt-2 border-t">
      <div className="flex items-center justify-between">
        <span className="font-medium">{totalParam.name}</span>
        <span className="text-lg font-bold text-primary">
          {displayValue} {totalParam.unit || ''}
        </span>
      </div>
    </div>
  );
}
