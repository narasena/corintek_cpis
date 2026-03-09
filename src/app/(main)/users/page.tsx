'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';

import { getAllUsersAction } from '@/features/users/actions';
import { getClientByIdAction } from '@/features/clients/actions';
import { TUserResponse } from '@/@types/user.type';
import { TClientResponse } from '@/@types/client.type';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { DataTableEmpty } from '@/components/ui/data-table-empty';
import {
  getUserColumns,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from './components/user-columns';
import { UserDialog } from '@/features/users/components/user-dialog';
import type { IColumnFilterConfig } from '@/components/data-table';

export default function UsersPage() {
  const searchParams = useSearchParams();
  const clientIdFilter = searchParams.get('clientId');

  const [users, setUsers] = useState<TUserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<TUserResponse[]>([]);
  const [clientFilter, setClientFilter] = useState<TClientResponse | null>(
    null
  );
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

  useEffect(() => {
    if (clientIdFilter) {
      // Filter users by clientId
      const filtered = users.filter(u => u.clientId === clientIdFilter);
      setFilteredUsers(filtered);

      // Fetch client info for display
      getClientByIdAction(clientIdFilter).then(result => {
        if (result.success && result.data) {
          setClientFilter(result.data as TClientResponse);
        }
      });
    } else {
      setFilteredUsers(users);
      setClientFilter(null);
    }
  }, [clientIdFilter, users]);

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

  const filterConfigs = useMemo<IColumnFilterConfig<TUserResponse>[]>(
    () => [
      {
        columnId: 'role',
        type: 'select',
        label: 'Peran',
        options: ROLE_OPTIONS,
      },
      {
        columnId: 'isActive',
        type: 'select',
        label: 'Status',
        options: STATUS_OPTIONS,
        filterFn: 'equalsString',
      },
    ],
    []
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

      {/* Filter Badge */}
      {clientFilter && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm text-blue-800">
            Menampilkan personel untuk: <strong>{clientFilter.name}</strong>
          </span>
          <Button variant="ghost" size="sm" asChild className="h-6 px-2">
            <Link href="/users">
              <X className="h-3 w-3 mr-1" />
              Hapus filter
            </Link>
          </Button>
        </div>
      )}

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
          data={filteredUsers}
          emptyMessage={
            <DataTableEmpty
              title="Belum Ada Pengguna"
              description={
                clientFilter
                  ? `Belum ada personel untuk klien ${clientFilter.name}.`
                  : 'Tambahkan pengguna baru.'
              }
              actionLabel="Tambah Pengguna"
              onAction={() => setShowEditDialog(true)}
            />
          }
          columnFilters={true}
          filterConfigs={filterConfigs}
          persistFiltersInUrl={true}
        />
      )}

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
