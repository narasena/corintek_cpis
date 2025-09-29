import { ColumnDef } from "@tanstack/react-table"
import DragHandleTable from "./drag-handle-table"
import { IUniqueIdentifierId } from "@/types/base.dto"
import { Checkbox } from "./ui/checkbox"

export function draggableColumn<T extends IUniqueIdentifierId>():ColumnDef<T>{
  return {
    id: 'drag',
          header: () => null,
          cell: ({ row }) => <DragHandleTable id={row.original.id!} />,
  }
}

export function selectableColumn<T extends IUniqueIdentifierId>():ColumnDef<T>{
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
      enableHiding: false
  }
}

export function actionsColumn <T extends IUniqueIdentifierId>():ColumnDef<T>{
  return {
    id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start gap-2">Actions</div>
        );
      },
      enableHiding: false,
  }
}