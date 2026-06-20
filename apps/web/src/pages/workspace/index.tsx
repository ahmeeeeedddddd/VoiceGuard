import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';

interface CallRecord {
  id: string;
  externalId: string;
  agentId?: string;
  status: string;
  riskLevel?: string;
  createdAt: string;
}

export default function WorkspaceIndex() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/audit/calls')
      .then(res => res.ok ? res.json() : [])
      .then(data => { setCalls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const riskBadge: Record<string, string> = {
    HIGH: 'bg-red-50 text-red-700 border-red-100',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    LOW: 'bg-green-50 text-green-700 border-green-100',
  };

  return (
    <AppLayout>
      <Head><title>Audit Workspace | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Workspace</h1>
            <p className="text-2xl font-black text-gray-900 mt-1">Audit Workspace</p>
            <p className="text-sm text-gray-500 mt-1">Select a call to open the full audit workspace with transcript, audio player, and checklist.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Calls Awaiting Review</h3>
              <span className="text-[10px] font-bold text-gray-400">{calls.length} calls</span>
            </div>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
            ) : calls.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No calls found. Run the test webhook to ingest one.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {calls.map(call => (
                  <li key={call.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-900 font-mono">{call.externalId}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{call.agentId || 'Unknown agent'} · {new Date(call.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {call.riskLevel && (
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${riskBadge[call.riskLevel] || ''}`}>
                          {call.riskLevel}
                        </span>
                      )}
                      <Link href={`/workspace/${call.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                        Open Workspace →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
