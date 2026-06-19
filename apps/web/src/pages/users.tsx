import { useEffect, useState } from 'react';
import { Role, User } from '@voiceguard/shared';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.AUDITOR);
  
  // Since we don't have real auth, we will mock the role to bypass our backend guard
  const headers = {
    'Content-Type': 'application/json',
    'x-mock-role': Role.ADMIN, // Mock as admin to manage users
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/users', { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, email, role }),
      });
      if (res.ok) {
        setName('');
        setEmail('');
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to create user', err);
    }
  };

  const handleUpdateRole = async (id: string, newRole: Role) => {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}/role`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage user roles and permissions (Admin Only).</p>
        </div>

        {/* Create User Form */}
        <div className="bg-white p-6 shadow sm:rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New User</h2>
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                <option value={Role.AUDITOR}>Auditor</option>
                <option value={Role.COMPLIANCE_OFFICER}>Compliance Officer</option>
                <option value={Role.ADMIN}>Admin</option>
              </select>
            </div>
            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Add User
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-4 text-gray-500">Loading users...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-1"
                      >
                        <option value={Role.AUDITOR}>Auditor</option>
                        <option value={Role.COMPLIANCE_OFFICER}>Compliance Officer</option>
                        <option value={Role.ADMIN}>Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
