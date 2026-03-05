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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

// Consumption input with camera component
function ConsumptionInputWithCamera({
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

  const displayValue =
    state?.numericValue !== null && state?.numericValue !== undefined
      ? String(state.numericValue)
      : '';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {unit ? `(${unit})` : ''}
      </label>
      <div className="flex items-start gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={displayValue}
          onChange={e => updateNumber(entryKey, e.target.value)}
          disabled={disabled}
          className="flex-1"
        />
        <CameraInput
          value={state?.fileUrl}
          onChange={(url, file) => updateCamera(entryKey, url, file ?? null)}
          disabled={disabled}
        />
      </div>
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

      <div className="grid md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x">
        {/* Consumption Section - Narrow left column */}
        {hasConsumption && (
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Water Meter
            </h4>

            <div className="space-y-3">
              {beforeParam && (
                <ConsumptionInputWithCamera
                  paramId={beforeParam.id}
                  label="Sebelum"
                  unit={beforeParam.unit}
                  disabled={disabled}
                />
              )}
              {afterParam && (
                <ConsumptionInputWithCamera
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

        {/* Chemicals Section - Wide right column with horizontal table */}
        {hasChemicals && (
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Penggunaan Chemical
            </h4>

            {/* Add Chemical Form */}
            <div className="flex flex-col sm:flex-row gap-2">
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

            {/* Chemical Table - Horizontal Excel-like layout */}
            {chemicalUsages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada penggunaan chemical
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {chemicalUsages.map((usage, index) => (
                        <TableHead
                          key={index}
                          className="text-center min-w-[120px]"
                        >
                          {usage.chemicalName}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {chemicalUsages.map((usage, index) => (
                        <TableCell key={index} className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-medium">
                              {usage.amount} {usage.unit || ''}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveChemical(index)}
                              disabled={disabled}
                              className="h-6 w-6 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
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
    <div className="pt-3 border-t mt-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{totalParam.name}</span>
        <span className="text-lg font-bold text-primary">
          {displayValue} {totalParam.unit || ''}
        </span>
      </div>
    </div>
  );
}
