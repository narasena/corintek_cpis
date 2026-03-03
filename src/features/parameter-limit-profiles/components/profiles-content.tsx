'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getProfileColumns } from './columns';
import { ProfileDialog } from './profile-dialog';

import { getProfilesAction, deleteProfileAction } from '../actions';
import type { IParameterLimitProfile } from '../types';

export function ProfilesContent() {
  const [profiles, setProfiles] = useState<IParameterLimitProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<
    IParameterLimitProfile | undefined
  >(undefined);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editDialogTab, setEditDialogTab] = useState<'info' | 'limits'>('info');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProfilesAction();
      if (result.success && result.data) {
        setProfiles(result.data);
      } else {
        toast.error('Gagal mengambil data profil');
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

  const handleEdit = (profile: IParameterLimitProfile) => {
    setSelectedProfile(profile);
    setEditDialogTab('info');
    setShowEditDialog(true);
  };

  const handleEditLimits = (profile: IParameterLimitProfile) => {
    setSelectedProfile(profile);
    setEditDialogTab('limits');
    setShowEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteProfileAction(id);
    if (result.success) {
      toast.success('Profil berhasil dihapus');
      fetchData();
    } else {
      toast.error(result.error);
    }
    return result;
  };

  const handleSuccess = () => {
    setShowEditDialog(false);
    setSelectedProfile(undefined);
    fetchData();
  };

  const columns = getProfileColumns({
    onEdit: handleEdit,
    onEditLimits: handleEditLimits,
    onRefresh: fetchData,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ProfileDialog
          mode="create"
          onSuccess={handleSuccess}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Profil
            </Button>
          }
        />
      </div>

      {loading && profiles.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={profiles}
          emptyMessage="Belum ada data profil."
        />
      )}

      <ProfileDialog
        mode="edit"
        profile={selectedProfile}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleSuccess}
        initialTab={editDialogTab}
      />
    </div>
  );
}
