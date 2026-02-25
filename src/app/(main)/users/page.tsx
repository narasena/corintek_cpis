'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { getAllUsersAction } from '@/features/users/actions';
import { TUserResponse } from '@/@types/user.type';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getUserColumns } from './components/user-columns';
import { UserDialog } from '@/features/users/components/user-dialog';

export default function UsersPage() {
  const [users, setUsers] = useState<TUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<TUserResponse | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchUsers = useCallback(async () => {
    const result = await getAllUsersAction();
    if (result.success && Array.isArray(result.data)) {
      setUsers(result.data as TUserResponse[]);
    } else {
      toast.error('Gagal mengambil data pengguna', {
        description: result.error,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: TUserResponse) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const columns = useMemo(
    () => getUserColumns({ onEdit: handleEdit, onRefresh: fetchUsers }),
    [fetchUsers]
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data pengguna, peran, dan status karyawan.
          </p>
        </div>
        <UserDialog
          mode="create"
          onSuccess={fetchUsers}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
            </Button>
          }
        />
      </div>

      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          emptyMessage="Belum ada data pengguna."
        />
      )}

      {/* Edit Dialog */}
      <UserDialog
        mode="edit"
        user={selectedUser || undefined}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
