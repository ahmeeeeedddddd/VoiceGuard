import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { RiskHeatmap } from '@/components/dashboard/RiskHeatmap';
import { ManualUpload } from '@/components/dashboard/ManualUpload';
import { Card, Badge, Button } from '@voiceguard/ui';
import { 
  PlayCircle, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  MoreHorizontal,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const MOCK_ALERTS = [
  { id: '1', time: '00:12', agent: 'agent-31', msg: 'PCI data spoken without redaction prompt', severity: 'CRITICAL', code: 'C-04A2' },
  { id: '2', time: '00:34', agent: 'agent-07', msg: 'Disclosure script skipped (Section 3.2)', severity: 'WARNING', code: 'C-04A1' },
  { id: '3', time: '01:02', agent: 'agent-12', msg: 'Sentiment dropped below -0.4 for 18s', severity: 'INFO', code: 'C-049F' },
  { id: '4', time: '01:48', agent: 'agent-19', msg: 'Resolution confirmed · CSAT 5/5', severity: 'SUCCESS', code: 'C-049D' },
  { id: '5', time: '02:11', agent: 'agent-22', msg: 'Hold time exceeded 90s without notice', severity: 'WARNING', code: 'C-049A' },
  { id: '6', time: '02:40', agent: 'agent-04', msg: 'Profanity detected in agent channel', severity: 'CRITICAL', code: 'C-0497' },
];

const CLUSTERS = [
  { name: 'Billing EN-US', pass: 94, warn: 5, fail: 1 },
  { name: 'Retention EN-US', pass: 81, warn: 14, fail: 5 },
  { name: 'Tech Support EN-GB', pass: 88, warn: 9, fail: 3 },
  { name: 'Onboarding ES-MX', pass: 91, warn: 7, fail: 2 },
  { name: 'Collections EN-US', pass: 73, warn: 19, fail: 8 },
];

export default function Home() {
  const [calls, setCalls] = useState<any[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3001/audit/calls', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCalls(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  return (
    <AppLayout>
      <Head>
        <title>Overview | VoiceGuard AI</title>
      </Head>

      <div className="flex h-full">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-[1200px] mx-auto min-w-0">
          {/* Manual Upload Section */}
          <ManualUpload />

          {/* Heatmap Section */}
          <RiskHeatmap calls={calls} />

          {/* Cluster Breakdown Section */}
          <Card className="p-6 border-gray-100 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Cluster Breakdown</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                LIVE STREAM
              </div>
            </div>

            <div className="space-y-6">
              {CLUSTERS.map((cluster, idx) => (
                <div key={cluster.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Cluster {String(idx + 1).padStart(2, '0')} · {cluster.name}</span>
                    <div className="flex gap-4 text-[10px] font-black tracking-tighter">
                      <span className="text-green-500">{cluster.pass}%</span>
                      <span className="text-yellow-500">{cluster.warn}%</span>
                      <span className="text-red-500">{cluster.fail}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${cluster.pass}%` }} className="bg-green-500 h-full" />
                    <div style={{ width: `${cluster.warn}%` }} className="bg-yellow-400 h-full" />
                    <div style={{ width: `${cluster.fail}%` }} className="bg-red-500 h-full" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Alert Sidebar */}
        <aside className="w-80 border-l border-gray-100 bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col hidden lg:flex">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Live Alert Ticker</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400">8 events · 5m</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {MOCK_ALERTS.map((alert) => (
              <div key={alert.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer relative">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <AlertIcon severity={alert.severity} />
                        <span className="text-[10px] font-bold text-gray-500">{alert.time}</span>
                        <span className="text-[10px] font-black text-blue-600">{alert.agent}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-gray-300">{alert.code}</span>
                </div>
                <p className="text-[11px] font-bold text-gray-800 leading-relaxed pr-6">{alert.msg}</p>
                <MoreHorizontal size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            <span>auto-refresh · 2s</span>
            <button className="hover:text-gray-900 transition-colors">Pause</button>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}


function AlertIcon({ severity }: { severity: string }) {
  switch (severity) {
    case 'CRITICAL': return <div className="p-1 rounded bg-red-50 border border-red-100 text-red-500"><ShieldAlert size={10} /></div>;
    case 'WARNING': return <div className="p-1 rounded bg-yellow-50 border border-yellow-100 text-yellow-600"><AlertTriangle size={10} /></div>;
    case 'SUCCESS': return <div className="p-1 rounded bg-green-50 border border-green-100 text-green-500"><CheckCircle2 size={10} /></div>;
    default: return <div className="p-1 rounded bg-blue-50 border border-blue-100 text-blue-500"><Info size={10} /></div>;
  }
}
