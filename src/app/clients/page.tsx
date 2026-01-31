'use client';

import { useState, useEffect } from 'react';
import { ClientForm } from './components/client-form';
import { toast } from 'sonner';
import {
  getAllClientsAction,
  deleteClientAction,
} from '@/features/clients/actions';
import { TClientResponse } from '@/@types/client.type';
import { Button } from '@/components/ui/button';

export default function ClientsPage() {
  const [clients, setClients] = useState<TClientResponse[]>([]);
  const [selectedClient, setSelectedClient] = useState<TClientResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Fetch all clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const result = await getAllClientsAction();
    if (result.success && Array.isArray(result.data)) {
      setClients(result.data as TClientResponse[]);
      if (result.data.length === 0) {
        toast.info('Belum ada data klien');
      }
    } else {
      toast.error('Gagal mengambil data klien', {
        description: result.error,
      });
    }
    setLoading(false);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus klien ini?')) return;

    setLoading(true);
    const result = await deleteClientAction(id);
    if (result.success) {
      toast.success('Klien berhasil dihapus');
      fetchClients();
    } else {
      toast.error('Gagal menghapus klien', {
        description: result.error,
      });
    }
    setLoading(false);
  };

  const handleSuccess = () => {
    setSelectedClient(null);
    fetchClients();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Manajemen Klien</h1>

      {loading && <p className="mb-4 text-blue-600">⏳ Loading...</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CREATE CLIENT FORM */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Tambah Klien</h2>
          <ClientForm mode="create" onSuccess={handleSuccess} />
        </div>

        {/* UPDATE CLIENT FORM */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Edit Klien</h2>
          {selectedClient ? (
            <ClientForm
              mode="edit"
              defaultValues={selectedClient}
              onSuccess={handleSuccess}
              onCancel={() => setSelectedClient(null)}
            />
          ) : (
            <p className="text-muted-foreground italic">
              Pilih klien dari daftar di bawah untuk mengedit
            </p>
          )}
        </div>
      </div>

      {/* CLIENT LIST */}
      <div className="mt-8 border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Daftar Klien ({clients.length})</h2>
          <Button onClick={fetchClients} disabled={loading} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Nama</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Telepon</th>
                <th className="border p-2 text-left">Alamat</th>
                <th className="border p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-muted/50">
                  <td className="border p-2">{client.name}</td>
                  <td className="border p-2">{client.email || '-'}</td>
                  <td className="border p-2">{client.phoneNumber || '-'}</td>
                  <td className="border p-2 max-w-xs truncate">
                    {client.address || '-'}
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedClient(client)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClient(client.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border p-8 text-center text-muted-foreground"
                  >
                    Belum ada data klien.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
