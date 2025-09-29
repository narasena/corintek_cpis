"use client"

import { DataTable } from "@/components/data-table";
import { userColumns } from "./components/user-columns";
import CreateUser from "./components/create-user";
import useUsers from './hooks/useUserHooks';

export default function UsersPage() {
  const { allUsers } = useUsers();
  console.log(allUsers);
  return (
    <div>
      <DataTable
        data={allUsers}
        columns={userColumns()}
        addNewRow={<CreateUser />}
      />
    </div>
  );
}