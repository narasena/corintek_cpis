"use client"

import { ColumnDef } from '@tanstack/react-table';
import DragHandleTable from '@/components/drag-handle-table';
import { Checkbox } from '@/components/ui/checkbox';
import { IUser } from '@/app/types/user.type';

export const useUserColumns = (): ColumnDef<IUser>[] => {
  return [
    // {
    //   id: 'drag',
    //   header: () => null,
    //   cell: ({ row }) => <DragHandleTable id={row.original.id} />,
    // },
    {
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
    },
    {
      id: "name",
      header: "Header",
      cell: ({ row }) => {
        return (row.original.firstName || "") + " " + (row.original.lastName || "");
      },
      enableHiding: false,
    },
    {
      accessorKey:"IDNumber",
      header: "ID Number",
      cell: ({ row }) => {
        return row.original.IDNumber
      },
      enableHiding: false,
    },
    {
      accessorKey:"email",
      header: "Email",
      cell: ({ row }) => {
        return row.original.email
      },
      enableHiding: false,
    },
    {
      accessorKey:"phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => {
        return row.original.phoneNumber
      },
      enableHiding: false,
    },
    {
      accessorKey:"role",
      header: "Role",
      cell: ({ row }) => {
        return row.original.role
      },
      enableHiding: false,
    },
    {
      accessorKey:"employmentStatus",
      header: "Employment Status",
      cell: ({ row }) => {
        return row.original.employmentStatus
      },
      enableHiding: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return <div className="flex items-center justify-end gap-2">Actions</div>;
      },
      enableHiding: false,
    }
  ];
}