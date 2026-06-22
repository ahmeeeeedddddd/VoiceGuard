import Head from 'next/head';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@voiceguard/shared';
import { Users, Settings as SettingsIcon, ScrollText } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <AppLayout>
      <Head><title>Settings | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">System</h1>
            <p className="text-2xl font-black text-gray-900 mt-1">Settings</p>
            <p className="text-sm text-gray-500 mt-1">System configuration and administration.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/users" className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors text-blue-500">
                <Users size={20} />
              </div>
              <h3 className="text-sm font-black text-gray-900">User Management</h3>
              <p className="text-xs text-gray-400 mt-1">Create, delete, and assign roles to users.</p>
            </Link>

            {isAdmin && (
              <Link href="/logs" className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors text-blue-500">
                  <ScrollText size={20} />
                </div>
                <h3 className="text-sm font-black text-gray-900">System Logs</h3>
                <p className="text-xs text-gray-400 mt-1">View backend audit trails and system activity logs.</p>
              </Link>
            )}

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 opacity-60 cursor-not-allowed">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
                <SettingsIcon size={20} />
              </div>
              <h3 className="text-sm font-black text-gray-900">API Configuration</h3>
              <p className="text-xs text-gray-400 mt-1">Manage Deepgram keys and webhook secrets. (Coming soon)</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
