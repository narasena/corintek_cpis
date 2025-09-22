"use client"

import { DataTable } from "@/components/data-table";
import data from "./data.json"
import { useUserColumns } from "./components/user-columns";
import { IUser } from "@/app/types/user.type";
import { EmploymentStatus, UserRole } from "@/app/api/generated/prisma";

export default function UsersPage () {
    const columns = useUserColumns();
    const users: IUser[] = data.map((user) => ({
        ...user,
        role: user.role as UserRole,
        employmentStatus: user.employmentStatus as EmploymentStatus,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
    }));
    return (
        <div>
            <DataTable data={users} columns={columns} />
        </div>
    )
}