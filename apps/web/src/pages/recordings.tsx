import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CallRecord {
  id: string;
  externalId: string;
  agentId?: string;
  status: string;
  source: string;
  riskLevel?: string;
  createdAt: string;
}

export default function AllRecordingsIndex() {
  const { token } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = () => {
    if (!token) return;
    fetch('http://localhost:3001/audit/calls', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => { setCalls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (token) {
      fetchCalls();
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingestion?')) return;
    try {
      const res = await fetch(`http://localhost:3001/audit/workspace/${id}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setCalls(prev => prev.filter(c => c.id !== id));
      } else {
        const body = await res.text();
        alert(`Delete failed: ${res.status} — ${body}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const riskBadge: Record<string, string> = {
    HIGH: 'bg-red-50 text-red-700 border-red-100',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    LOW: 'bg-green-50 text-green-700 border-green-100',
  };

  const formatLocalDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString.endsWith('Z') ? isoString : isoString + 'Z');
      return d.toLocaleString([], {
        month: 'numeric', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AppLayout>
      <Head><title>All Recordings | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Data</h1>
            <p className="text-2xl font-black text-gray-900 mt-1">All Recordings</p>
            <p className="text-sm text-gray-500 mt-1">Browse all historical calls and recordings ingested via API or manual upload.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Repository</h3>
              <span className="text-[10px] font-bold text-gray-400">{calls.filter(c => c.source !== 'MANUAL_UPLOAD').length} calls</span>
            </div>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
            ) : calls.filter(c => c.source !== 'MANUAL_UPLOAD').length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No API calls found.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {calls.filter(c => c.source !== 'MANUAL_UPLOAD').map(call => (
                  <li key={call.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-900 font-mono">{call.externalId}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {call.agentId || 'Unknown agent'} · {formatLocalDateTime(call.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {call.riskLevel && (
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${riskBadge[call.riskLevel] || ''}`}>
                          {call.riskLevel}
                        </span>
                      )}
                      <button 
                        onClick={() => handleDelete(call.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                        title="Delete recording"
                      >
                        <Trash2 size={16} />
                      </button>
                      <Link href={`/workspace/${call.id}`} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-sm hover:bg-blue-700 transition-all tracking-wider">
                        Audit
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
