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

export function ChecklistView({ currentTime, checklist = [], callId, isEditing = false, onToggleEdit }: { 
  currentTime: number; 
  checklist?: any[]; 
  callId: string;
  isEditing?: boolean;
  onToggleEdit?: () => void;
}) {
  const [localOverrides, setLocalOverrides] = React.useState<Record<string, 'PASS' | 'FAIL'>>({});
  
  // Also pass the auth header since the guard expects it
  const DEV_HEADERS = { 'Content-Type': 'application/json', 'x-mock-role': 'ADMIN' };

  const handleOverride = async (ruleId: string, status: 'PASSED' | 'FAILED') => {
    // Optimistic UI update
    setLocalOverrides(prev => ({ ...prev, [ruleId]: status === 'PASSED' ? 'PASS' : 'FAIL' }));
    try {
      await fetch(`http://localhost:3001/audit/workspace/${callId}/override`, {
        method: 'POST',
        headers: DEV_HEADERS,
        body: JSON.stringify({ ruleId, status, justification: 'Manual Auditor Override' }),
      });
    } catch (err) {
      console.error('Save override failed', err);
    }
  };

  const passedCount = checklist.filter(c => localOverrides[c.id] === 'PASS' || (c.status === 'PASS' && localOverrides[c.id] !== 'FAIL')).length;
  const failedCount = checklist.filter(c => localOverrides[c.id] === 'FAIL' || (c.status === 'FAIL' && localOverrides[c.id] !== 'PASS')).length;
  const pendingCount = checklist.length - passedCount - failedCount;

  const handleReportSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:3001/audit/workspace/${callId}/submit`, {
        method: 'POST',
        headers: DEV_HEADERS,
        body: JSON.stringify({ auditorName: 'User' }),
      });
      if (response.ok) {
        alert('Report submitted successfully! Returning to workspace index.');
        window.location.href = '/workspace';
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="h-full flex flex-col border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-none">Acceptance Criteria</h3>
            <p className="text-[10px] text-gray-400 font-medium">{passedCount}/{checklist.length} passed • {failedCount} failed • {pendingCount} pending</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={onToggleEdit}>
            <Settings2 size={14} className={isEditing ? 'text-blue-500' : ''} />
          </Button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-50 bg-gray-50/30">
        <MetricCard label="COMPLIANCE" value={passedCount > 0 ? `${Math.round((passedCount/checklist.length)*100)}%` : '0%'} color="text-red-500" border="border-red-100" />
        <MetricCard label="RESOLUTION" value="—" color="text-gray-300" border="border-gray-100" />
        <MetricCard label="POLICY" value="100" color="text-green-500" border="border-green-100" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {checklist.map((item) => {
          const status = localOverrides[item.id] || item.status || 'PEND';
          const isPassed = status === 'PASS';

          return (
            <div 
              key={item.id}
              className={`group p-3 rounded-xl border transition-all hover:shadow-md ${
                isPassed 
                  ? 'bg-green-50/30 border-green-100/50' 
                  : status === 'FAIL' ? 'bg-red-50/30 border-red-100/50' : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className={`p-1.5 rounded-lg flex items-center justify-center ${
                      isPassed ? 'bg-green-100 text-green-600' : status === 'FAIL' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 size={14} /> : status === 'FAIL' ? <AlertCircle size={14} /> : <Clock size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900">{item.name || item.text}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">{item.description || item.info}</p>
                    {item.aiReasoning && (
                      <div className="mt-1 flex items-start gap-1.5 opacity-80">
                        <MessageSquare size={10} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-blue-600/70 font-mono italic leading-tight">
                          AI: {item.aiReasoning}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isPassed ? 'success' : status === 'FAIL' ? 'error' : 'neutral'} 
                    className="text-[9px] font-bold tracking-tight h-5 px-2"
                  >
                    {status}
                  </Badge>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-3 pt-3 border-t border-gray-100/60 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[10px] gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                    onClick={() => handleOverride(item.id, 'PASSED')}
                  >
                    <CheckCircle2 size={12} /> Pass
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[10px] gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => handleOverride(item.id, 'FAILED')}
                  >
                    <AlertCircle size={12} /> Fail
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400">Report ID • {callId?.slice(0,8) || '....'}</span>
        <Button 
          variant="primary" 
          size="sm" 
          className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest px-4"
          onClick={handleReportSubmit}
        >
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
