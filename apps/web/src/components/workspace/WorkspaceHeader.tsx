import React from 'react';
import { 
  ChevronRight, 
  RotateCcw, 
  Edit3, 
  Download,
  Upload
} from 'lucide-react';
import { Button, Badge } from '@voiceguard/ui';
import { UploadCallModal } from './UploadCallModal';

interface WorkspaceHeaderProps {
  callId: string;
  agentName: string;
  group: string;
  duration: string;
  timestamp: string;
}

export function WorkspaceHeader({ callId, agentName, group, duration, timestamp }: WorkspaceHeaderProps) {
  const [showUpload, setShowUpload] = React.useState(false);

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
            <span>{duration} duration</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{timestamp}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="primary" 
          size="sm" 
          className="gap-2 text-xs h-9 shadow-md shadow-blue-100"
          onClick={() => setShowUpload(true)}
        >
          <Upload size={14} />
          Upload Call
        </Button>
        <Button variant="outline" size="sm" className="gap-2 text-xs h-9">
          <Edit3 size={14} />
          Edit checklist
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <RotateCcw size={16} />
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Download size={16} />
        </Button>
      </div>

      {showUpload && <UploadCallModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
