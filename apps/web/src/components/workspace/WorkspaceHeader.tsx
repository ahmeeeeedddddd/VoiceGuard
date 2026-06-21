import React from 'react';
import { useRouter } from 'next/router';
import { ChevronRight, Edit3 } from 'lucide-react';
import { Button, Badge } from '@voiceguard/ui';

interface WorkspaceHeaderProps {
  callId: string;
  agentName: string;
  group: string;
  duration: string;
  timestamp: string;
  onEditChecklist?: () => void;
}

export function WorkspaceHeader({ callId, agentName, group, duration, timestamp, onEditChecklist }: WorkspaceHeaderProps) {
  const router = useRouter();
  const displayTime = timestamp.includes('Invalid') ? 'Just now' : timestamp;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span>Audit Workspace</span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900">Call {callId}</span>
          <Badge variant="neutral" className="bg-white ml-2 text-[10px] h-5">LIVE</Badge>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Call {callId}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{agentName}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{group}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{duration}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{displayTime}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs h-9"
          onClick={() => router.push('/compliance')}
        >
          <Edit3 size={14} />
          Manage Criteria
        </Button>
      </div>
    </div>
  );
}
