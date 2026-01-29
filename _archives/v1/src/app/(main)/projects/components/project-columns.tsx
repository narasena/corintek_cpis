import { defaultColumns } from '@/components/default-columns';
import { IProject } from '@/types/project.type';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import SlugData from '@/components/features/data/slug-data';
import ProjectData from './project-data';
import ProjectForm from './project-form';
import { IDefaultFormComponentProps } from '@/types/form/form.type';
import { UniqueIdentifier } from '@dnd-kit/core';

interface IProjectColumnsParams extends IDefaultFormComponentProps {}

export const projectColumns = (
  params: IProjectColumnsParams
): ColumnDef<IProject>[] => {
  const { drag, select, actions } = defaultColumns<IProject>();
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ row }) => {
        return (
          <SlugData
            type="nameSlug"
            buttonText={row.original.name}
            modalTitle={row.original.name}
            content={<ProjectData projectId={row.original.id as string} />}
          />
        );
      },
    },
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ getValue }) => {
        const client = getValue() as any;
        return client?.name || 'N/A';
      },
    },
    {
      accessorKey: 'quoteNumber',
      header: 'Quote #',
    },
    {
      accessorKey: 'PONumber',
      header: 'PO #',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => {
        const type = getValue() as string;
        return (
          <Badge variant={type === 'MAIN' ? 'default' : 'secondary'}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'contractType',
      header: 'Contract',
      cell: ({ getValue }) => {
        const contractType = getValue() as string;
        return <Badge variant="outline">{contractType}</Badge>;
      },
    },
    {
      accessorKey: 'workCategory',
      header: 'Category',
      cell: ({ getValue }) => {
        const workCategory = getValue() as string;
        return <Badge variant="outline">{workCategory}</Badge>;
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ getValue }) => {
        const date = getValue() as string | Date;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ getValue }) => {
        const date = getValue() as string | Date;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: 'warranty',
      header: 'Warranty',
      cell: ({ getValue }) => {
        const warranty = getValue() as number;
        return warranty ? `${warranty} months` : 'N/A';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => {
        const date = getValue() as string | Date;
        return new Date(date).toLocaleDateString();
      },
    },
    actions({
      handleEdit: (id: UniqueIdentifier) => {
        return (
          <div className="space-y-4">
            <p>Apakah Anda yakin ingin mengedit project ini?</p>
            <ProjectForm
              id={id as string}
              type="update"
              refetch={params.refetch}
            />
          </div>
        );
      },
    }),
  ];
};
