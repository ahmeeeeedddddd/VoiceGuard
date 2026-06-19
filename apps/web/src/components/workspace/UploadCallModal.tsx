import React, { useState } from 'react';
import { Upload, X, FileAudio, CheckCircle2, Loader2 } from 'lucide-react';
import { Button, Card } from '@voiceguard/ui';

export function UploadCallModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ingestion/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      setStatus('processing');
      // Simulate processing time
      setTimeout(() => setStatus('done'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Upload Call Recording</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="p-6">
          {status === 'idle' ? (
            <div 
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 transition-colors hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'audio/mpeg,audio/mp3';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files?.[0]) setFile(target.files[0]);
                };
                input.click();
              }}
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">Click or drag MP3 here</p>
                <p className="text-xs text-gray-400 font-medium">Only support .mp3 files (max 25MB)</p>
              </div>
              {file && (
                <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 border border-gray-200">
                  <FileAudio size={14} className="text-blue-500" />
                  {file.name}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="relative">
                {status === 'done' ? (
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                    <CheckCircle2 size={32} />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                )}
                {status !== 'done' && (
                  <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                    <circle 
                      cx="32" cy="32" r="30" 
                      fill="none" stroke="currentColor" strokeWidth="4" 
                      className="text-gray-100"
                    />
                    <circle 
                      cx="32" cy="32" r="30" 
                      fill="none" stroke="currentColor" strokeWidth="4" 
                      strokeDasharray="188.4"
                      strokeDashoffset={status === 'uploading' ? 100 : 30}
                      className="text-blue-600 transition-all duration-1000"
                    />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 capitalize tracking-tight">{status}...</p>
                <p className="text-xs text-gray-400 font-medium">
                  {status === 'uploading' && 'Transferring bytes to secure storage'}
                  {status === 'processing' && 'AI transcribing and validating script'}
                  {status === 'done' && 'Call ingested successfully!'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={status !== 'idle' && status !== 'done'}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            disabled={!file || status !== 'idle'} 
            onClick={handleUpload}
            className="shadow-md shadow-blue-100"
          >
            Start Ingestion
          </Button>
        </div>
      </Card>
    </div>
  );
}
