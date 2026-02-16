'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getParameterLimitsAction } from '@/features/parameters/actions';
import {
  IParameterLimitMasterItem,
  ParameterCategoryEnum,
  TParameterLimitListInput,
  TParameterCategory,
  TValueType,
  ValueTypeEnum,
} from '@/features/parameters/types';
import { getParameterLimitColumns } from './components/columns';
import { ParameterLimitDialog } from './components/parameter-limit-dialog';

const categoryLabels: Record<string, string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Kualitas Air Pendingin',
  GENERAL_CONDITION: 'Kondisi Umum',
  JOB_DESCRIPTION: 'Deskripsi Pekerjaan',
  CONSUMPTION: 'Konsumsi',
  LAB_ANALYSIS: 'Lab Analysis',
};

const valueTypeLabels: Record<string, string> = {
  NUMBER: 'Angka',
  BOOLEAN: 'Ya/Tidak',
  TEXT: 'Teks',
};

function buildFilters(
  category: string,
  valueType: string
): TParameterLimitListInput {
  const filters: TParameterLimitListInput = {};
  if (category !== 'all') filters.category = category as TParameterCategory;
  if (valueType !== 'all') filters.valueType = valueType as TValueType;
  return filters;
}

export default function ParameterLimitsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<IParameterLimitMasterItem[]>([]);
  const [selected, setSelected] = useState<IParameterLimitMasterItem | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [category, setCategory] = useState('all');
  const [valueType, setValueType] = useState('NUMBER');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const filters = buildFilters(category, valueType);
    try {
      const result = await getParameterLimitsAction(filters);
      if (result.success && result.data) {
        setItems(result.data);
      } else {
        toast.error('Gagal mengambil data parameter', {
          description: result.error,
        });
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  }, [category, valueType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((row: IParameterLimitMasterItem) => {
    setSelected(row);
    setShowEditDialog(true);
  }, []);

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelected(null);
    fetchData();
  };

  const handleDelete = useCallback(async () => {
    return { success: false, error: 'Fitur hapus tidak tersedia' };
  }, []);

  const columns = useMemo(
    () =>
      getParameterLimitColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Setting Master - Parameter Limit
          </h1>
          <p className="text-muted-foreground mt-2">
            Atur batas minimum dan maksimum parameter secara global.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[260px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {ParameterCategoryEnum.options.map(opt => (
              <SelectItem key={opt} value={opt}>
                {categoryLabels[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={valueType} onValueChange={setValueType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tipe Nilai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            {ValueTypeEnum.options.map(opt => (
              <SelectItem key={opt} value={opt}>
                {valueTypeLabels[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          emptyMessage="Belum ada data parameter."
        />
      )}

      {selected ? (
        <ParameterLimitDialog
          parameter={selected}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      ) : null}
    </div>
  );
}
