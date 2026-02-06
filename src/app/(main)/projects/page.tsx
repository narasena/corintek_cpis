'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { getProjectColumns } from './components/columns';
import { ProjectDialog } from './components/project-dialog';
import { ProjectParameterOverridesDialog } from './components/project-parameter-overrides-dialog';

import {
  getProjectsAction,
  deleteProjectAction,
} from '@/features/projects/actions';
import { getAllClientsAction } from '@/features/clients/actions';
import { IProject } from '@/features/projects/types';
import { TClientResponse } from '@/@types/client.type';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [clients, setClients] = useState<TClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<IProject | undefined>(
    undefined
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [parameterProject, setParameterProject] = useState<IProject | null>(
    null
  );
  const [showParameterDialog, setShowParameterDialog] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        getProjectsAction(),
        getAllClientsAction(),
      ]);

      if (projectsRes.success && projectsRes.data) {
        setProjects(projectsRes.data as IProject[]);
      } else {
        toast.error(projectsRes.error || 'Gagal mengambil data proyek');
      }

      if (clientsRes.success && clientsRes.data) {
        setClients(clientsRes.data as TClientResponse[]);
      } else {
        toast.error(clientsRes.error || 'Gagal mengambil data klien');
      }
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

  const handleParameter = (project: IProject) => {
    setParameterProject(project);
    setShowParameterDialog(true);
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
          emptyMessage="Belum ada data proyek."
        />
      )}

      {/* Edit Dialog */}
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
