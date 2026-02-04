'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { getAllClientsAction } from '@/features/clients/actions';
import { TClientResponse } from '@/@types/client.type';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getClientColumns } from './components/client-columns';
import { ClientDialog } from './components/client-dialog';

export default function ClientsPage() {
  const [clients, setClients] = useState<TClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<TClientResponse | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchClients = useCallback(async () => {
    const result = await getAllClientsAction();
    if (result.success && Array.isArray(result.data)) {
      setClients(result.data as TClientResponse[]);
    } else {
      toast.error('Gagal mengambil data klien', {
        description: result.error,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleEdit = (client: TClientResponse) => {
    setSelectedClient(client);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedClient(null);
    fetchClients();
  };

  const columns = useMemo(
    () => getClientColumns({ onEdit: handleEdit, onRefresh: fetchClients }),
    [fetchClients]
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Klien</h1>
          <p className="text-muted-foreground mt-2">
            Kelola data klien, kontak, dan informasi perusahaan.
          </p>
        </div>
        <ClientDialog
          mode="create"
          onSuccess={fetchClients}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Klien
            </Button>
          }
        />
      </div>

      {loading && clients.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          emptyMessage="Belum ada data klien."
        />
      )}

      {/* Edit Dialog */}
      <ClientDialog
        mode="edit"
        client={selectedClient || undefined}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
