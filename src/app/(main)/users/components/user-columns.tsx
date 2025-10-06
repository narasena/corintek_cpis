'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IUser } from '@/types/user.type';

import {
  IconCrown,
  IconDeviceDesktopStar,
  IconTool,
  IconUserCheck,
  IconUserCircle,
  IconUserHexagon,
  IconUserScreen,
} from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { defaultColumns } from '@/components/default-columns';

// Local enums to avoid importing from massive Prisma generated file
enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  TECHNICIAN = 'TECHNICIAN',
  DIRECTOR = 'DIRECTOR',
  CLIENT_MANAGER = 'CLIENT_MANAGER',
  CLIENT_PIC = 'CLIENT_PIC',
}

enum EmploymentStatus {
  PERMANENT = 'PERMANENT',
  FREELANCE = 'FREELANCE',
  CONTRACT = 'CONTRACT',
}

export const userRoles = [
  {
    role: UserRole.ADMIN,
    style: 'bg-purple-900 text-yellow-400',
    icon: IconCrown,
  },
  {
    role: UserRole.SUPERVISOR,
    style: 'bg-sky-700 text-yellow-200',
    icon: IconUserCheck,
  },
  {
    role: UserRole.TECHNICIAN,
    style: 'bg-blue-800 text-gray-200',
    icon: IconTool,
  },
  {
    role: UserRole.DIRECTOR,
    style: 'text-cyan-600 bg-lime-300',
    icon: IconDeviceDesktopStar,
  },
  {
    role: UserRole.CLIENT_MANAGER,
    style: 'bg-pink-600',
    icon: IconUserHexagon,
  },
  {
    role: UserRole.CLIENT_PIC,
    style: 'bg-violet-800 text-gray-200',
    icon: IconUserScreen,
  },
];

const employeeStatus = [
  { status: EmploymentStatus.PERMANENT, style: 'bg-green-600' },
  { status: EmploymentStatus.FREELANCE, style: 'bg-yellow-600' },
  { status: EmploymentStatus.CONTRACT, style: 'bg-pink-700' },
];

export const userColumns = (): ColumnDef<IUser>[] => {
  const { drag, select, email, phoneNumber, actions } = defaultColumns<IUser>();
  return [
    drag,
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
      accessorKey: 'IDNumber',
      header: 'ID Number',
      cell: ({ row }) => {
        return row.original.idNumber;
      },
      enableHiding: false,
    },
    email,
    phoneNumber,
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
    {
      accessorKey: 'employmentStatus',
      header: 'Employment Status',
      cell: ({ row }) => {
        return (
          <div
            className={`text-white px-2 py-0.5 w-max rounded-full text-xs font-semibold ${employeeStatus.find(e => e.status === row.original.employmentStatus)?.style}`}
          >
            {row.original.employmentStatus}
          </div>
        );
      },
      enableHiding: false,
    },
    actions,
  ];
};
