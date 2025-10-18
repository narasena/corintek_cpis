'use client';

import useProjectById from '@/hooks/projects/useProjectById';
import { useParams } from 'next/navigation';
import LogSheetsForm from '../components/log-sheets-form';
import { IProject } from '@/types/project.type';
import CreateData from '@/components/features/data/create-data';

export default function ProjectLogSheetPage() {
  const params = useParams();
  const { id: projectId } = params;
  const { project } = useProjectById(projectId as string);
  console.log(project);
  return (
    <div className="flex flex-col min-h-svh w-full bg-blue-100 items-center justify-center px-3 sm:p-6 md:p-10 gap-y-6">
      <h1>Project Log Sheet</h1>
      <CreateData
        buttonText="Tambah Log Sheet"
        modalTitle="Tambah Log Sheet Baru"
        modalDescription="Menambahkan log sheet baru ke dalam sistem CPIS"
        content={<LogSheetsForm projectData={project as IProject} />}
      />
    </div>
  );
}
