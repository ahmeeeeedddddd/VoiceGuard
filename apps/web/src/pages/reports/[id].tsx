import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CallRecord, ChecklistRule, ChecklistResult } from '@voiceguard/shared';

interface WorkspaceData {
  call: CallRecord;
  rules: ChecklistRule[];
  automatedResults: ChecklistResult[];
}

export default function ReportView() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3001/audit/workspace/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Loading report...</div>;
  if (!data) return <div className="p-8 text-red-500">Report not found.</div>;

  const { call, rules } = data;
  const overrides = call.overrides || {};
  const notes = call.notes || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Actions (Hidden in Print) */}
        <div className="flex justify-between items-center print:hidden">
          <button onClick={() => router.back()} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Back
          </button>
          <button 
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Export PDF
          </button>
        </div>

        {/* Report Document */}
        <div className="bg-white shadow sm:rounded-lg p-8 print:shadow-none print:p-0">
          
          {/* Branding Header */}
          <div className="border-b border-gray-200 pb-6 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quality Audit Report</h1>
              <p className="text-sm text-gray-500 mt-1">Call ID: {call.externalId}</p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-indigo-600">{call.score ?? 0}%</h2>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mt-1">Overall Score</p>
            </div>
          </div>

          {/* Automatic Fail Banner */}
          {call.isAutomaticFail && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 print:border-red-500 print:bg-transparent">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-bold">
                    AUTOMATIC FAIL
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    This call missed one or more critical compliance items. Despite the numerical score, this audit is considered a failure.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-md print:bg-transparent print:border print:border-gray-200">
            <div>
              <span className="block text-xs text-gray-500 uppercase">Agent ID</span>
              <span className="block text-sm font-medium text-gray-900">{call.agentId || 'Unknown'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase">Audit Status</span>
              <span className="block text-sm font-medium text-gray-900">{call.status}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase">Last Audited</span>
              <span className="block text-sm font-medium text-gray-900">
                {call.lastAuditedAt ? new Date(call.lastAuditedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase">Audited By</span>
              <span className="block text-sm font-medium text-gray-900">{call.auditedBy || 'System / Auto'}</span>
            </div>
          </div>

          {/* Checklist Details */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">Checklist Evaluation</h3>
            <ul className="space-y-4">
              {rules.map(rule => {
                const override = overrides[rule.id];
                const autoResult = data.automatedResults?.find(r => r.ruleId === rule.id);
                const finalStatus = override ? override.status : (autoResult ? autoResult.status : 'N/A');
                
                return (
                  <li key={rule.id} className="border border-gray-100 rounded-md p-4 flex justify-between items-start print:border-gray-300">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {rule.requiredPhrase} {rule.isCriticalFail && <span className="text-red-500 text-xs ml-1">(Critical)</span>}
                      </p>
                      {override?.justification && (
                        <p className="text-sm text-gray-500 mt-2 italic flex items-center">
                          <span className="mr-2">📝 Note:</span> {override.justification}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        finalStatus === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {finalStatus}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">{rule.points} pts</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* General Notes */}
          {notes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">Reviewer Notes</h3>
              <div className="space-y-3">
                {notes.map((note, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 print:bg-transparent print:border print:border-gray-200">
                    <span className="font-mono text-xs text-indigo-600 mr-2">[{new Date(note.timestamp).toISOString().substr(11, 8)}]</span>
                    {note.text}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
