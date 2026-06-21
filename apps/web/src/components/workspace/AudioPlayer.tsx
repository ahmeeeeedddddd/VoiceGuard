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
  setIsPlaying,
  audioUrl
}: { 
  currentTime: number; 
  setCurrentTime: (t: number) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  audioUrl?: string;
}) {
  const [duration, setDuration] = React.useState(0.1);
  const [volume, setVolume] = React.useState(0.7);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const fullAudioUrl = audioUrl
    ? audioUrl.startsWith('http') 
      ? audioUrl  // Already absolute (e.g., S3 URL from API-ingested call)
      : `http://localhost:3001/${audioUrl}` // Relative path from manual upload
    : '';

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Audio play failed', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  React.useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const progress = (currentTime / duration) * 100;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm">
      {fullAudioUrl && (
        <audio 
          ref={audioRef}
          src={fullAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}
      <div className="flex items-center gap-6">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-gray-400" onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}>
            <SkipBack size={20} />
          </Button>
          <Button 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-gray-400" onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}>
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Time */}
        <div className="text-xs font-mono text-gray-500 min-w-[70px]">
          <span className="text-gray-900 font-bold">{formatTime(currentTime)}</span> / {formatTime(duration)}
        </div>

        {/* Waveform Visualization */}
        <div className="flex-1 h-12 relative flex items-center gap-[2px] cursor-pointer" 
             onClick={(e: React.MouseEvent<HTMLDivElement>) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const newTime = (x / rect.width) * duration;
               setCurrentTime(newTime);
               if (audioRef.current) audioRef.current.currentTime = newTime;
             }}>
          {React.useMemo(() => {
            const seed = audioUrl ? audioUrl.length : 42;
            return Array.from({ length: 60 }).map((_, i) => {
              const heightCalc = ((Math.sin(i * seed) * 0.5 + 0.5) * 85) + (i % 3) * 10;
              const pseudoRandomHeight = Math.max(15, Math.min(100, heightCalc));
              return (
                <div 
                  key={`bg-${i}`}
                  className={`flex-1 rounded-full bg-gray-200 transition-colors duration-200`}
                  style={{ height: `${pseudoRandomHeight}%` }}
                />
              );
            });
          }, [audioUrl])}
          
          {/* Active wave overlay using clip-path for smooth progress */}
          <div 
            className="absolute inset-0 flex items-center gap-[2px] pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
          >
            {React.useMemo(() => {
              const seed = audioUrl ? audioUrl.length : 42;
              return Array.from({ length: 60 }).map((_, i) => {
                const heightCalc = ((Math.sin(i * seed) * 0.5 + 0.5) * 85) + (i % 3) * 10;
                const pseudoRandomHeight = Math.max(15, Math.min(100, heightCalc));
                return (
                  <div 
                    key={`fg-${i}`}
                    className="flex-1 rounded-full bg-blue-500 transition-none"
                    style={{ height: `${pseudoRandomHeight}%` }}
                  />
                );
              });
            }, [audioUrl])}
          </div>

          {/* Seek bar handler */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-10" style={{ left: `${progress}%` }}>
            <div className="w-2 h-2 rounded-full bg-blue-600 -ml-[3px] -mt-[1px]" />
          </div>
        </div>

        {/* Extra controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Volume2 size={18} />
            <div 
              className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const newVol = (e.clientX - rect.left) / rect.width;
                setVolume(Math.max(0, Math.min(1, newVol)));
              }}
            >
              <div 
                className="h-full bg-gray-400 rounded-full transition-all" 
                style={{ width: `${volume * 100}%` }}
              />
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
