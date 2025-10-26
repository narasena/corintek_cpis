import { defaultColumns } from '@/components/default-columns';
import { IProject } from '@/types/project.type';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

export const projectColumns = (): ColumnDef<IProject>[] => {
  const { drag, select, actions } = defaultColumns<IProject>();
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ getValue }) => {
        const name = getValue() as string;
        return <div className="font-medium">{name}</div>;
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
    actions(),
  ];
};
