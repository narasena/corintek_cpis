'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getParameterLimitColumns } from './columns';
import { ParameterLimitDialog } from './parameter-limit-dialog';
import type { IColumnFilterConfig } from '@/components/data-table';

import {
  getParameterLimitsAction,
  updateParameterLimitAction,
} from '../../parameters/actions';
import type { IParameterLimitMasterItem } from '../../parameters/types';
import { CATEGORY_OPTIONS } from '@/features/parameters/constants';

export function ParameterLimitsContent() {
  const [limits, setLimits] = useState<IParameterLimitMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLimit, setSelectedLimit] = useState<
    IParameterLimitMasterItem | undefined
  >(undefined);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getParameterLimitsAction({});
      if (result.success && result.data) {
        setLimits(result.data);
      } else {
        toast.error('Gagal mengambil data batas parameter');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (limit: IParameterLimitMasterItem) => {
    setSelectedLimit(limit);
    setShowEditDialog(true);
  };

  const handleSuccess = () => {
    setShowEditDialog(false);
    setSelectedLimit(undefined);
    fetchData();
  };

  const columns = getParameterLimitColumns({
    onEdit: handleEdit,
  });

  const filterConfigs = useMemo<
    IColumnFilterConfig<IParameterLimitMasterItem>[]
  >(
    () => [
      {
        columnId: 'category',
        type: 'select',
        label: 'Kategori',
        options: CATEGORY_OPTIONS,
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <p className="text-sm text-muted-foreground mr-auto">
          Kelola batas default untuk setiap parameter di sini.
        </p>
      </div>

      {loading && limits.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={limits}
          emptyMessage="Belum ada data batas parameter."
          columnFilters={true}
          filterConfigs={filterConfigs}
          persistFiltersInUrl={true}
        />
      )}

      <ParameterLimitDialog
        mode="edit"
        limit={selectedLimit}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
