"use client"

import { DataTable } from "@/components/data-table";
import data from "./data.json"
import { IUser } from "@/app/types/user.type";
import { EmploymentStatus, UserRole } from "@/app/api/generated/prisma";
import { userColumns } from "./components/user-columns";
import CreateUser from "./components/create-user";

export default function UsersPage () {
    const users: IUser[] = data.map((user) => ({
        ...user,
        role: user.role as UserRole,
        employmentStatus: user.employmentStatus as EmploymentStatus,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
    }));
    return (
        <div>
            <DataTable data={users} columns={userColumns()} addNewRow={<CreateUser />} />
        </div>
    )
}