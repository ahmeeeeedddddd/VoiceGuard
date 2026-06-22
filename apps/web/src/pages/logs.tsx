import { useEffect, useState } from 'react';
import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@voiceguard/ui';
import { Terminal, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@voiceguard/shared';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  requestId: string;
  message: string;
}

export default function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState('ALL');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vg_token') : null;
    try {
      const res = await fetch('http://localhost:3001/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === Role.ADMIN) {
      fetchLogs();
    }
  }, [user]);

  const filteredLogs = logs.filter(log => {
    const matchesService = activeService === 'ALL' || log.service === activeService;
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                         log.requestId?.toLowerCase().includes(search.toLowerCase());
    return matchesService && matchesLevel && matchesSearch;
  });

  const services = ['ALL', ...Array.from(new Set(logs.map(l => l.service))).filter(Boolean)];

  if (user?.role !== Role.ADMIN) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center p-6 text-center">
          <div className="max-w-sm">
            <h1 className="text-2xl font-black text-gray-900">Restricted Access</h1>
            <p className="mt-2 text-gray-500">System logs are only accessible to administrative accounts. Please contact your IT administrator if you require access.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head><title>System Logs | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Governance Console</h1>
              <p className="text-3xl font-black text-gray-900 tracking-tight">System Event Logs</p>
              <p className="text-sm text-gray-500 mt-1">Cross-service audit trail and operational telemetry.</p>
            </div>
            <button 
              onClick={fetchLogs}
              className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
              title="Refresh Logs"
            >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar / Filters */}
            <aside className="lg:w-64 space-y-6">
              <Card className="p-4 shadow-sm border-gray-100 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Console</label>
                  <input 
                    type="text" 
                    placeholder="Search logs or request IDs..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Log Level</label>
                  <select 
                    value={levelFilter} 
                    onChange={e => setLevelFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="ERROR">Error</option>
                    <option value="WARN">Warning</option>
                    <option value="INFO">Info</option>
                    <option value="DEBUG">Debug</option>
                  </select>
                </div>
              </Card>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Service Explorer</label>
                <div className="space-y-1">
                  {services.map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveService(s!)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeService === s 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Logs Console */}
            <div className="flex-1 min-w-0">
              <Card className="shadow-sm border-gray-100 overflow-hidden bg-gray-900 border-none ring-1 ring-gray-800">
                <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-blue-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                      {activeService} Service Output Stream
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">
                    {filteredLogs.length} Entries Identified
                  </span>
                </div>
                <div className="p-4 font-mono text-[12px] h-[600px] overflow-y-auto custom-scrollbar bg-slate-950">
                  {loading && logs.length === 0 ? (
                    <div className="text-blue-500/50 animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      Initializing high-throughput telemetry stream...
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredLogs.map((log, i) => (
                        <div key={i} className="flex gap-4 group hover:bg-white/5 py-0.5 px-1 rounded transition-colors border-l-2 border-transparent hover:border-blue-500/30">
                          <span className="text-gray-600 shrink-0 select-none w-16">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={`shrink-0 font-bold w-12 text-center rounded-[2px] leading-none py-1 text-[10px] ${
                            log.level === 'ERROR' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            log.level === 'WARN' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                            log.level === 'DEBUG' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                            'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                            {log.level}
                          </span>
                          <span className="text-blue-400/80 w-24 shrink-0 font-black uppercase tracking-tighter text-[10px]">{log.service}</span>
                          <span className="text-gray-500 w-16 shrink-0 text-[10px]">{log.requestId}</span>
                          <span className="text-gray-300 group-hover:text-white transition-colors">{log.message}</span>
                        </div>
                      ))}
                      {filteredLogs.length === 0 && !loading && (
                        <div className="text-gray-500 italic py-12 text-center border border-dashed border-gray-800 rounded-lg">
                          No matching telemetry events discovered in the current partition.
                        </div>
                      )}
                      {!loading && <div className="w-full h-4 border-l-2 border-blue-500/50 ml-2 mt-2 animate-pulse" />}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
