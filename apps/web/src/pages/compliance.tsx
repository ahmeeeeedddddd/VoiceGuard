import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';

export default function CompliancePage() {
  return (
    <AppLayout>
      <Head><title>Compliance | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Overview</h1>
            <p className="text-2xl font-black text-gray-900 mt-1">Compliance</p>
            <p className="text-sm text-gray-500 mt-1">Compliance rule management and violation tracking.</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <p className="text-sm font-bold text-gray-500">Compliance module coming soon</p>
            <p className="text-xs text-gray-400 mt-1">Rule editing and violation reports will appear here.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
