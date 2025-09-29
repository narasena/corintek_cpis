import { defaultColumns } from "@/components/default-columns"
import { IClient } from "@/types/client.type"
import { ColumnDef } from "@tanstack/react-table"

export const clientColumns = ():ColumnDef<IClient>[] => {
  const {drag,select,email, phoneNumber,actions} = defaultColumns<IClient>()
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Client'
    },
    email,
    phoneNumber,
    {
      accessorKey: 'websiteUrl',
      header: 'Website',
    },
    actions
  ]
}