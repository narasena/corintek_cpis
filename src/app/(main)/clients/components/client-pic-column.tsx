import { defaultColumns } from '@/components/default-columns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconUserCircle } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { userRoles } from '../../users/components/user-columns';
import { IClientPersonnel } from '@/types/client.type';

export const clientPICColumns = (): ColumnDef<IClientPersonnel>[] => {
  const { select, actions } = defaultColumns<IClientPersonnel>();
  return [
    select,
    {
      id: 'name',
      header: 'Nama',
      cell: ({ row }) => {
        const name =
          row.original.personnel.firstName +
          ' ' +
          row.original.personnel.lastName;
        return (
          <div className="flex gap-2 items-center">
            <Avatar className="size-10 rounded-full">
              <AvatarImage
                src={row.original.personnel.avatarUrl as string}
                alt="avatar"
              />
              <AvatarFallback className="bg-gray-400 p-3">
                <IconUserCircle className="size-full text-slate-700" />
              </AvatarFallback>
            </Avatar>
            <div>{name}</div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = userRoles.find(
          r => r.role === row.original.personnel.role
        );
        if (role) {
          return (
            <div
              className={`flex items-center gap-2 ${role.style} px-2 py-1 w-max rounded-full text-xs font-semibold`}
            >
              <role.icon className="w-4 h-4" />
              {role.role}
            </div>
          );
        }
        return null; // or return some default value if the role is not found
      },
      enableHiding: false,
    },
    actions(),
  ];
};
