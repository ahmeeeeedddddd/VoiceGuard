import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CallRecord, ChecklistRule, ChecklistResult } from '@voiceguard/shared';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

interface WorkspaceData {
  call: CallRecord;
  rules: ChecklistRule[];
  automatedResults: ChecklistResult[];
}

export default function ReportView() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    setError(null);
    fetch(`http://localhost:3001/audit/workspace/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!json.call) throw new Error('Invalid response: missing call data');
        setData(json);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading report...</div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-red-500 font-bold text-sm">Could not load report.</p>
          <p className="text-gray-400 text-xs font-mono">{error}</p>
          <p className="text-gray-400 text-xs">Call ID: {id}</p>
          <button onClick={() => router.back()} className="mt-2 text-xs text-blue-600 hover:underline">← Go Back</button>
        </div>
      </AppLayout>
    );
  }

  const { call, rules } = data;
  const overrides = call.overrides || {};
  const notes = call.notes || [];

  let pointsEarned = 0;
  let totalPoints = 0;
  let isAutoFail = call.isAutomaticFail || false;

  rules.forEach(rule => {
    totalPoints += rule.points;
    const override = overrides[rule.id];
    const autoResult = data.automatedResults?.find(r => r.ruleId === rule.id);
    const finalStatus = override ? override.status : (autoResult ? autoResult.status : 'N/A');
    if (finalStatus === 'PASSED') {
      pointsEarned += rule.points;
    } else if (finalStatus === 'FAILED' && rule.isCriticalFail) {
      isAutoFail = true;
    }
  });

  const calculatedScore = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
  const displayScore = call.score !== undefined && call.score !== null ? call.score : calculatedScore;
  const displayStatus = isAutoFail ? 'FAILED' : (call.status === 'INGESTED' ? 'EVALUATING' : call.status);

  const handlePrint = () => window.print();

  return (
    <AppLayout>
      <Head>
        <title>Audit Report — {call.externalId} | VoiceGuard AI</title>
      </Head>

      <div className="flex-1 overflow-y-auto print:overflow-visible p-6 print:p-0">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header Actions — hidden in print */}
          <div className="flex justify-between items-center print:hidden">
            <div>
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Quality Audit Report</h2>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{call.externalId}</p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              Export PDF
            </button>
          </div>

          {/* Score Hero Card */}
          <div className={`rounded-xl p-6 flex items-center justify-between shadow-sm border ${isAutoFail ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Overall Score</p>
              <p className="text-6xl font-black text-gray-900">{displayScore}<span className="text-2xl text-gray-400">%</span></p>
            </div>
            <div className="text-right space-y-1">
              {isAutoFail ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-black text-red-700 uppercase tracking-wide">Automatic Fail</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-black text-green-700 uppercase tracking-wide">{displayStatus}</span>
                </div>
              )}
              {isAutoFail && (
                <p className="text-xs text-red-600 mt-2 max-w-[200px] leading-relaxed">
                  A critical compliance item was missed. This audit is a failure regardless of the score.
                </p>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Agent ID', value: call.agentId || 'Unknown' },
              { label: 'Status', value: displayStatus },
              { label: 'Last Audited', value: call.lastAuditedAt ? new Date(call.lastAuditedAt).toLocaleString() : 'Not yet submitted' },
              { label: 'Audited By', value: call.auditedBy || 'System / Auto' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Checklist Evaluation */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Checklist Evaluation</h3>
              <span className="text-[10px] font-bold text-gray-400">{rules.length} rules</span>
            </div>
            {rules.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No checklist rules found for this call.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {rules.map(rule => {
                  const override = overrides[rule.id];
                  const autoResult = data.automatedResults?.find(r => r.ruleId === rule.id);
                  const finalStatus = override ? override.status : (autoResult ? autoResult.status : 'N/A');
                  const isPassed = finalStatus === 'PASSED';
                  const isFailed = finalStatus === 'FAILED';

                  return (
                    <li key={rule.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {rule.requiredPhrase}
                          {rule.isCriticalFail && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-50 border border-red-100 text-red-500">Critical</span>
                          )}
                        </p>
                        {override?.justification && (
                          <p className="text-xs text-gray-500 mt-1 italic">📝 {override.justification}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-gray-300">{rule.points} pts</span>
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                          isPassed ? 'bg-green-50 text-green-700 border border-green-100' :
                          isFailed ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                          {finalStatus}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Reviewer Notes */}
          {notes.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Reviewer Notes</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {notes.map((note, idx) => (
                  <div key={idx} className="px-6 py-4 flex gap-3">
                    <span className="font-mono text-[10px] text-blue-500 shrink-0 mt-0.5">
                      [{String(Math.floor(note.timestamp / 1000 / 60)).padStart(2, '0')}:{String(Math.floor(note.timestamp / 1000) % 60).padStart(2, '0')}]
                    </span>
                    <p className="text-sm text-gray-700">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
