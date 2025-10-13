import { ColumnDef } from '@tanstack/react-table';
import DragHandleTable from './drag-handle-table';
import { IUniqueIdentifierId } from '@/types/base.dto';
import { Checkbox } from './ui/checkbox';

export function defaultColumns<T extends IUniqueIdentifierId>() {
  function draggableColumn(): ColumnDef<T> {
    return {
      id: 'drag',
      header: () => null,
      cell: ({ row }) => <DragHandleTable id={row.original.id!} />,
    };
  }

  function selectableColumn(): ColumnDef<T> {
    return {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    };
  }

  function emailColumn(): ColumnDef<T> {
    return {
      accessorKey: 'email',
      header: 'Email',
      enableHiding: false,
    };
  }

  function phoneNumberColumn(): ColumnDef<T> {
    return {
      accessorKey: 'phoneNumber',
      header: 'Nomor Telepon',
      enableHiding: false,
    };
  }

  function actionsColumn(): ColumnDef<T> {
    return {
      id: 'actions',
      header: 'Actions',
      cell: () => {
        return (
          <div className="flex items-center justify-start gap-2">Actions</div>
        );
      },
      enableHiding: false,
    };
  }

  return {
    drag: draggableColumn(),
    select: selectableColumn(),
    email: emailColumn(),
    phoneNumber: phoneNumberColumn(),
    actions: actionsColumn(),
  } as const;
}
