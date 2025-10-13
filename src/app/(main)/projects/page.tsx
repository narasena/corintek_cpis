'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import CreateData from '@/components/features/data/create-data';
import { IProject } from '@/types/project.type';
import React from 'react';
import { projectColumns } from './components/project-columns';
import ProjectForm from './components/project-form';
import useProjects from './hooks/useProjects';
import { Spinner } from '@/components/ui/spinner';

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects();

  if (loading) {
    return (
      <Spinner className="size-12 text-gray-500 self-center items-center" />
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const projectsTabs: ITableTab<IProject>[] = [
    {
      value: 'default',
      label: 'Default',
      data: projects,
      columns: projectColumns(),
      addNewRow: (
        <CreateData
          buttonText="Tambah Proyek"
          modalTitle="Tambah Proyek Baru"
          modalDescription="Menambahkan proyek baru ke dalam sistem CPIS"
          content={<ProjectForm />}
        />
      ),
    },
  ];

  return (
    <div>
      <DataTable tabs={projectsTabs} />
    </div>
  );
}
