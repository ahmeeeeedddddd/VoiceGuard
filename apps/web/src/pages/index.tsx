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



export default function Home() {
  const [calls, setCalls] = useState<any[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const fetchDashboard = () => {
      fetch('http://localhost:3001/audit/calls', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => setCalls(Array.isArray(data) ? data : []))
        .catch(console.error);
    };
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const liveAlerts = calls.slice(0, 8).map(call => ({
    id: call.id,
    time: new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    agent: call.agentId || 'Unknown',
    msg: call.isAutomaticFail ? 'Critical compliance violation detected' : call.status === 'COMPLETED' ? 'Audit verified successfully' : call.status === 'FAILED' ? 'Processing error encountered' : 'New call ingested',
    severity: call.riskLevel === 'HIGH' || call.isAutomaticFail ? 'CRITICAL' : call.riskLevel === 'MEDIUM' ? 'WARNING' : call.status === 'COMPLETED' ? 'SUCCESS' : 'INFO',
    code: call.externalId
  }));

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
            {liveAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">No recent alerts</div>
            ) : liveAlerts.map((alert) => (
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
