import type { NextPage } from 'next';
import Head from 'next/head';
import { CallTicker } from '@/components/dashboard/CallTicker';

const DashboardPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>VoiceGuard AI — Dashboard</title>
        <meta name="description" content="Real-time call quality monitoring dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">VoiceGuard AI</h1>
              <p className="text-xs text-gray-400">Real-time Quality Assurance Platform</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            Management Dashboard
          </span>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-300">
              Live Call Feed
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time ingestion events and high-risk compliance alerts
            </p>
          </div>

          <div className="h-[calc(100vh-180px)]">
            <CallTicker />
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
