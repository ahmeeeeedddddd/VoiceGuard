import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Role, User as UserType } from '@voiceguard/shared';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@voiceguard/ui';
import { UserPlus, Trash2, Key } from 'lucide-react';

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.AUDITOR);
  
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vg_token') : null;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/users', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch users', errorData);
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, email, role, password }),
      });
      if (res.ok) {
        setName('');
        setEmail('');
        setPassword('');
        fetchUsers();
        alert('User added successfully');
      } else {
        const errorData = await res.json();
        console.error('Failed to create user', errorData);
        alert(`Failed to create user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to create user', err);
      alert('Failed to connect to the server');
    }
  };

  const handleUpdateRole = async (id: string, newRole: Role) => {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
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
    if (id === currentUser?.id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  return (
    <AppLayout>
      <Head>
        <title>User Management | VoiceGuard AI</title>
      </Head>
      <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Settings</h1>
          <p className="text-2xl font-black text-gray-900 mt-1">User Management</p>
          <p className="mt-1 text-sm text-gray-500">Manage user roles and permissions. Admin access only.</p>
        </div>

        {/* Create User Form */}
        <Card className="p-6 shadow-sm border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Add New User
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-700 uppercase tracking-widest">Full Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-700 uppercase tracking-widest">Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-700 uppercase tracking-widest">Initial Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest">Access Role</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)} className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                  <option value={Role.AUDITOR}>Auditor</option>
                  <option value={Role.COMPLIANCE_OFFICER}>Compliance Officer</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
              </div>
              <Button type="submit" className="h-[42px] px-6 bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest text-xs">
                Add
              </Button>
            </div>
          </form>
        </Card>

        {/* Users Table */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium tracking-wide">Fetching team registry...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Team Member</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Permissions</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                        className="bg-transparent border-none text-xs font-bold text-blue-600 focus:ring-0 cursor-pointer p-0 hover:underline"
                      >
                        <option value={Role.AUDITOR}>Auditor</option>
                        <option value={Role.COMPLIANCE_OFFICER}>Compliance Officer</option>
                        <option value={Role.ADMIN}>Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className={`p-2 rounded-lg transition-colors ${user.id === currentUser?.id ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-400 font-medium">No system users identified.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
        </div>
      </div>
    </AppLayout>
  );
}
