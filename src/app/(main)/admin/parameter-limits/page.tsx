'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Settings2 } from 'lucide-react';

import {
  getCategoriesAction,
  deleteCategoryAction,
} from '@/features/parameter-limit-categories/actions';
import type { IParameterLimitCategory } from '@/features/parameter-limit-categories/types';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { CategoryForm } from '@/features/parameter-limit-categories/components/category-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function CategoryColumns({
  onEdit,
  onDelete,
  onEditLimits,
}: {
  onEdit: (category: IParameterLimitCategory) => void;
  onDelete: (category: IParameterLimitCategory) => void;
  onEditLimits: (category: IParameterLimitCategory) => void;
}) {
  return [
    {
      accessorKey: 'name',
      header: 'Nama Kategori',
      cell: ({ row }: { row: { original: IParameterLimitCategory } }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.isDefault && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              Default
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }: { row: { original: IParameterLimitCategory } }) => (
        <span className="text-muted-foreground">
          {row.original.description || '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: { row: { original: IParameterLimitCategory } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditLimits(row.original)}
          >
            Edit Limits
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Ubah
          </Button>
          {!row.original.isDefault && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(row.original)}
            >
              Hapus
            </Button>
          )}
        </div>
      ),
    },
  ];
}

export default function ParameterLimitsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<IParameterLimitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<IParameterLimitCategory | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const fetchCategories = useCallback(async () => {
    const result = await getCategoriesAction();
    if (!result.success) {
      toast.error('Gagal mengambil data kategori', {
        description: result.error ?? 'Unknown error',
      });
      setLoading(false);
      return;
    }
    if (Array.isArray(result.data)) {
      setCategories(result.data as IParameterLimitCategory[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: IParameterLimitCategory) => {
    setSelectedCategory(category);
    setShowDialog(true);
  };

  const handleEditLimits = (category: IParameterLimitCategory) => {
    router.push(`/admin/parameter-limits/${category.id}`);
  };

  const handleDelete = async (category: IParameterLimitCategory) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)
    ) {
      return;
    }

    const result = await deleteCategoryAction(category.id);
    if (!result.success) {
      toast.error('Gagal menghapus kategori', {
        description: result.error ?? 'Unknown error',
      });
      return;
    }
    toast.success('Kategori berhasil dihapus');
    fetchCategories();
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setShowDialog(true);
  };

  const handleSuccess = () => {
    setShowDialog(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  const columns = useMemo(
    () =>
      CategoryColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onEditLimits: handleEditLimits,
      }),
    [fetchCategories, router]
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="h-8 w-8" />
            Kategori Limit Parameter
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola template batas parameter untuk proyek.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          emptyMessage="Belum ada kategori limit parameter."
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Ubah Kategori' : 'Tambah Kategori'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? 'Perbarui informasi kategori limit parameter.'
                : 'Buat kategori limit parameter baru.'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={selectedCategory}
            onSuccess={handleSuccess}
            onCancel={() => setShowDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
