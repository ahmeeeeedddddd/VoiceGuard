import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <Head><title>Analytics | VoiceGuard AI</title></Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Insights</h1>
            <p className="text-2xl font-black text-gray-900 mt-1">Analytics</p>
            <p className="text-sm text-gray-500 mt-1">Aggregate performance metrics and historical reporting.</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <p className="text-sm font-bold text-gray-500">Analytics module coming soon</p>
            <p className="text-xs text-gray-400 mt-1">Charts and historical reports will appear here.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
