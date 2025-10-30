'use client';

import useProjectById from '@/hooks/projects/useProjectById';
import { useParams } from 'next/navigation';
import LogSheetsForm from '../components/log-sheets-form';
import { IProject } from '@/types/project.type';
import CreateData from '@/components/features/data/create-data';
import { DataTable, ITableTab } from '@/components/data-table';
import useAllLogSheets from '../hooks/useAllLogSheets';
import { ILogSheet } from '@/types/log-sheet.type';
import { logSheetsColumns } from '../components/log-sheets-columns';
import { Spinner } from '@/components/ui/spinner';

export default function ProjectLogSheetPage() {
  const params = useParams();
  const { id: projectId } = params;
  const { project } = useProjectById(projectId as string);
  const { logSheets, loading, refetchLogSheets } = useAllLogSheets(
    projectId as string
  );

  if (loading) {
    return (
      <Spinner className="size-12 text-gray-500 self-center items-center" />
    );
  }

  const logSheetsTabs: ITableTab<ILogSheet>[] = [
    {
      value: 'default',
      label: 'Default',
      data: logSheets,
      columns: logSheetsColumns(),
      addNewRow: (
        <CreateData
          buttonText="Tambah Log Sheet"
          modalTitle="Tambah Log Sheet Baru"
          modalDescription="Menambahkan log sheet baru ke dalam sistem CPIS"
          content={
            <LogSheetsForm
              projectData={project as IProject}
              refetch={refetchLogSheets}
            />
          }
        />
      ),
    },
  ];
  return (
    <>
      <DataTable tabs={logSheetsTabs} />
    </>
  );
}
