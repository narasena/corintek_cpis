"use client"

import { DataTable } from "@/components/data-table";
import data from "./data.json"
import { IUser } from "@/types/user.type";
import { EmploymentStatus, UserRole } from "@/features/api/generated/prisma";
import { userColumns } from "./components/user-columns";
import CreateUser from "./components/create-user";

export default function UsersPage () {
    const users: IUser[] = data.map((user) => ({
        ...user,
        role: user.role as UserRole,
        employmentStatus: user.employmentStatus as EmploymentStatus,

    }));
    return (
        <div>
            <DataTable data={users} columns={userColumns()} addNewRow={<CreateUser />} />
        </div>
    )
}