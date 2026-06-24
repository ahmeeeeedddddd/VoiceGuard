import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '@voiceguard/ui';

export function RiskHeatmap({ calls = [] }: { calls?: any[] }) {
  const getColor = (score: number) => {
    if (score >= 75) return 'bg-[#10b981]'; // Green (Pass)
    if (score >= 50) return 'bg-[#f59e0b]'; // Orange (Warn)
    return 'bg-[#ef4444]'; // Red (Fail)
  };

  return (
    <Card className="p-6 border-gray-100 shadow-sm bg-white overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-black tracking-widest text-gray-900 uppercase">Agent Performance Heatmap</h2>
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
            const call = calls[i];
            const score = call && call.score != null ? call.score : 0;
            const isIdle = !call || call.score == null;
            return (
                <div 
                    key={i}
                    title={call ? `Call ${call.externalId}: ${score}%` : 'Idle'}
                    onClick={() => { if (call) window.location.href = `/workspace/${call.id}`; }}
                    className={`aspect-square w-full rounded-[4px] transition-all duration-300 cursor-pointer ${isIdle ? 'bg-[#e5e7eb]' : getColor(score)} shadow-inner border border-black/5 hover:scale-125 hover:z-10`}
                />
            );
        })}
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
