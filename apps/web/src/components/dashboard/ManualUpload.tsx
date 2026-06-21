import React from 'react';
import { Upload, FileAudio, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, Button } from '@voiceguard/ui';

export function ManualUpload() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/ingestion/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setStatus('success');
      setMessage(`Enqueued for audit! Call ID: ${data.id}`);
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Upload failed. Please check the API logs.');
    }
  };

  return (
    <Card className="p-6 border-gray-100 shadow-sm bg-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Upload size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Manual Call Upload</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Upload MP3/WAV recordings for compliance auditing</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
          <input 
            type="file" 
            accept="audio/*" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleFileChange}
          />
          {file ? (
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <FileAudio className="text-blue-500" size={24} />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800 truncate max-w-[200px]">{file.name}</p>
                <p className="text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-gray-300">
                <Upload size={20} />
              </div>
              <p className="text-xs font-bold text-gray-500">Drop audio file here or click to browse</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">Supports MP3, WAV, M4A</p>
            </>
          )}
        </div>

        {status === 'success' && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-700 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 size={16} />
            <p className="text-[11px] font-bold">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
            <p className="text-[11px] font-bold">{message}</p>
          </div>
        )}

        <Button 
          disabled={!file || status === 'uploading'} 
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-[12px] tracking-widest uppercase gap-2"
          onClick={handleUpload}
        >
          {status === 'uploading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Ingest Call for Audit'
          )}
        </Button>
      </div>
    </Card>
  );
}
