import React from 'react';
import { 
  ShieldCheck, 
  Settings2, 
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Card, Button, Badge } from '@voiceguard/ui';

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

const MOCK_CRITERIA = [
  { id: 'AC-01', text: 'Call recording disclosure within 10s', status: 'PASS', info: 'Detected at 00:00', time: 0 },
  { id: 'AC-02', text: 'Identity verification (2 factors)', status: 'PASS', info: 'Card4 + ZIP at 00:31', time: 31 },
  { id: 'AC-03', text: 'PCI data never repeated by agent', status: 'PASS', info: 'Compliance', time: 10 },
  { id: 'AC-04', text: 'Empathy statement on complaint', status: 'PEND', info: '"I\'m sorry about the experience"', time: 50 },
  { id: 'AC-05', text: 'Resolution offered', status: 'PEND', info: 'Refund offered at 00:57', time: 57 },
];

export function ChecklistView({ currentTime }: { currentTime: number }) {
  const [overrides, setOverrides] = React.useState<Record<string, 'PASS' | 'FAIL'>>({});
  const passedCount = MOCK_CRITERIA.filter(c => overrides[c.id] === 'PASS' || (currentTime >= c.time && overrides[c.id] !== 'FAIL')).length;

  return (
    <Card className="h-full flex flex-col border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-none">Acceptance Criteria</h3>
            <p className="text-[10px] text-gray-400 font-medium">{passedCount}/{MOCK_CRITERIA.length} passed • 0 failed • {MOCK_CRITERIA.length - passedCount} pending</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
            <Settings2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
            <RotateCcw size={14} />
          </Button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-50 bg-gray-50/30">
        <MetricCard label="COMPLIANCE" value="33%" color="text-red-500" border="border-red-100" />
        <MetricCard label="RESOLUTION" value="—" color="text-gray-300" border="border-gray-100" />
        <MetricCard label="POLICY" value="100" color="text-green-500" border="border-green-100" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {MOCK_CRITERIA.map((item) => {
          const isAutoPassed = currentTime >= item.time;
          const status = overrides[item.id] || (isAutoPassed ? 'PASS' : 'PEND');
          const isPassed = status === 'PASS';

          return (
            <div 
              key={item.id}
              className={`group p-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-md hover:translate-x-1 ${
                isPassed 
                  ? 'bg-green-50/30 border-green-100/50' 
                  : status === 'FAIL' ? 'bg-red-50/30 border-red-100/50' : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                    isPassed ? 'bg-green-100 text-green-600' : status === 'FAIL' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                  }`}
                  onClick={() => {
                    const next = status === 'PASS' ? 'FAIL' : 'PASS';
                    setOverrides({ ...overrides, [item.id]: next as any });
                  }}
                >
                  {isPassed ? <CheckCircle2 size={14} /> : status === 'FAIL' ? <AlertCircle size={14} /> : <Clock size={14} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.id}</span>
                    <p className="text-xs font-bold text-gray-900">{item.text}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">{item.info}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={isPassed ? 'success' : status === 'FAIL' ? 'error' : 'neutral'} 
                  className="text-[9px] font-bold tracking-tight h-5 px-2"
                >
                  {status}
                </Badge>
                {overrides[item.id] && (
                  <div className="p-1 rounded-full bg-blue-100 text-blue-600" title="Manual Override">
                    <Settings2 size={10} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400">Report ID • RPT-1634</span>
        <Button variant="primary" size="sm" className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest px-4">
          Submit Final Report
        </Button>
      </div>
    </Card>
  );
}

function MetricCard({ label, value, color, border }: { label: string; value: string; color: string; border: string }) {
  return (
    <div className={cn("bg-white p-2.5 rounded-lg border shadow-sm transition-transform hover:scale-105 cursor-default", border)}>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-lg font-black tracking-tight", color)}>{value}</p>
    </div>
  );
}
