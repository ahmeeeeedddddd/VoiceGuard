import React from 'react';
import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { AudioPlayer } from '@/components/workspace/AudioPlayer';
import { TranscriptView } from '@/components/workspace/TranscriptView';
import { ChecklistView } from '@/components/workspace/ChecklistView';

export default function WorkspacePage() {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <AppLayout>
      <Head>
        <title>Audit Workspace | VoiceGuard AI</title>
      </Head>
      
      <div className="h-full flex flex-col p-6 gap-6 relative z-0">
        {/* Workspace Title & Info */}
        <WorkspaceHeader 
          callId="C-04A2" 
          agentName="agent-31" 
          group="Billing EN-US" 
          duration="01:37" 
          timestamp="captured 18:42 UTC"
        />

        {/* Top Pane: Audio player */}
        <AudioPlayer 
          currentTime={currentTime} 
          setCurrentTime={setCurrentTime} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying}
        />

        {/* Bottom Area: Transcript (Left/Center) & Checklist (Right) */}
        <div className="flex-1 flex gap-6 min-h-0">
          <div className="flex-[2] min-w-0">
            <TranscriptView currentTime={currentTime} onSeek={setCurrentTime} />
          </div>
          <div className="flex-1 min-w-[380px]">
            <ChecklistView currentTime={currentTime} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
