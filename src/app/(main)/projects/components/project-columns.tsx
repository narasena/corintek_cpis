import { defaultColumns } from '@/components/default-columns';
import { IProject } from '@/types/project.type';
import { ColumnDef } from '@tanstack/react-table';

export const projectColumns = (): ColumnDef<IProject>[] => {
  const { drag, select, actions } = defaultColumns<IProject>();
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Project'
    },
    {
      accessorKey: 'clientId',
      header: 'Client'
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date'
    },
    {
      accessorKey: 'endDate',
      header: 'End Date'
    },
    actions
  ]
};
