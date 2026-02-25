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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type TChemicalUsageState = Array<{
  id?: string;
  chemicalId: string;
  amount: number;
  chemicalName?: string;
  unit?: string;
}>;

interface ChemicalUsageSectionProps {
  usages: TChemicalUsageState;
  onChange: (usages: TChemicalUsageState) => void;
  disabled?: boolean;
  chemicals: Array<{
    id: string;
    name: string;
    unit: string | null;
  }>;
}

export function ChemicalUsageSection({
  usages,
  onChange,
  disabled,
  chemicals,
}: ChemicalUsageSectionProps) {
  const [selectedChemicalId, setSelectedChemicalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handleAdd = () => {
    if (!selectedChemicalId || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Jumlah harus lebih besar dari 0');
      return;
    }

    const chemical = chemicals.find(c => c.id === selectedChemicalId);
    if (!chemical) return;

    // Check if already added
    const existingIndex = usages.findIndex(
      u => u.chemicalId === selectedChemicalId
    );

    const newUsages = [...usages];

    if (existingIndex >= 0) {
      // Update existing
      newUsages[existingIndex] = {
        ...newUsages[existingIndex],
        amount: newUsages[existingIndex].amount + numAmount,
      };
    } else {
      // Add new
      newUsages.push({
        chemicalId: selectedChemicalId,
        amount: numAmount,
        chemicalName: chemical.name,
        unit: chemical.unit ?? undefined,
      });
    }

    onChange(newUsages);
    setSelectedChemicalId('');
    setAmount('');
  };

  const handleRemove = (index: number) => {
    const newUsages = [...usages];
    newUsages.splice(index, 1);
    onChange(newUsages);
  };

  const selectedChemical = chemicals.find(c => c.id === selectedChemicalId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Penggunaan Chemical</h3>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Nama Chemical</label>
          <Select
            value={selectedChemicalId}
            onValueChange={setSelectedChemicalId}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih chemical..." />
            </SelectTrigger>
            <SelectContent>
              {chemicals.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-32 space-y-2">
          <label className="text-sm font-medium">
            Jumlah {selectedChemical?.unit ? `(${selectedChemical.unit})` : ''}
          </label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={disabled}
            min="0"
            step="0.1"
          />
        </div>

        <Button
          onClick={handleAdd}
          disabled={disabled || !selectedChemicalId || !amount}
          className="mb-0.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Chemical</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Belum ada penggunaan chemical
                </TableCell>
              </TableRow>
            ) : (
              usages.map((usage, index) => (
                <TableRow key={`${usage.chemicalId}-${index}`}>
                  <TableCell>{usage.chemicalName || 'Loading...'}</TableCell>
                  <TableCell>
                    {usage.amount} {usage.unit}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
