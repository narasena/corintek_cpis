'use client';

import { DataTable } from '@/components/data-table';
import CreateData from '@/components/features/data/create-data';
import { IProject } from '@/types/project.type';
import React from 'react';
import { projectColumns } from './components/project-columns';
import ProjectForm from './components/project-form';
import useProjects from './hooks/useProjects';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        data={projects as IProject[]}
        columns={projectColumns()}
        addNewRow={
          <CreateData
            buttonText="Tambah Proyek"
            modalTitle="Tambah Proyek Baru"
            modalDescription="Menambahkan proyek baru ke dalam sistem CPIS"
            content={<ProjectForm />}
          />
        }
      />
    </div>
  );
}
