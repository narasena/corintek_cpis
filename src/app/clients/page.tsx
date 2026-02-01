'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { getAllClientsAction } from '@/features/clients/actions';
import { TClientResponse } from '@/@types/client.type';
import { Button } from '@/components/ui/button';
import { ClientDataTable } from './components/client-data-table';
import { getColumns } from './components/client-columns';
import { ClientDialog } from './components/client-dialog';

export default function ClientsPage() {
  const [clients, setClients] = useState<TClientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    // Only show loading on initial fetch or full refresh if needed
    // But for better UX, maybe we don't clear the table, just update it.
    // Ideally we'd use React Query or SWR, but adhering to "No New Toys".
    // We'll keep loading state usage simple.
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

  // Fetch all clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const columns = useMemo(() => getColumns(fetchClients), [fetchClients]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
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
        <ClientDataTable columns={columns} data={clients} />
      )}
    </div>
  );
}
