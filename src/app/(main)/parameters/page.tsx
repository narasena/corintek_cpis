'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getParameterColumns } from './components/columns';
import { ParameterDialog } from '@/features/parameters/components/parameter-dialog';

import {
  getParametersAction,
  deleteParameterAction,
} from '@/features/parameters/actions';
import { IParameter } from '@/features/parameters/types';

export default function ParametersPage() {
  const [parameters, setParameters] = useState<IParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState<
    IParameter | undefined
  >(undefined);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getParametersAction();

      if (result.success && result.data) {
        setParameters(result.data as IParameter[]);
      } else {
        toast.error('Gagal mengambil data parameter');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshParameters = useCallback(async () => {
    const result = await getParametersAction();
    if (result.success && result.data) {
      setParameters(result.data as IParameter[]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (parameter: IParameter) => {
    setSelectedParameter(parameter);
    setShowEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteParameterAction(id);
    if (result.success) {
      toast.success('Parameter berhasil dihapus');
      refreshParameters();
    } else {
      toast.error(result.error);
    }
    return result;
  };

  const handleSuccess = () => {
    setShowEditDialog(false);
    setSelectedParameter(undefined);
    refreshParameters();
  };

  const columns = useMemo(
    () =>
      getParameterColumns({
        onEdit: handleEdit,
        onRefresh: refreshParameters,
        onDelete: handleDelete,
      }),
    [refreshParameters] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Parameter
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola parameter pengukuran dan konfigurasi sistem.
          </p>
        </div>
        <ParameterDialog
          mode="create"
          onSuccess={handleSuccess}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Parameter
            </Button>
          }
        />
      </div>

      {loading && parameters.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={parameters}
          emptyMessage="Belum ada data parameter."
        />
      )}

      {/* Edit Dialog */}
      <ParameterDialog
        mode="edit"
        parameter={selectedParameter}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
