import { defaultColumns } from '@/components/default-columns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IUser } from '@/types/user.type';
import { IconUserCircle } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { userRoles } from '../../users/components/user-columns';

export const clientPICColumns = (): ColumnDef<IUser>[] => {
  const { select, actions } = defaultColumns<IUser>();
  return [
    select,
    {
      id: 'name',
      header: 'Nama',
      cell: ({ row }) => {
        const name = row.original.firstName + ' ' + row.original.lastName;
        return (
          <div className="flex gap-2 items-center">
            <Avatar className="size-10 rounded-full">
              <AvatarImage src={row.original.avatarUrl} alt="avatar" />
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
        const role = userRoles.find(r => r.role === row.original.role);
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
    actions,
  ];
};
