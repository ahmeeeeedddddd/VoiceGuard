import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@voiceguard/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Zap,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }: any) => {
  const isPositive = trend === 'up';
  return (
    <Card className="p-6 shadow-sm border-gray-100 flex flex-col justify-between h-full group hover:border-blue-200 transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
        <div className={`p-1.5 rounded-lg bg-${color}-50 text-${color}-500 group-hover:scale-110 transition-transform`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
        <div className="flex items-center gap-1.5 mt-2">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trendValue}
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">vs 24h</span>
        </div>
      </div>
    </Card>
  );
};

const GrowthChart = ({ data = [] }: { data?: number[] }) => {
  // SVG Mockup for a smooth line chart
  const chartData = data.length > 0 ? data : [0];
  const points = chartData.map((val, i) => `${(i / Math.max(chartData.length - 1, 1)) * 100},${100 - val}`).join(' ');
  
  return (
    <div className="relative w-full h-[300px] mt-8 bg-gray-50/30 rounded-xl border border-gray-100 overflow-hidden group">
      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <svg className="w-full h-full p-4 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[25, 50, 75].map(v => (
          <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="#f1f5f9" strokeWidth="0.5" />
        ))}
        {/* Main Line */}
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-sm"
        />
        {/* Area fill */}
        <polyline
          fill="url(#gradient)"
          stroke="none"
          points={`0,100 ${points} 100,100`}
          className="opacity-10"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Points */}
        {chartData.map((val, i) => (
          <circle 
            key={i} 
            cx={(i / Math.max(chartData.length - 1, 1)) * 100} 
            cy={100 - val} 
            r="0.8" 
            fill="white" 
            stroke="#2563eb" 
            strokeWidth="0.5" 
            className="hover:r-2 transition-all cursor-pointer"
          />
        ))}
      </svg>
      {/* Tooltip mockup */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border border-gray-100 p-2 rounded-lg text-[10px] font-bold shadow-sm">
        <div className="text-gray-400">CURRENT PERIOD</div>
        <div className="text-blue-600 text-sm">{chartData[chartData.length - 1].toFixed(2)}% Compliance</div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
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

  const totalCalls = calls.length;
  const criticalViolations = calls.filter(c => c.isAutomaticFail).length;
  const avgScore = totalCalls > 0 
    ? calls.reduce((acc, c) => acc + (c.score || 0), 0) / totalCalls 
    : 0;
  
  // Take last 15 calls for growth chart
  const growthData = calls.slice(-15).map(c => c.score || 0);
  if (growthData.length === 0) growthData.push(0);

  return (
    <AppLayout>
      <Head><title>Analytics | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Metrics Dashboard</h1>
              <p className="text-3xl font-black text-gray-900 tracking-tight">Performance Analytics</p>
              <p className="text-sm text-gray-500 mt-1">Cross-channel compliance trends and auditor performance metrics.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 rounded-md transition-all">24h</button>
                <button className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white text-gray-900 shadow-sm rounded-md transition-all">7d</button>
                <button className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 rounded-md transition-all">30d</button>
              </div>
            </div>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Audits" 
              value={totalCalls.toLocaleString()} 
              trend="up" 
              trendValue="+1" 
              icon={Clock} 
              color="blue" 
            />
            <StatCard 
              title="Compliance Score" 
              value={`${avgScore.toFixed(2)}%`} 
              trend="up" 
              trendValue="+0.1%" 
              icon={ShieldCheck} 
              color="green" 
            />
            <StatCard 
              title="Critical Violations" 
              value={criticalViolations.toString()} 
              trend="down" 
              trendValue="-1" 
              icon={AlertTriangle} 
              color="orange" 
            />
            <StatCard 
              title="Avg Audit Latency" 
              value="412 ms" 
              trend="down" 
              trendValue="-22ms" 
              icon={Zap} 
              color="blue" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <Card className="lg:col-span-2 p-8 shadow-sm border-gray-100 overflow-hidden relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Call Quality Growth</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Historical compliance index across all active audit clusters.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-200" />
                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Prev Period</span>
                  </div>
                </div>
              </div>
              <GrowthChart data={growthData} />
            </Card>

            {/* Side Distribution */}
            <div className="space-y-6">
              <Card className="p-6 shadow-sm border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Violations by Category</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Disclosure Failures', count: 12, color: 'bg-red-500', percent: 45 },
                    { label: 'Privacy Breach', count: 8, color: 'bg-orange-500', percent: 30 },
                    { label: 'Protocol Deviation', count: 5, color: 'bg-yellow-500', percent: 18 },
                    { label: 'Other', count: 2, color: 'bg-gray-400', percent: 7 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="text-gray-400">{item.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 border-t border-gray-50 flex items-center justify-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                  Full Report <ChevronRight size={10} />
                </button>
              </Card>

              <Card className="p-6 shadow-sm border-blue-600 bg-blue-600 text-white relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={120} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">AI Audit Accuracy</h3>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-black italic">99.9%</span>
                  <span className="text-green-300 text-xs font-bold leading-none uppercase tracking-widest">+0.02%</span>
                </div>
                <p className="text-[10px] font-medium leading-relaxed mt-4 opacity-80">
                  Your AI auditing precision is currently in the top 1% of enterprise implementations.
                </p>
                <div className="mt-6 flex gap-2">
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-green-400 w-[99.9%]" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
