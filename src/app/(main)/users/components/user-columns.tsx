"use client"

import { ColumnDef } from '@tanstack/react-table';
import DragHandleTable from '@/components/drag-handle-table';
import { Checkbox } from '@/components/ui/checkbox';
import { IUser } from '@/types/user.type';

import { EmploymentStatus, UserRole } from '@/features/api/generated/prisma';
import { IconCrown, IconDeviceDesktopStar, IconTool, IconUserCheck, IconUserHexagon, IconUserScreen } from '@tabler/icons-react';

const userRoles = [
  { role: UserRole.ADMIN, style: 'bg-purple-900 text-yellow-400', icon: IconCrown },
  { role: UserRole.SUPERVISOR, style: 'bg-sky-700 text-yellow-200', icon:IconUserCheck },
  { role: UserRole.TECHNICIAN, style: 'bg-blue-800 text-gray-200', icon:IconTool },
  {role: UserRole.DIRECTOR, style: 'text-cyan-600 bg-lime-300', icon: IconDeviceDesktopStar },
  {role: UserRole.CLIENT_MANAGER, style: 'bg-pink-600', icon: IconUserHexagon },
  {role: UserRole.CLIENT_PIC, style: 'bg-violet-800 text-gray-200', icon: IconUserScreen },
]

const employeeStatus = [
  { status: EmploymentStatus.PERMANENT, style: 'bg-green-600' },
  { status: EmploymentStatus.FREELANCE, style: 'bg-yellow-600' },
  { status: EmploymentStatus.CONTRACT, style: 'bg-pink-700' },
];

export const userColumns = (): ColumnDef<IUser>[] => {
  return [
    {
      id: 'drag',
      header: () => null,
      cell: ({ row }) => <DragHandleTable id={row.original.id!} />,
    },
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
      id: 'name',
      header: 'Header',
      cell: ({ row }) => {
        return (
          (row.original.firstName || '') + ' ' + (row.original.lastName || '')
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
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        return row.original.email;
      },
      enableHiding: false,
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
      cell: ({ row }) => {
        return row.original.phoneNumber;
      },
      enableHiding: false,
    },
    {
  accessorKey: 'role',
  header: 'Role',
  cell: ({ row }) => {
    const role = userRoles.find((r) => r.role === row.original.role);
    if (role) {
      return (
        <div className={`flex items-center gap-2 ${role.style} px-2 py-1 w-max rounded-full text-xs font-semibold`}>
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start gap-2">Actions</div>
        );
      },
      enableHiding: false,
    },
  ];
};