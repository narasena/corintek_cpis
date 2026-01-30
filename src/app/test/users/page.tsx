'use client';

import { useState, useEffect } from 'react';
import {
  createUserAction,
  getAllUsersAction,
  getUserByIdAction,
  updateUserAction,
  deleteUserAction,
} from '@/features/users/actions';
import { UserRole, EmploymentStatus, TUserResponse } from '@/@types/user.type';

export default function UserTestPage() {
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

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Store form reference before async operation (React synthetic event issue)
    const form = e.currentTarget;
    const formData = new FormData(form);

    const userData = {
      firstName: formData.get('firstName') as string,
      lastName: (formData.get('lastName') as string) || null,
      idNumber: (formData.get('idNumber') as string) || null,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      avatarUrl: (formData.get('avatarUrl') as string) || null,
      role: formData.get('role') as any,
      employmentStatus: formData.get('employmentStatus') as any,
    };

    const result = await createUserAction(userData);
    if (result.success) {
      setMessage(`✅ User created: ${result.data?.email}`);
      form.reset(); // Use stored reference instead of e.currentTarget
      fetchUsers();
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleGetUser = async (id: string) => {
    setLoading(true);
    const result = await getUserByIdAction(id);
    if (result.success) {
      setSelectedUser(result.data as TUserResponse);
      setMessage(`✅ Fetched user: ${(result.data as TUserResponse)?.email}`);
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const updateData: Partial<TUserResponse> = {};
    if (formData.get('firstName'))
      updateData.firstName = formData.get('firstName') as string;
    if (formData.get('email'))
      updateData.email = formData.get('email') as string;
    if (formData.get('phoneNumber'))
      updateData.phoneNumber = formData.get('phoneNumber') as string;
    if (formData.get('role')) updateData.role = formData.get('role') as string;

    const result = await updateUserAction(selectedUser.id, updateData);
    if (result.success) {
      setMessage(`✅ User updated: ${result.data?.email}`);
      setSelectedUser(null);
      fetchUsers();
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User CRUD Test Page</h1>

      {/* Message Display */}
      {message && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border">
          <p className="font-mono text-sm">{message}</p>
        </div>
      )}

      {loading && <p className="mb-4 text-blue-600">⏳ Loading...</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CREATE USER FORM */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Create User</h2>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <input
              name="firstName"
              placeholder="First Name"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="lastName"
              placeholder="Last Name (optional)"
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="idNumber"
              placeholder="ID Number (optional)"
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="password"
              type="password"
              placeholder="Password (min 8 chars)"
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded"
            />
            <select
              name="role"
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Role</option>
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              name="employmentStatus"
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Employment Status</option>
              {Object.values(EmploymentStatus).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Create User
            </button>
          </form>
        </div>

        {/* UPDATE USER FORM */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Update User</h2>
          {selectedUser ? (
            <form onSubmit={handleUpdateUser} className="space-y-3">
              <p className="text-sm text-gray-600">
                Updating: <strong>{selectedUser.email}</strong>
              </p>
              <input
                name="firstName"
                placeholder="First Name"
                defaultValue={selectedUser.firstName}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={selectedUser.email}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                defaultValue={selectedUser.phoneNumber}
                className="w-full px-3 py-2 border rounded"
              />
              <select
                name="role"
                defaultValue={selectedUser.role}
                className="w-full px-3 py-2 border rounded"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 italic">
              Select a user from the list below to update
            </p>
          )}
        </div>
      </div>

      {/* USER LIST */}
      <div className="mt-8 border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Users ({users.length})</h2>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
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
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.phoneNumber}</td>
                  <td className="border p-2">
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </td>
                  <td className="border p-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        user.isActive ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGetUser(user.id)}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-8 text-center text-gray-500"
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
