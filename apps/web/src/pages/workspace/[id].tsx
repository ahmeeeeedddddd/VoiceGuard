import React from 'react';
import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { AudioPlayer } from '@/components/workspace/AudioPlayer';
import { TranscriptView } from '@/components/workspace/TranscriptView';
import { ChecklistView } from '@/components/workspace/ChecklistView';

import { useRouter } from 'next/router';

// Mock headers to bypass the RolesGuard in dev
const DEV_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'x-mock-role': 'ADMIN',
};

export default function WorkspacePage() {
  const router = useRouter();
  const { id } = router.query;
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [callData, setCallData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditingChecklist, setIsEditingChecklist] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3001/audit/workspace/${id}`, { headers: DEV_HEADERS })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // API returns { call, rules, automatedResults }
        setCallData(data);
      })
      .catch(err => {
        console.error('Failed to fetch call', err);
        setError(err.message);
      });
  }, [id]);

  if (error) return <AppLayout><div className="p-8 text-red-500">Error loading call: {error}</div></AppLayout>;
  if (!callData) return <AppLayout><div className="p-8 text-gray-400">Loading...</div></AppLayout>;

  const call = callData.call;
  const rules = callData.rules || [];

  // Build a checklist array by merging rules with automated results
  const automatedResults: any[] = callData.automatedResults || [];
  const overrides = call.overrides || {};
  
  const checklist = rules.map((rule: any) => {
    const autoResult = automatedResults.find((r: any) => r.ruleId === rule.id);
    const manualOverride = overrides[rule.id];
    
    let finalStatus = 'PEND';
    if (manualOverride) {
      finalStatus = manualOverride.status === 'PASSED' ? 'PASS' : 'FAIL';
    } else if (autoResult) {
      finalStatus = autoResult.status === 'PASSED' ? 'PASS' : 'FAIL';
    }

    return {
      id: rule.id,
      name: rule.name,
      description: rule.description || '',
      status: finalStatus,
      aiReasoning: autoResult?.aiReasoning,
    };
  });

  const durationLabel = call.transcript?.words?.length
    ? (() => {
        const lastWord = call.transcript.words[call.transcript.words.length - 1];
        const totalSec = Math.floor(lastWord.endMs / 1000);
        return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;
      })()
    : '00:00';

  const capturedAt = call.createdAt
    ? new Date(call.createdAt.endsWith('Z') ? call.createdAt : call.createdAt + 'Z').toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, day: 'numeric', month: 'short' })
    : 'Unknown';

  return (
    <AppLayout>
      <Head>
        <title>Audit Workspace | VoiceGuard AI</title>
      </Head>
      
      <div className="h-full flex flex-col p-6 gap-6 relative z-0">
        <WorkspaceHeader 
          callId={call.externalId} 
          agentName={call.agentId || 'Unknown'} 
          group="Compliance Check" 
          duration={durationLabel} 
          timestamp={`captured ${capturedAt}`}
          onEditChecklist={() => setIsEditingChecklist(e => !e)}
        />

        <AudioPlayer 
          currentTime={currentTime} 
          setCurrentTime={setCurrentTime} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying}
          audioUrl={call.audioUrl}
        />

        <div className="flex-1 flex gap-6 min-h-0">
          <div className="flex-[2] min-w-0">
            <TranscriptView 
              currentTime={currentTime} 
              onSeek={setCurrentTime} 
              transcript={call.transcript}
            />
          </div>
          <div className="flex-1 min-w-[380px]">
            <ChecklistView 
              currentTime={currentTime} 
              checklist={checklist}
              callId={call.id}
              isEditing={isEditingChecklist}
              onToggleEdit={() => setIsEditingChecklist(e => !e)}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
