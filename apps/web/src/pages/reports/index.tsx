import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

interface CallRecord {
  id: string;
  externalId: string;
  agentId?: string;
  status: string;
  score?: number;
  riskLevel?: string;
  isAutomaticFail?: boolean;
  lastAuditedAt?: string;
  createdAt: string;
}

export default function ReportsIndex() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3001/audit/calls', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        // Only show calls that have been submitted (COMPLETED status)
        setCalls(all.filter((c: CallRecord) => c.status === 'COMPLETED'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const statusColor: Record<string, string> = {
    COMPLETED: 'bg-green-50 text-green-700 border-green-100',
    NEEDS_REVIEW: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    FAILED: 'bg-red-50 text-red-700 border-red-100',
    VERIFIED: 'bg-blue-50 text-blue-700 border-blue-100',
    INGESTED: 'bg-gray-50 text-gray-500 border-gray-100',
    PROCESSING: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  return (
    <AppLayout>
      <Head><title>Reports | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Quality</h1>
            <p className="text-2xl font-black text-gray-900 mt-1">Audit Reports</p>
            <p className="text-sm text-gray-500 mt-1">Browse and open detailed audit reports for any ingested call.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">All Calls</h3>
              <span className="text-[10px] font-bold text-gray-400">{calls.length} records</span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading calls...</div>
            ) : calls.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-sm text-gray-400">No reports generated yet.</p>
                <p className="text-xs text-gray-300">Run <code className="bg-gray-50 px-1.5 py-0.5 rounded font-mono">node scripts/test-webhook.mjs</code> to simulate one.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50/50">
                  <tr>
                    {['External ID', 'Agent', 'Status', 'Score', 'Risk', 'Created', 'Action'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {calls.map(call => (
                    <tr key={call.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-900 font-mono">{call.externalId}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">{call.agentId || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${statusColor[call.status] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-900">
                        {call.score != null ? `${call.score}%` : '—'}
                        {call.isAutomaticFail && <span className="ml-1 text-red-500 text-[9px]">AUTO-FAIL</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black ${call.riskLevel === 'HIGH' ? 'text-red-500' : call.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {call.riskLevel || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{new Date(call.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Link href={`/reports/${call.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                          View Report →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
