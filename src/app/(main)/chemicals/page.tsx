'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { getAllChemicalsAction } from '@/features/chemicals/actions';
import { TChemical } from '@/@types/chemical.type';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getChemicalColumns } from '@/features/chemicals/components/chemical-columns';
import { ChemicalDialog } from '@/features/chemicals/components/chemical-dialog';
import { useSession } from '@/hooks/use-session';

export default function ChemicalsPage() {
  const router = useRouter();
  const { user, isLoading } = useSession();
  const [chemicals, setChemicals] = useState<TChemical[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChemical, setSelectedChemical] = useState<TChemical | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  // RBAC: Only ADMIN can access this page
  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') {
      router.push('/');
      toast.error('Akses ditolak. Halaman ini hanya untuk ADMIN.');
    }
  }, [user, isLoading, router]);

  const fetchChemicals = useCallback(async () => {
    const result = await getAllChemicalsAction({});
    if (result.success && Array.isArray(result.data)) {
      setChemicals(result.data as TChemical[]);
    } else {
      toast.error('Gagal mengambil data chemical', {
        description: (result as any).error,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChemicals();
  }, [fetchChemicals]);

  const handleEdit = (chemical: TChemical) => {
    setSelectedChemical(chemical);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedChemical(null);
    fetchChemicals();
  };

  const columns = useMemo(
    () => getChemicalColumns({ onEdit: handleEdit, onRefresh: fetchChemicals }),
    [fetchChemicals]
  );

  if (isLoading || !user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Chemical
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data master chemical dan satuannya.
          </p>
        </div>
        <ChemicalDialog
          mode="create"
          onSuccess={fetchChemicals}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Chemical
            </Button>
          }
        />
      </div>

      {loading && chemicals.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={chemicals}
          emptyMessage="Belum ada data chemical."
        />
      )}

      {/* Edit Dialog */}
      <ChemicalDialog
        mode="edit"
        chemical={selectedChemical || undefined}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
