'use client';

import { useState, useEffect } from 'react';
import { UserForm } from './components/user-form';
import { getAllUsersAction, deleteUserAction } from '@/features/users/actions';
import { TUserResponse } from '@/@types/user.type';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const [users, setUsers] = useState<TUserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<TUserResponse | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsersAction();
    if (result.success && Array.isArray(result.data)) {
      setUsers(result.data as TUserResponse[]);
      setMessage(`✅ Fetched ${result.data.length || 0} users`);
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    const result = await deleteUserAction(id);
    if (result.success) {
      setMessage(`✅ User deleted`);
      fetchUsers();
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleSuccess = () => {
    setMessage(`✅ User ${selectedUser ? 'updated' : 'created'} successfully`);
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {/* Message Display */}
      {message && (
        <div className="mb-6 p-4 bg-muted rounded-lg border">
          <p className="font-mono text-sm">{message}</p>
        </div>
      )}

      {loading && <p className="mb-4 text-blue-600">⏳ Loading...</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CREATE USER FORM */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Create User</h2>
          <UserForm mode="create" onSuccess={handleSuccess} />
        </div>

        {/* UPDATE USER FORM */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Update User</h2>
          {selectedUser ? (
            <UserForm
              mode="edit"
              defaultValues={selectedUser}
              onSuccess={handleSuccess}
              onCancel={() => setSelectedUser(null)}
            />
          ) : (
            <p className="text-muted-foreground italic">
              Select a user from the list below to update
            </p>
          )}
        </div>
      </div>

      {/* USER LIST */}
      <div className="mt-8 border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Users ({users.length})</h2>
          <Button onClick={fetchUsers} disabled={loading} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Phone</th>
                <th className="border p-2 text-left">Role</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="border p-2">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.phoneNumber}</td>
                  <td className="border p-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </td>
                  <td className="border p-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        user.isActive
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-red-100 dark:bg-red-900'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedUser(user)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-8 text-center text-muted-foreground"
                  >
                    No users found. Create one above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
