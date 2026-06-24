import React from 'react';
import { MessageSquare, Download, CheckCircle2, Plus, StickyNote } from 'lucide-react';
import { Card, Badge, Button } from '@voiceguard/ui';
import { TranscriptPayload, TranscriptWord } from '@voiceguard/shared';

interface turn {
  time: string;
  speaker: 'AGENT' | 'CUSTOMER';
  text: string;
  startMs: number;
  endMs: number;
}

export function TranscriptView({ 
  currentTime, 
  onSeek, 
  transcript 
}: { 
  currentTime: number; 
  onSeek: (t: number) => void;
  transcript?: TranscriptPayload;
}) {
  const [notes, setNotes] = React.useState<Record<number, string>>({});
  const [activeNoteIdx, setActiveNoteIdx] = React.useState<number | null>(null);

  const formatMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Group words into conversational turns
  const turns = React.useMemo(() => {
    if (!transcript || !transcript.words || transcript.words.length === 0) return [];
    
    const result: turn[] = [];
    let currentTurn: { speaker: number; words: string[]; startMs: number; endMs: number } | null = null;

    const words = (transcript.words as TranscriptWord[]) || [];
    for (const w of words) {
      const speakerId = w.speaker ?? 0;
      
      if (!currentTurn || currentTurn.speaker !== speakerId) {
        if (currentTurn) {
          result.push({
            time: formatMs(currentTurn.startMs),
            speaker: (transcript.speakerLabels?.[currentTurn.speaker] as any) || 'AGENT',
            text: currentTurn.words.join(' '),
            startMs: currentTurn.startMs,
            endMs: currentTurn.endMs,
          });
        }
        currentTurn = { 
          speaker: speakerId, 
          words: [w.word], 
          startMs: w.startMs, 
          endMs: w.endMs 
        };
      } else {
        currentTurn.words.push(w.word);
        currentTurn.endMs = w.endMs;
      }
    }

    if (currentTurn) {
      result.push({
        time: formatMs(currentTurn.startMs),
        speaker: (transcript.speakerLabels?.[currentTurn.speaker] as any) || 'AGENT',
        text: currentTurn.words.join(' '),
        startMs: currentTurn.startMs,
        endMs: currentTurn.endMs,
      });
    }

    return result;
  }, [transcript]);

  const handleExportVtt = () => {
    if (!transcript || !turns.length) return;
    let vtt = "WEBVTT\n\n";
    turns.forEach((t) => {
      const start = new Date(t.startMs).toISOString().substring(11, 23);
      const end = new Date(t.endMs).toISOString().substring(11, 23);
      vtt += `${start} --> ${end}\n`;
      vtt += `<v ${t.speaker}>${t.text}\n\n`;
    });
    const blob = new Blob([vtt], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!transcript) {
    return (
      <Card className="h-full flex items-center justify-center border-gray-100 shadow-sm bg-white/80 grayscale opacity-50">
        <div className="text-center space-y-2">
          <MessageSquare className="mx-auto text-gray-300" size={32} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No transcript available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-none">Call Transcript</h3>
            <p className="text-[10px] text-gray-400 font-medium">{turns.length} turns • {transcript.language || 'English'}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider" onClick={handleExportVtt}>
          Export .vtt
          <Download size={12} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 relative">
        <div className="absolute inset-0 blueprint-bg pointer-events-none opacity-50" />
        
        {turns.map((turn, i) => {
          const isActive = (currentTime * 1000) >= turn.startMs && (currentTime * 1000) <= turn.endMs;

          return (
            <div 
              key={i} 
              className={`flex gap-4 p-3 rounded-lg transition-colors relative z-0 cursor-pointer ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
              onClick={() => onSeek(turn.startMs / 1000)}
            >
            <div className="w-10 text-[10px] font-mono text-gray-300 mt-1">{turn.time}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold tracking-widest ${turn.speaker === 'AGENT' ? 'text-blue-500' : 'text-orange-500'}`}>
                  {turn.speaker}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${turn.speaker === 'CUSTOMER' ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                {turn.text}
              </p>

              {activeNoteIdx === i ? (
                <div className="mt-2 flex gap-2 animate-in slide-in-from-top-1">
                  <input 
                    autoFocus
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Type audit note..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setNotes({ ...notes, [i]: e.currentTarget.value });
                        setActiveNoteIdx(null);
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" className="h-8 px-3 text-[10px]" onClick={() => setActiveNoteIdx(null)}>Cancel</Button>
                </div>
              ) : notes[i] ? (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-2 shadow-sm animate-in zoom-in duration-200">
                  <StickyNote size={12} className="text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-yellow-800 font-medium italic">"{notes[i]}"</p>
                  <button className="text-[10px] text-yellow-400 hover:text-yellow-600 ml-auto" onClick={() => setActiveNoteIdx(i)}>Edit</button>
                </div>
              ) : (
                isActive && (
                  <button 
                    className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors py-1 animate-in fade-in"
                    onClick={() => setActiveNoteIdx(i)}
                  >
                    <Plus size={12} />
                    ADD AUDIT NOTE
                  </button>
                )
              )}
            </div>
          </div>
          );
        })}
      </div>
    </Card>
  );
}
