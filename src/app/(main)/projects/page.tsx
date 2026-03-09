'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { DataTableEmpty } from '@/components/ui/data-table-empty';
import {
  getProjectColumns,
  PROJECT_STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
} from './components/columns';
import { ProjectDialog } from '@/features/projects/components/project-dialog';

import {
  getProjectsAction,
  deleteProjectAction,
} from '@/features/projects/actions';
import { getAllClientsAction } from '@/features/clients/actions';
import { IProject } from '@/features/projects/types';
import { TClientResponse } from '@/@types/client.type';
import type { IColumnFilterConfig } from '@/components/data-table';

type TProjectsResult = Awaited<ReturnType<typeof getProjectsAction>>;
type TClientsResult = Awaited<ReturnType<typeof getAllClientsAction>>;

function applyProjectsResponse(
  result: TProjectsResult,
  setProjects: (projects: IProject[]) => void
) {
  if (result.success && result.data) {
    setProjects(result.data as IProject[]);
  } else {
    toast.error(result.error || 'Gagal mengambil data proyek');
  }
}

function applyClientsResponse(
  result: TClientsResult,
  setClients: (clients: TClientResponse[]) => void
) {
  if (result.success && result.data) {
    setClients(result.data as TClientResponse[]);
  } else {
    toast.error(result.error || 'Gagal mengambil data klien');
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [clients, setClients] = useState<TClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<IProject | undefined>(
    undefined
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        getProjectsAction(),
        getAllClientsAction(),
      ]);

      applyProjectsResponse(projectsRes, setProjects);
      applyClientsResponse(clientsRes, setClients);
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    const result = await getProjectsAction();
    if (result.success && result.data) {
      setProjects(result.data as IProject[]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (project: IProject) => {
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteProjectAction(id);
    if (result.success) {
      toast.success('Proyek berhasil dihapus');
      refreshProjects();
    } else {
      toast.error(result.error);
    }
    return result;
  };

  const handleSuccess = () => {
    setShowEditDialog(false);
    setSelectedProject(undefined);
    refreshProjects();
  };

  const columns = useMemo(
    () =>
      getProjectColumns({
        onEdit: handleEdit,
        onRefresh: refreshProjects,
        onDelete: handleDelete,
      }),
    [refreshProjects] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // TODO: Define filter configurations for DataTable column filters
  const filterConfigs = useMemo<IColumnFilterConfig<IProject>[]>(
    () => [
      {
        columnId: 'status',
        type: 'select',
        label: 'Status Proyek',
        options: PROJECT_STATUS_OPTIONS,
      },
      {
        columnId: 'contractType',
        type: 'select',
        label: 'Jenis Kontrak',
        options: CONTRACT_TYPE_OPTIONS,
      },
    ],
    []
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Proyek
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola data proyek, status, dan penugasan.
          </p>
        </div>
        <ProjectDialog
          mode="create"
          clients={clients}
          onSuccess={handleSuccess}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Proyek
            </Button>
          }
        />
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg h-64 bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          emptyMessage={
            <DataTableEmpty
              title="Belum Ada Proyek"
              description="Mulai dengan menambahkan proyek baru."
              actionLabel="Tambah Proyek"
              onAction={() => setShowEditDialog(true)}
            />
          }
          columnFilters={true}
          filterConfigs={filterConfigs}
          persistFiltersInUrl={true}
        />
      )}

      <ProjectDialog
        mode="edit"
        project={selectedProject}
        clients={clients}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
