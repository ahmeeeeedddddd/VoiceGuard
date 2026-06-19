import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Maximize2
} from 'lucide-react';
import { Card, Button } from '@voiceguard/ui';

export function AudioPlayer({ 
  currentTime, 
  setCurrentTime, 
  isPlaying, 
  setIsPlaying 
}: { 
  currentTime: number; 
  setCurrentTime: (t: number) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
}) {
  const duration = 97; // 1:37 in seconds

  React.useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(Math.min(currentTime + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const progress = (currentTime / duration) * 100;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-gray-400">
            <SkipBack size={20} />
          </Button>
          <Button 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-gray-400">
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Time */}
        <div className="text-xs font-mono text-gray-500 min-w-[70px]">
          <span className="text-gray-900 font-bold">{formatTime(currentTime)}</span> / {formatTime(duration)}
        </div>

        {/* Waveform Visualization Mockup */}
        <div className="flex-1 h-12 relative flex items-center gap-[2px] cursor-pointer" 
             onClick={(e: React.MouseEvent<HTMLDivElement>) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               setCurrentTime((x / rect.width) * duration);
             }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div 
              key={i}
              className={`flex-1 rounded-full ${i < (progress * 0.6) ? 'bg-blue-500' : 'bg-gray-200'}`}
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
          {/* Seek bar handler */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-10 transition-all" style={{ left: `${progress}%` }}>
            <div className="w-2 h-2 rounded-full bg-blue-600 -ml-[3px] -mt-[1px]" />
          </div>
        </div>

        {/* Extra controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Volume2 size={18} />
            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-[70%] h-full bg-gray-400 rounded-full" />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Maximize2 size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
