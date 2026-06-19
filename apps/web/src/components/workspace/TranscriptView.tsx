import { MessageSquare, Download, CheckCircle2, Plus, StickyNote } from 'lucide-react';
import { Card, Badge, Button } from '@voiceguard/ui';

const MOCK_TURNS = [
  {
    time: '00:00',
    speaker: 'AGENT',
    text: 'Thank you for calling Nimbus Telecom, this call is recorded for quality and compliance.',
    ruleMatched: true,
  },
  {
    time: '00:06',
    speaker: 'AGENT',
    text: 'My name is Alex. May I please have your account number?',
    ruleMatched: false,
  },
  {
    time: '00:11',
    speaker: 'CUSTOMER',
    text: "Sure, it's 8842-1190-AC.",
    ruleMatched: false,
  },
  {
    time: '00:15',
    speaker: 'AGENT',
    text: "Thanks. For your security, I'll verify two details before we continue.",
    ruleMatched: true,
  },
  {
    time: '00:22',
    speaker: 'CUSTOMER',
    text: 'Okay, go ahead.',
    ruleMatched: false,
  },
  {
    time: '00:24',
    speaker: 'AGENT',
    text: 'Can you confirm the last four of the card on file and your billing zip?',
    ruleMatched: false,
  },
];

export function TranscriptView({ currentTime, onSeek }: { currentTime: number; onSeek: (t: number) => void }) {
  const [notes, setNotes] = React.useState<Record<number, string>>({});
  const [activeNoteIdx, setActiveNoteIdx] = React.useState<number | null>(null);

  const parseTime = (timeStr: string) => {
    const [m, s] = timeStr.split(':').map(Number);
    return m * 60 + s;
  };

  return (
    <Card className="h-full flex flex-col border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-none">Live Transcript</h3>
            <p className="text-[10px] text-gray-400 font-medium">18 turns • auto-scroll synced to 00:45</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider">
          Export .vtt
          <Download size={12} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 relative">
        {/* Grid lines overlay to match design blueprint feel */}
        <div className="absolute inset-0 blueprint-bg pointer-events-none opacity-50" />
        
        {MOCK_TURNS.map((turn, i) => {
          const turnTime = parseTime(turn.time);
          const isActive = currentTime >= turnTime && (i === MOCK_TURNS.length - 1 || currentTime < parseTime(MOCK_TURNS[i+1].time));

          return (
            <div 
              key={i} 
              className={`flex gap-4 p-3 rounded-lg transition-colors relative z-0 cursor-pointer ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
              onClick={() => onSeek(turnTime)}
            >
            <div className="w-10 text-[10px] font-mono text-gray-300 mt-1">{turn.time}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold tracking-widest ${turn.speaker === 'AGENT' ? 'text-blue-500' : 'text-orange-500'}`}>
                  {turn.speaker}
                </span>
                {turn.ruleMatched && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-[9px] font-bold text-green-600 border border-green-100 uppercase tracking-tighter">
                    <span className="w-1 h-1 rounded-full bg-green-500" />
                    Rule Matched
                  </div>
                )}
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
          );
        })}
      </div>
    </Card>
  );
}
