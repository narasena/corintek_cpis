import { ColumnDef } from '@tanstack/react-table';
import DragHandleTable from './drag-handle-table';
import { ITableHelper } from '@/types/base.dto';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { IconDots, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { FieldValues } from 'react-hook-form';
import { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';
import ActionsData from './features/data/actions-data';

export function defaultColumns<T extends FieldValues & ITableHelper>() {
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

  interface IActionsColumnParams {
    handlePreview?: (id: UniqueIdentifier) => void | React.ReactNode;
    handleEdit?: (id: UniqueIdentifier) => void | React.ReactNode;
    handleDelete?: (id: UniqueIdentifier) => void | React.ReactNode;
  }

  function actionsColumn(params?: IActionsColumnParams): ColumnDef<T> {
    return {
      id: 'actions',
      header: 'Actions',

      cell: ({ row }) => {
        const actionMenus = [
          {
            label: 'Preview',
            icon: IconEye,
            onClick: params?.handlePreview
              ? () => params.handlePreview?.(row.original.id)
              : () => {},
          },
          {
            label: 'Edit',
            icon: IconEdit,
            className: 'text-primary',
            iconClassName: 'text-primary',
            onClick: params?.handleEdit
              ? () => params.handleEdit?.(row.original.id)
              : () => {},
          },
          {
            label: 'Hapus',
            icon: IconTrash,
            className: 'text-red-600',
            iconClassName: '!text-red-600',
            onClick: params?.handleDelete
              ? () => params.handleDelete?.(row.original.id)
              : () => {},
          },
        ];
        return params ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDots />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-32 flex flex-col justify-start items-start gap-2"
            >
              {actionMenus.map(
                (
                  { label, icon: Icon, onClick, className, iconClassName },
                  index
                ) => (
                  <DropdownMenuItem
                    asChild
                    key={index}
                    className="flex items-center"
                    variant={label === 'Hapus' ? 'destructive' : 'default'}
                  >
                    <ActionsData
                      icon={Icon}
                      buttonText={label}
                      className={className}
                      iconClassName={iconClassName}
                      modalTitle={`${label} Parameter Group`}
                      content={onClick() as React.ReactNode}
                    />
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span>Actions</span>
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
    actions: actionsColumn,
  } as const;
}
