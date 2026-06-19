import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '@voiceguard/ui';

export function RiskHeatmap() {
  const getColor = (score: number) => {
    if (score > 85) return 'bg-[#10b981]'; // Green (Pass)
    if (score > 60) return 'bg-[#f59e0b]'; // Orange (Warn)
    if (score > 35) return 'bg-[#ef4444]'; // Red (Fail)
    if (score > 15) return 'bg-[#f472b6]'; // Pink (Idle)
    return 'bg-[#e5e7eb]'; // Gray (Idle)
  };

  return (
    <Card className="p-6 border-gray-100 shadow-sm bg-white overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-black tracking-widest text-gray-900 uppercase">Agent Performance Heatmap</h2>
          <p className="text-[10px] text-gray-400 font-bold mt-1">240 cells · 1 cell = 1 active call cluster · updated 1.4s ago</p>
        </div>
        <div className="flex gap-4 items-center">
            <LegendItem color="bg-[#10b981]" label="Pass" />
            <LegendItem color="bg-[#f59e0b]" label="Warn" />
            <LegendItem color="bg-[#ef4444]" label="Fail" />
            <LegendItem color="bg-[#e5e7eb]" label="Idle" />
        </div>
      </div>

      <div className="grid grid-cols-24 gap-1.5">
        {Array.from({ length: 240 }).map((_, i) => {
            const score = Math.random() * 100;
            return (
                <div 
                    key={i}
                    className={`aspect-square w-full rounded-[4px] transition-all duration-300 cursor-pointer ${getColor(score)} shadow-inner border border-black/5 hover:scale-125 hover:z-10`}
                />
            );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-gray-900">Sampling · 1.0x</span>
            <span className="cursor-pointer hover:text-gray-900">Last 5 minutes</span>
        </div>
        <div className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline font-black">
            Open Audit Workspace <TrendingRightIcon />
        </div>
      </div>
      
      <style jsx>{`
        .grid-cols-24 {
          grid-template-columns: repeat(24, minmax(0, 1fr));
        }
      `}</style>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-[3px] ${color}`} />
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
    </div>
  );
}

function TrendingRightIcon() {
    return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
}
